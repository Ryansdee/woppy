'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, MapPin, AlertCircle, Check, Calendar, Euro, Plus, X, FileText, Camera } from 'lucide-react';
import { auth, db, storage } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


interface Experience {
  id: string;
  title: string;
  description: string;
}

export default function RegisterForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Données du formulaire de base (OBLIGATOIRES)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    bio: '',
    profilePhoto: null as File | null,
    acceptTerms: false,
  });

  // Données du mini-CV étudiant (OPTIONNELLES)
  const [studentProfile, setStudentProfile] = useState({
    age: '',
    hourlyRate: '',
    description: '',
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState({ title: '', description: '' });
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  // Flag pour savoir si l'utilisateur veut compléter son profil étudiant maintenant
  const [wantsStudentProfile, setWantsStudentProfile] = useState<boolean | null>(null);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStudentProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStudentProfile({
      ...studentProfile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profilePhoto: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addExperience = () => {
    if (newExperience.title.trim()) {
      setExperiences([
        ...experiences,
        {
          id: Date.now().toString(),
          title: newExperience.title,
          description: newExperience.description,
        },
      ]);
      setNewExperience({ title: '', description: '' });
      setShowExperienceForm(false);
    }
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.city || !formData.bio) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Adresse email invalide');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    // Si l'utilisateur ne veut pas de profil étudiant, on passe
    if (wantsStudentProfile === false) {
      return true;
    }

    // Si l'utilisateur veut un profil étudiant, on valide
    if (wantsStudentProfile === true) {
      if (!studentProfile.age) {
        setError('Veuillez indiquer votre âge');
        return false;
      }

      const age = parseInt(studentProfile.age);
      if (age < 16 || age > 99) {
        setError('L\'âge doit être entre 16 et 99 ans');
        return false;
      }

      if (studentProfile.hourlyRate && (parseFloat(studentProfile.hourlyRate) < 0 || parseFloat(studentProfile.hourlyRate) > 100)) {
        setError('La rémunération horaire doit être entre 0 et 100€');
        return false;
      }
    }

    return true;
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep1()) {
      return;
    }

    setStep(2);
  };

const handleFinalSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!validateStep2()) return;

  setIsLoading(true);

  try {
    // 1. Créer le compte utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    const user = userCredential.user;

    // 2. Upload de la photo de profil dans Firebase Storage
    let photoURL = "";
    if (formData.profilePhoto) {
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, formData.profilePhoto);
      photoURL = await getDownloadURL(storageRef);

      // Met à jour le profil Firebase Auth
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
        photoURL,
      });
    }

    // 3. Sauvegarde des infos utilisateur dans Firestore
    const userDoc = {
      uid: user.uid,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      city: formData.city,
      bio: formData.bio,
      photoURL,
      createdAt: serverTimestamp(),
      hasStudentProfile: wantsStudentProfile === true,
      ...(wantsStudentProfile && {
        studentProfile: {
          ...studentProfile,
          experiences,
          isComplete: true,
        },
      }),
    };

    await setDoc(doc(db, "users", user.uid), userDoc);

    console.log("✅ Inscription réussie :", userDoc);
    window.location.href = "/dashboard";

  } catch (err: any) {
    console.error("Erreur Firebase :", err);
    if (err.code === "auth/email-already-in-use") {
      setError("Cette adresse email est déjà utilisée.");
    } else {
      setError("Une erreur est survenue lors de l'inscription.");
    }
  } finally {
    setIsLoading(false);
  }
};
const skipStudentProfile = async () => {
  try {
    setWantsStudentProfile(false);
    // On appelle directement la soumission finale
    await handleFinalSubmit(new Event('submit') as unknown as React.FormEvent);
  } catch (err) {
    console.error('Erreur lors du skipStudentProfile :', err);
  }
};

  return (
    <div className="w-full text-black max-w-2xl">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">W</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rejoignez Woppy</h1>
        <p className="text-gray-600">Créez votre compte en quelques minutes</p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
              step >= 1 ? 'bg-[#8a6bfe] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > 1 ? <Check size={20} /> : '1'}
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
              Informations de base
            </span>
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-[#8a6bfe]' : 'bg-gray-200'}`}></div>
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
              step >= 2 ? 'bg-[#8a6bfe] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
              Profil étudiant (optionnel)
            </span>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Étape 1 : Informations de base */}
      {step === 1 && (
        <form onSubmit={handleStep1Next} className="space-y-6">
          {/* Photo de profil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo de profil <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-gray-400" size={32} />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePhoto"
                  className="inline-block px-4 py-2 bg-[#8a6bfe] text-white rounded-lg cursor-pointer hover:bg-[#7a5bee] transition"
                >
                  Choisir une photo
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Format JPG, PNG ou WEBP - Max 5 Mo
                </p>
              </div>
            </div>
          </div>

          {/* Prénom */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              Prénom <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="text-gray-400" size={20} />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                placeholder="Jean"
                required
              />
            </div>
          </div>

          {/* Nom */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Nom <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="text-gray-400" size={20} />
              </div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                placeholder="Dupont"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-gray-400" size={20} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                placeholder="jean.dupont@example.com"
                required
              />
            </div>
          </div>

          {/* Ville */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              Ville <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="text-gray-400" size={20} />
              </div>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                placeholder="Louvain-la-Neuve"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Brève bio <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition resize-none"
              placeholder="Parlez-nous de vous en quelques mots..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Décrivez-vous brièvement (centres d'intérêt, études, etc.)
            </p>
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={20} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 caractères
            </p>
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={20} />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Conditions d'utilisation */}
          <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="w-5 h-5 text-[#8a6bfe] border-gray-300 rounded focus:ring-[#8a6bfe] mt-0.5"
              required
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-700">
              J'accepte les{' '}
              <Link href="/terms" className="text-[#8a6bfe] hover:underline font-medium" target="_blank">
                Conditions Générales d'Utilisation
              </Link>{' '}
              et la{' '}
              <Link href="/privacy" className="text-[#8a6bfe] hover:underline font-medium" target="_blank">
                Politique de Confidentialité
              </Link>{' '}
              de Woppy
            </label>
          </div>

          {/* Bouton suivant */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
          >
            Continuer
          </button>

          {/* Lien vers connexion */}
          <div className="text-center pt-4">
            <p className="text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/auth/login"
                className="text-[#8a6bfe] hover:text-[#7a5bee] font-semibold transition"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      )}

      {/* Étape 2 : Profil étudiant optionnel */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Question initiale si l'utilisateur n'a pas encore choisi */}
          {wantsStudentProfile === null && (
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-br from-[#8a6bfe]/10 to-[#b89fff]/10 rounded-2xl p-8">
                <FileText className="w-16 h-16 text-[#8a6bfe] mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-3">Souhaitez-vous créer votre profil étudiant ?</h2>
                <p className="text-gray-600 mb-6">
                  Complétez votre mini-CV pour augmenter vos chances de trouver des opportunités.
                  Vous pourrez toujours le faire plus tard.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setWantsStudentProfile(true)}
                    className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    Oui, créer mon profil
                  </button>
                  <button
                    onClick={skipStudentProfile}
                    className="bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:border-[#8a6bfe] hover:text-[#8a6bfe] transition"
                  >
                    Plus tard
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  💡 Les profils complets ont 3x plus de chances d'être contactés
                </p>
              </div>
            </div>
          )}

          {/* Formulaire de profil étudiant si l'utilisateur a choisi "Oui" */}
          {wantsStudentProfile === true && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="bg-gradient-to-br from-[#8a6bfe]/10 to-[#b89fff]/10 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-2">Complétez votre profil étudiant</h2>
                <p className="text-sm text-gray-600">
                  Ces informations aideront les employeurs à mieux vous connaître
                </p>
              </div>

              {/* Âge */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Âge <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="text-gray-400" size={20} />
                  </div>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="16"
                    max="99"
                    value={studentProfile.age}
                    onChange={handleStudentProfileChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                    placeholder="20"
                    required
                  />
                </div>
              </div>

              {/* Rémunération souhaitée */}
              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Rémunération horaire souhaitée <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Euro className="text-gray-400" size={20} />
                  </div>
                  <input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={studentProfile.hourlyRate}
                    onChange={handleStudentProfileChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                    placeholder="15.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Montant en euros par heure
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={studentProfile.description}
                  onChange={handleStudentProfileChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition resize-none"
                  placeholder="Parlez de vos compétences, vos expériences, ce que vous recherchez..."
                />
              </div>

              {/* Expériences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Expériences professionnelles <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>

                {/* Liste des expériences */}
                {experiences.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-[#8a6bfe] transition"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                          {exp.description && (
                            <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulaire d'ajout d'expérience */}
                {showExperienceForm ? (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <input
                      type="text"
                      value={newExperience.title}
                      onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                      placeholder="Titre du poste ou de l'expérience"
                    />
                    <textarea
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition resize-none"
                      placeholder="Description (optionnel)"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addExperience}
                        className="flex-1 bg-[#8a6bfe] text-white py-2 rounded-lg font-semibold hover:bg-[#7a5bee] transition"
                      >
                        Ajouter
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowExperienceForm(false);
                          setNewExperience({ title: '', description: '' });
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowExperienceForm(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-600 hover:border-[#8a6bfe] hover:text-[#8a6bfe] transition flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    <span className="font-medium">Ajouter une expérience</span>
                  </button>
                )}
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setWantsStudentProfile(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Confirmation de saut du profil étudiant */}
          {wantsStudentProfile === false && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">C'est noté !</h3>
                <p className="text-gray-600 mb-4">
                  Vous pourrez compléter votre profil étudiant à tout moment depuis vos paramètres.
                </p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-3 px-8 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}