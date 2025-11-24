'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  MapPin,
  Camera,
  Calendar,
  Plus,
  X,
  Euro,
  AlertCircle,
  Check,
} from 'lucide-react';

import { auth, db, storage } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

////////////////////////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////////////////////////

interface Experience {
  id: string;
  title: string;
  description: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

type WeekAvailability = Record<string, DayAvailability>;

////////////////////////////////////////////////////////////////////////////////
// COMPOSANT PRINCIPAL DU WIZARD
////////////////////////////////////////////////////////////////////////////////

export default function RegistrationWizard() {

  ////////////////////////////////////////////////////////////////////////////
  // ÉTAPES DU WIZARD
  ////////////////////////////////////////////////////////////////////////////

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  // L'utilisateur veut-il un compte étudiant ?
  const [wantsStudentProfile, setWantsStudentProfile] = useState<boolean | null>(null);

  ////////////////////////////////////////////////////////////////////////////
  // STATE GÉNÉRAL (Étape 1)
  ////////////////////////////////////////////////////////////////////////////

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    bioGeneral: '',
    profilePhoto: null as File | null,
  });

  ////////////////////////////////////////////////////////////////////////////
  // STATE ÉTUDIANT (Étape 2 → 5)
  ////////////////////////////////////////////////////////////////////////////

  const [studentData, setStudentData] = useState({
    studies: '',
    age: '',
    hourlyRate: '',
    description: '',
  });

  ////////////////////////////////////////////////////////////////////////////
  // DISPONIBILITÉS (Étape 3)
  ////////////////////////////////////////////////////////////////////////////

  const days = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

  const [availability, setAvailability] = useState<WeekAvailability>(() => {
    const base: WeekAvailability = {};
    days.forEach((d) => {
      base[d] = { enabled: false, slots: [] };
    });
    return base;
  });

  ////////////////////////////////////////////////////////////////////////////
  // EXPÉRIENCES (Étape 4)
  ////////////////////////////////////////////////////////////////////////////

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState({ title: '', description: '' });

  ////////////////////////////////////////////////////////////////////////////
  // UI STATE
  ////////////////////////////////////////////////////////////////////////////

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  ////////////////////////////////////////////////////////////////////////////
  // UTILITAIRES
  ////////////////////////////////////////////////////////////////////////////

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStudentInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  ////////////////////////////////////////////////////////////////////////////
  // UPLOAD PHOTO
  ////////////////////////////////////////////////////////////////////////////

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData({ ...formData, profilePhoto: file });
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  ////////////////////////////////////////////////////////////////////////////
  // VALIDATION ÉTAPE 1 (Infos générales)
  ////////////////////////////////////////////////////////////////////////////

  const validateStep1 = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.city
    ) {
      setError("Merci de remplir tous les champs obligatoires.");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("Adresse email invalide.");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return false;
    }

    return true;
  };

  ////////////////////////////////////////////////////////////////////////////
  // NAVIGATION ENTRE ÉTAPES (avec validations)
  ////////////////////////////////////////////////////////////////////////////

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    setError('');
    setStep((s) => (s + 1) as any);
  };

  const goBack = () => {
    if (step === 0) return;
    setStep((s) => (s - 1) as any);
  };

  ////////////////////////////////////////////////////////////////////////////
  // ANIMATION FRAMER POUR LES ÉTAPES
  ////////////////////////////////////////////////////////////////////////////

  const animatedWrap = (content: JSX.Element) => (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.25 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );

  ////////////////////////////////////////////////////////////////////////////
  // ÉTAPE 0 — Choix profil étudiant
  ////////////////////////////////////////////////////////////////////////////

  const renderStep0 = () => animatedWrap(
    <div className="text-center space-y-6">
      <div className="bg-gradient-to-br from-[#8a6bfe]/10 to-[#b89fff]/10 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-3">
          Souhaites-tu créer un profil étudiant ?
        </h2>
        <p className="text-gray-600 mb-6">
          Le profil étudiant augmente ta visibilité et te permet d’accéder aux missions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setWantsStudentProfile(true);
              setStep(1);
            }}
            className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-4 rounded-xl font-semibold"
          >
            Oui, créer mon profil étudiant
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setWantsStudentProfile(false);
              setStep(1);
            }}
            className="bg-white border-2 border-gray-300 py-4 rounded-xl font-semibold"
          >
            Non, continuer sans
          </motion.button>
        </div>
      </div>
    </div>
  );

  ////////////////////////////////////////////////////////////////////////////
  // ÉTAPE 1 — Infos générales (non étudiant)
  ////////////////////////////////////////////////////////////////////////////

  const renderStep1 = () => animatedWrap(
    <div className="space-y-6">

      <div className="bg-gradient-to-br from-[#8a6bfe]/10 to-[#b89fff]/10 p-6 rounded-xl">
        <h2 className="text-xl font-bold">Informations générales</h2>
        <p className="text-gray-600 text-sm">
          Ces informations sont nécessaires pour créer ton compte.
        </p>
      </div>

      {/* Photo */}
      <div>
        <label className="block text-sm font-medium mb-2">Photo de profil *</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">
            {photoPreview ? (
              <img src={photoPreview} className="w-full h-full object-cover" />
            ) : (
              <Camera className="text-gray-400" size={30} />
            )}
          </div>
          <motion.label
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 bg-[#8a6bfe] text-white rounded-lg cursor-pointer"
          >
            Choisir une photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </motion.label>
        </div>
      </div>

      {/* FIRST NAME */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Prénom *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleInput}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
            placeholder="Jean"
          />
        </div>
      </div>

      {/* LAST NAME */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Nom *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleInput}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
            placeholder="Dupont"
          />
        </div>
      </div>

      {/* EMAIL */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Email *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            name="email"
            value={formData.email}
            onChange={handleInput}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
            placeholder="jean@example.com"
          />
        </div>
      </div>

      {/* PASSWORD + CONFIRM */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Mot de passe *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInput}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Confirmer le mot de passe *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInput}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* CITY */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Ville *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            name="city"
            value={formData.city}
            onChange={handleInput}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
            placeholder="Louvain-la-Neuve"
          />
        </div>
      </div>

      {/* BIO GÉNÉRALE */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Courte bio
        </label>
        <textarea
          name="bioGeneral"
          value={formData.bioGeneral}
          onChange={handleInput}
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
          placeholder="Parlez de vous en quelques mots..."
        />
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-between pt-4">
        <div></div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white font-semibold"
        >
          Continuer
        </motion.button>
      </div>

    </div>
  );
  ////////////////////////////////////////////////////////////////////////////
  // ÉTAPE 2 — Infos étudiantes
  ////////////////////////////////////////////////////////////////////////////

  const renderStep2 = () => animatedWrap(
    <div className="space-y-6">

      <div className="bg-gradient-to-br from-[#8a6bfe]/10 to-[#b89fff]/10 p-6 rounded-xl">
        <h2 className="text-xl font-bold">Informations étudiantes</h2>
        <p className="text-gray-600 text-sm">
          Ces informations aident les employeurs à mieux te connaître.
        </p>
      </div>

      {/* Études */}
      <div>
        <label className="block text-sm font-medium mb-2">Études *</label>
        <input
          name="studies"
          value={studentData.studies}
          onChange={handleStudentInput}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
          placeholder="Ex : Bachelier en communication"
        />
      </div>

      {/* Âge */}
      <div>
        <label className="block text-sm font-medium mb-2">Âge *</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 text-gray-400" size={18}/>
          <input
            name="age"
            type="number"
            value={studentData.age}
            onChange={handleStudentInput}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
            placeholder="20"
          />
        </div>
      </div>

      {/* Rate */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rémunération souhaitée (€/h)
        </label>
        <div className="relative">
          <Euro className="absolute left-3 top-3 text-gray-400" size={18}/>
          <input
            name="hourlyRate"
            type="number"
            step="0.5"
            min={0}
            max={100}
            value={studentData.hourlyRate}
            onChange={handleStudentInput}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
            placeholder="15.00"
          />
        </div>
      </div>

      {/* Description étudiante */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Description du profil étudiant
        </label>
        <textarea
          name="description"
          value={studentData.description}
          onChange={handleStudentInput}
          rows={4}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
          placeholder="Parle de tes compétences, tes études, ton expérience..."
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goBack}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700"
        >
          Retour
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white font-semibold"
        >
          Continuer
        </motion.button>
      </div>

    </div>
  );

  ////////////////////////////////////////////////////////////////////////////
  // ÉTAPE 3 — Disponibilités multi-créneaux
  ////////////////////////////////////////////////////////////////////////////

  const addSlot = (day: string) => {
    const updated = { ...availability };
    updated[day].slots.push({ start: '', end: '' });
    setAvailability(updated);
  };

  const updateSlot = (
    day: string,
    index: number,
    field: keyof TimeSlot,
    value: string
  ) => {
    const updated = { ...availability };
    updated[day].slots[index][field] = value;
    setAvailability(updated);
  };

  const removeSlot = (day: string, index: number) => {
    const updated = { ...availability };
    updated[day].slots.splice(index, 1);
    setAvailability(updated);
  };

  const renderStep3 = () => animatedWrap(
    <div className="space-y-6">

      <div className="bg-gradient-to-br from-[#8a6bfe]/10 to-[#b89fff]/10 p-6 rounded-xl">
        <h2 className="text-xl font-bold">Disponibilités</h2>
        <p className="text-gray-600 text-sm">
          Tu peux ajouter plusieurs créneaux dans une même journée.
        </p>
      </div>

      {/* Liste des jours */}
      {days.map((day) => (
        <div key={day} className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold">{day}</span>
            <input
              type="checkbox"
              className="w-5 h-5 accent-[#8a6bfe]"
              checked={availability[day].enabled}
              onChange={(e) => {
                const updated = { ...availability };
                updated[day].enabled = e.target.checked;
                setAvailability(updated);
              }}
            />
          </div>

          {/* Créneaux */}
          {availability[day].enabled && (
            <div className="space-y-3">
              {availability[day].slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateSlot(day, i, "start", e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1"
                  />
                  <span className="text-gray-600">→</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateSlot(day, i, "end", e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1"
                  />

                  <button
                    onClick={() => removeSlot(day, i)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}

              {/* Ajouter créneau */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => addSlot(day)}
                className="flex items-center gap-2 text-[#8a6bfe] font-medium"
              >
                <Plus size={18} /> Ajouter un créneau
              </motion.button>
            </div>
          )}
        </div>
      ))}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goBack}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700"
        >
          Retour
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white font-semibold"
        >
          Continuer
        </motion.button>
      </div>

    </div>
  );

  ////////////////////////////////////////////////////////////////////////////
  // ÉTAPE 4 — Expériences
  ////////////////////////////////////////////////////////////////////////////

  const addExperience = () => {
    if (!newExperience.title.trim()) return;
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        title: newExperience.title,
        description: newExperience.description,
      },
    ]);
    setNewExperience({ title: '', description: '' });
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const renderStep4 = () => animatedWrap(
    <div className="space-y-6">

      <div className="bg-gradient-to-br from-[#8a6bfe]/10 to-[#b89fff]/10 p-6 rounded-xl">
        <h2 className="text-xl font-bold">Expériences</h2>
        <p className="text-gray-600 text-sm">
          Ajoute tes expériences (optionnel).
        </p>
      </div>

      {/* Liste */}
      {experiences.length > 0 && (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start"
            >
              <div>
                <h4 className="font-semibold">{exp.title}</h4>
                {exp.description && (
                  <p className="text-sm text-gray-600">{exp.description}</p>
                )}
              </div>

              <button
                onClick={() => removeExperience(exp.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={18}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire ajout */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
        <input
          type="text"
          value={newExperience.title}
          onChange={(e) =>
            setNewExperience({ ...newExperience, title: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Titre de l'expérience"
        />

        <textarea
          rows={2}
          value={newExperience.description}
          onChange={(e) =>
            setNewExperience({ ...newExperience, description: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Description (optionnel)"
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={addExperience}
          className="w-full bg-[#8a6bfe] text-white py-2 rounded-lg"
        >
          Ajouter
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goBack}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700"
        >
          Retour
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white font-semibold"
        >
          Continuer
        </motion.button>
      </div>

    </div>
  );
  ////////////////////////////////////////////////////////////////////////////
  // ÉTAPE 5 — Bio étudiante + final
  ////////////////////////////////////////////////////////////////////////////

  const renderStep5 = () => animatedWrap(
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#8a6bfe]/10 to-[#b89fff]/10 p-6 rounded-xl">
        <h2 className="text-xl font-bold">Bio étudiante</h2>
        <p className="text-gray-600 text-sm">
          Un dernier mot pour te présenter aux employeurs.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Bio étudiante
        </label>
        <textarea
          name="bioStudent"
          value={(studentData as any).bioStudent || ''}
          onChange={(e) =>
            setStudentData({ ...studentData, bioStudent: e.target.value } as any)
          }
          rows={4}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
          placeholder="Explique ce que tu recherches, tes atouts comme étudiant..."
        />
      </div>

      <div className="flex justify-between pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goBack}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700"
        >
          Retour
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmitFinal}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Création...
            </>
          ) : (
            <>
              Terminer
              <Check size={18} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );

  ////////////////////////////////////////////////////////////////////////////
  // SOUMISSION FINALE — Création Firebase Auth + Firestore
  ////////////////////////////////////////////////////////////////////////////

  const handleSubmitFinal = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Création du compte Auth
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCred.user;

      // 2. Upload photo si présente
      let photoURL = '';
      if (formData.profilePhoto) {
        const storageRef = ref(
          storage,
          `profilePhotos/${user.uid}/${formData.profilePhoto.name}`
        );
        await uploadBytes(storageRef, formData.profilePhoto);
        photoURL = await getDownloadURL(storageRef);

        await updateProfile(user, {
          displayName: `${formData.firstName} ${formData.lastName}`,
          photoURL,
        });
      }

      // 3. Construction du document Firestore
      const baseDoc = {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        city: formData.city,
        bio: formData.bioGeneral,
        photoURL,
        createdAt: serverTimestamp(),
      };

      let finalDoc: any = baseDoc;

      if (wantsStudentProfile) {
        finalDoc = {
          ...baseDoc,
          hasStudentProfile: true,
          studentProfile: {
            studies: studentData.studies,
            age: studentData.age,
            hourlyRate: studentData.hourlyRate,
            description: studentData.description,
            availability,
            experiences,
            bio: (studentData as any).bioStudent || '',
            isComplete: true,
          },
        };
      } else {
        finalDoc = {
          ...baseDoc,
          hasStudentProfile: false,
        };
      }

      // 4. Sauvegarde Firestore
      await setDoc(doc(db, 'users', user.uid), finalDoc);

      // 5. Redirection
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Erreur Firebase :', err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Cette adresse email est déjà utilisée.");
      } else {
        setError("Une erreur est survenue lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // RENDER FINAL — Stepper + routing d’étapes
  ////////////////////////////////////////////////////////////////////////////

  const stepTitlesStudent = [
    'Choix',
    'Infos',
    'Étudiant',
    'Dispos',
    'Expériences',
    'Bio',
  ];

  const stepTitlesNonStudent = [
    'Choix',
    'Infos',
    'Finalisation',
  ];

  const titles = wantsStudentProfile ? stepTitlesStudent : stepTitlesNonStudent;

  const renderCurrentStep = () => {
    if (step === 0) return renderStep0();
    if (step === 1) return renderStep1();

    // Non-étudiant → on ne pose plus de questions après l'étape 1
    if (!wantsStudentProfile) {
      return animatedWrap(
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Prêt à créer ton compte
            </h2>
            <p className="text-gray-600 text-sm">
              Tes informations de base sont complètes. Tu pourras plus tard
              ajouter un profil étudiant depuis ton tableau de bord.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={goBack}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700"
            >
              Retour
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmitFinal}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création...
                </>
              ) : (
                'Créer mon compte'
              )}
            </motion.button>
          </div>
        </div>
      );
    }

    // Étudiant → parcours complet
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    if (step === 4) return renderStep4();
    if (step === 5) return renderStep5();

    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-black">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">W</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Rejoignez Woppy
        </h1>
        <p className="text-gray-600">
          Crée ton compte en quelques étapes simples.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between">
        {titles.map((title, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <motion.div
              animate={step === i ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={`
                w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold mb-1
                ${step >= i ? 'bg-[#8a6bfe] text-white' : 'bg-gray-200 text-gray-500'}
              `}
            >
              {i}
            </motion.div>
            <span
              className={`text-xs font-medium ${
                step >= i ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {title}
            </span>
          </div>
        ))}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Contenu de l'étape courante */}
      {renderCurrentStep()}

      {/* Lien connexion */}
      <div className="text-center mt-8">
        <p className="text-gray-600 text-sm">
          Tu as déjà un compte ?{' '}
          <Link
            href="/auth/login"
            className="text-[#8a6bfe] hover:text-[#7a5bee] font-semibold"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
