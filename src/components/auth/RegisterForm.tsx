'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, MapPin, AlertCircle, Check, Briefcase, Users, Calendar, Euro, Plus, X, FileText } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  description: string;
}

export default function RegisterForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<'student' | 'employer' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Données du formulaire de base
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    phone: '',
    acceptTerms: false,
  });

  // Données spécifiques étudiant
  const [studentData, setStudentData] = useState({
    age: '',
    hourlyRate: '',
    description: '',
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState({ title: '', description: '' });
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStudentDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAccountTypeSelect = (type: 'student' | 'employer') => {
    setAccountType(type);
    setStep(2);
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

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.city) {
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

    // Validation spécifique étudiant
    if (accountType === 'student') {
      if (!studentData.age) {
        setError('Veuillez indiquer votre âge');
        return false;
      }

      const age = parseInt(studentData.age);
      if (age < 16 || age > 99) {
        setError('L\'âge doit être entre 16 et 99 ans');
        return false;
      }

      if (studentData.hourlyRate && (parseFloat(studentData.hourlyRate) < 0 || parseFloat(studentData.hourlyRate) > 100)) {
        setError('La rémunération horaire doit être entre 0 et 100€');
        return false;
      }
    }

    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Remplacer par votre appel API réel
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const registrationData = {
        ...formData,
        accountType,
        ...(accountType === 'student' && {
          studentProfile: {
            ...studentData,
            experiences,
          },
        }),
      };

      console.log('Registration successful', registrationData);
      // Redirection après succès
      // window.location.href = '/onboarding';
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
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
              Type de compte
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
              Informations
            </span>
          </div>
        </div>
      </div>

      {/* Étape 1 : Sélection du type de compte */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Quel type de compte souhaitez-vous créer ?</h2>
            <p className="text-gray-600">Choisissez le profil qui vous correspond</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Compte Étudiant */}
            <button
              onClick={() => handleAccountTypeSelect('student')}
              className="p-8 rounded-2xl border-2 border-gray-200 hover:border-[#8a6bfe] hover:bg-[#f5e5ff] transition-all text-left group"
            >
              <div className="w-16 h-16 bg-[#8a6bfe] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Je suis étudiant</h3>
              <p className="text-gray-600 mb-4">
                Je cherche des jobs flexibles et des missions ponctuelles pour gagner de l'argent.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={16} />
                  <span>Postuler aux annonces</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={16} />
                  <span>Créer un profil public</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={16} />
                  <span>Recevoir des propositions</span>
                </li>
              </ul>
            </button>

            {/* Compte Employeur */}
            <button
              onClick={() => handleAccountTypeSelect('employer')}
              className="p-8 rounded-2xl border-2 border-gray-200 hover:border-[#8a6bfe] hover:bg-[#f5e5ff] transition-all text-left group"
            >
              <div className="w-16 h-16 bg-[#b89fff] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Je cherche de l'aide</h3>
              <p className="text-gray-600 mb-4">
                Je suis un particulier ou une entreprise qui cherche des étudiants pour des missions.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={16} />
                  <span>Publier des annonces</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={16} />
                  <span>Parcourir les profils</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={16} />
                  <span>Choisir vos étudiants</span>
                </li>
              </ul>
            </button>
          </div>

          {/* Lien vers connexion */}
          <div className="text-center pt-6">
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
        </div>
      )}

      {/* Étape 2 : Formulaire d'inscription */}
      {step === 2 && accountType && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Badge type de compte */}
          <div className="bg-[#f5e5ff] border border-[#8a6bfe]/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {accountType === 'student' ? (
                <Users className="text-[#8a6bfe]" size={24} />
              ) : (
                <Briefcase className="text-[#8a6bfe]" size={24} />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {accountType === 'student' ? 'Compte Étudiant' : 'Compte Employeur'}
                </p>
                <p className="text-sm text-gray-600">
                  {accountType === 'student' 
                    ? 'Vous recherchez des missions flexibles'
                    : 'Vous proposez des missions'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-[#8a6bfe] hover:underline font-medium"
            >
              Modifier
            </button>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Nom et Prénom */}
          <div className="grid md:grid-cols-2 gap-4">
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
                placeholder="jean.dupont@email.com"
                required
              />
            </div>
          </div>

          {/* Champs spécifiques étudiant */}
          {accountType === 'student' && (
            <>
              {/* Âge et Ville */}
              <div className="grid md:grid-cols-2 gap-4">
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
                      value={studentData.age}
                      onChange={handleStudentDataChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                      placeholder="18"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 16 ans</p>
                </div>

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
                    min="0"
                    max="100"
                    step="0.5"
                    value={studentData.hourlyRate}
                    onChange={handleStudentDataChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                    placeholder="12.50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Indiquez votre tarif horaire souhaité (vous pourrez le modifier plus tard)
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Présentez-vous <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={studentData.description}
                    onChange={handleStudentDataChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition resize-none"
                    placeholder="Ex: Étudiant en informatique, sérieux et motivé. J'ai de l'expérience dans le déménagement et la garde d'enfants..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Cette description sera visible sur votre profil public
                </p>
              </div>

              {/* Expériences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expériences <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>
                
                {/* Liste des expériences */}
                {experiences.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="bg-[#f5e5ff] border border-[#8a6bfe]/20 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{exp.title}</p>
                            {exp.description && (
                              <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExperience(exp.id)}
                            className="text-red-500 hover:text-red-700 transition p-1"
                          >
                            <X size={18} />
                          </button>
                        </div>
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
                      placeholder="Ex: Serveur, Déménageur, Baby-sitter..."
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
            </>
          )}

          {/* Ville pour employeur */}
          {accountType === 'employer' && (
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
          )}

          {/* Téléphone (optionnel) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone <span className="text-gray-400 text-xs">(optionnel pour le moment)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
              placeholder="+32 4XX XX XX XX"
            />
            <p className="text-xs text-gray-500 mt-1">
              La vérification par téléphone sera disponible prochainement
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

          {/* Boutons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
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
    </div>
  );
}