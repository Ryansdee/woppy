'use client';

//////////////////////////////////////////////////////////
// IMPORTS
//////////////////////////////////////////////////////////
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import NextImage from 'next/image';
import Image from 'next/image';
import {
  Loader2,
  Save,
  Upload,
  Plus,
  Trash2,
  User,
  Calendar,
  Briefcase,
  GraduationCap,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';


//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

// Expériences du CV
interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

// User Profile Firestore
interface UserProfile {
  availabilitySchedule: any;
  experiences?: Experience[];
  firstName?: string;
  lastName?: string;
  bio?: string;
  city?: string;
  photoURL?: string;
  hasStudentProfile?: boolean;
  isAvailable?: boolean;
  studentProfile?: {
    age?: string;
    description?: string;
    cardURL?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
  };
}

type CroppedArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

//////////////////////////////////////////////////////////
// HELPERS POUR LE CROP DE L'IMAGE
//////////////////////////////////////////////////////////

// Convertir une image URL en HTMLImageElement
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

// Générer le blob final après crop
async function getCroppedImage(imageSrc: string, pixelCrop: CroppedArea) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas context not found');

  // On prend la taille du crop comme taille finale
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas is empty'));
      resolve(blob);
    }, 'image/jpeg');
  });
}


//////////////////////////////////////////////////////////
// COMPONENTE PRINCIPAL
//////////////////////////////////////////////////////////

export default function DashboardProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const onCropComplete = useCallback((_: any, croppedPixels: CroppedArea) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const router = useRouter();
  const storage = getStorage();

  ////////////////////////////////////////
  // ÉTATS POUR LE CROP IMAGE
  ////////////////////////////////////////
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  ////////////////////////////////////////
  // AUTH
  ////////////////////////////////////////

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  ////////////////////////////////////////
  // CHARGER LE PROFIL
  ////////////////////////////////////////

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  ////////////////////////////////////////
  // SAUVEGARDE DU PROFIL
  ////////////////////////////////////////

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: serverTimestamp(),
      });

      alert('Profil mis à jour avec succès ! ✨');
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  ////////////////////////////////////////
  // GESTION DU CROP → Upload photo profil
  ////////////////////////////////////////

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRawFile(file);
    const preview = URL.createObjectURL(file);
    setSelectedImage(preview);
    setShowCropper(true);
  };

  const handleCropSave = async () => {
    if (!rawFile || !selectedImage || !user || !croppedAreaPixels) {
      alert('Aucun crop valide détecté.');
      return;
    }

    try {
      const croppedBlob = await getCroppedImage(selectedImage, croppedAreaPixels);

      const storageRef = ref(storage, `profilePhotos/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, croppedBlob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL,
        updatedAt: serverTimestamp(),
      });

      setProfile({ ...profile!, photoURL: downloadURL });
      setShowCropper(false);
      setSelectedImage(null);
      setRawFile(null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors du recadrage de la photo.');
    }
  };

  ////////////////////////////////////////
  // COMPTE ÉTUDIANT → ACTIVATION DIRECTE
  ////////////////////////////////////////

  const activateStudentAccount = async () => {
    if (!user || !profile) return;

    const updated = {
      ...profile,
      hasStudentProfile: true,
      studentProfile: {
        verificationStatus: 'verified' as const
      },
    };

    await updateDoc(doc(db, 'users', user.uid), {
      hasStudentProfile: true,
      studentProfile: updated.studentProfile,
    });

    setProfile(updated);
  };

  ////////////////////////////////////////
  // EXPÉRIENCES
  ////////////////////////////////////////

  const handleAddExperience = () => {
    const newExp: Experience = {
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
    };

    setProfile({
      ...profile!,
      experiences: [...(profile?.experiences || []), newExp],
    });
  };

  const handleRemoveExperience = (i: number) => {
    const updated = [...(profile?.experiences || [])];
    updated.splice(i, 1);
    setProfile({ ...profile!, experiences: updated });
  };

  const handleUpdateExperience = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    const updated = [...(profile?.experiences || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile!, experiences: updated });
  };

  ////////////////////////////////////////
  // MISE À JOUR MULTI-CRÉNEAUX
  ////////////////////////////////////////

  const updateDaySlots = (day: string, newSlots: any[]) => {
    setProfile((prev) => ({
      ...prev!,
      availabilitySchedule: {
        ...prev!.availabilitySchedule,
        [day]: {
          enabled: true,
          slots: newSlots,
        },
      },
    }));
  };

  ////////////////////////////////////////
  // CHARGEMENT
  ////////////////////////////////////////

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#8a6bfe] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <div className="text-center">
          <p className="text-gray-700 text-lg">Aucun profil trouvé.</p>
        </div>
      </div>
    );

  //////////////////////////////////////////////////////////
  // UI PRINCIPALE (JSX)
  //////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header avec gradient Woppy */}
      <div className="bg-gradient-to-r from-[#6b4fd9] via-[#8a6bfe] to-[#7b5bef] text-white shadow-xl">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-2xl">
                <NextImage
                  src={
                    profile.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${profile.firstName || ''} ${profile.lastName || ''}`
                    )}&background=8a6bfe&color=fff`
                  }
                  alt="Photo de profil"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              {profile.hasStudentProfile && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {profile.firstName || profile.lastName
                  ? `${profile.firstName || ''} ${profile.lastName || ''}`
                  : 'Mon profil'}
              </h1>
              <div className="flex items-center gap-4 text-purple-100">
                {profile.city && (
                  <span className="flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    {profile.city}
                  </span>
                )}
                {profile.hasStudentProfile && (
                  <span className="flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-full">
                    <GraduationCap className="w-4 h-4" />
                    Compte Étudiant
                  </span>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-xl">
              <Upload className="w-4 h-4" />
              Changer la photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar gauche */}
          <div className="space-y-6">
            {/* Type de compte */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-xl flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Type de compte
                </h2>
              </div>

              {profile.hasStudentProfile ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                    <CheckCircle className="w-5 h-5" />
                    Compte étudiant actif
                  </div>
                  <p className="text-sm text-green-600">
                    Profitez de tous les avantages étudiants sur Woppy
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">
                    Activez votre compte étudiant pour accéder à des opportunités exclusives
                  </p>
                  <button
                    onClick={activateStudentAccount}
                    className="w-full bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    Activer maintenant
                  </button>
                </div>
              )}
            </motion.div>

            {/* Stats rapides */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#8a6bfe]" />
                Résumé
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Expériences</span>
                  <span className="font-bold text-[#8a6bfe]">
                    {profile.experiences?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Bio complétée</span>
                  <span className="font-bold text-[#8a6bfe]">
                    {profile.bio ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Disponibilités</span>
                  <span className="font-bold text-[#8a6bfe]">
                    {Object.values(profile.availabilitySchedule || {}).filter(
                      (day: any) => day?.enabled
                    ).length}{' '}
                    jours
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-xl flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">À propos de moi</h2>
              </div>

              <textarea
                value={profile.bio || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile!,
                    bio: e.target.value,
                  })
                }
                className="w-full border-2 border-gray-200 text-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-[#8a6bfe] outline-none transition-all resize-none"
                rows={5}
                placeholder="Parlez de vous, de vos passions, de vos compétences et de vos objectifs..."
              />
              <p className="text-xs text-gray-500 mt-2">
                {profile.bio?.length || 0} / 500 caractères
              </p>
            </motion.div>

            {/* Disponibilités */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-xl flex items-center justify-center text-white">
                  <Calendar className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Calendrier de disponibilité
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  'Lundi',
                  'Mardi',
                  'Mercredi',
                  'Jeudi',
                  'Vendredi',
                  'Samedi',
                  'Dimanche',
                ].map((day) => {
                  const slots = profile.availabilitySchedule?.[day]?.slots || [];
                  const isEnabled = profile.availabilitySchedule?.[day]?.enabled || false;

                  return (
                    <div
                      key={day}
                      className={`border-2 rounded-xl p-4 transition-all ${
                        isEnabled
                          ? 'border-[#8a6bfe] bg-purple-50/30'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => {
                              setProfile({
                                ...profile!,
                                availabilitySchedule: {
                                  ...profile.availabilitySchedule,
                                  [day]: {
                                    enabled: e.target.checked,
                                    slots:
                                      slots.length > 0
                                        ? slots
                                        : [{ start: '', end: '' }],
                                  },
                                },
                              });
                            }}
                            className="w-5 h-5 accent-[#8a6bfe] cursor-pointer"
                          />
                          <span className="font-semibold text-gray-900">{day}</span>
                        </label>

                        {isEnabled && (
                          <button
                            className="text-[#8a6bfe] text-sm font-medium hover:text-[#6b4fd9] flex items-center gap-1"
                            onClick={() => {
                              const updated = [...slots, { start: '', end: '' }];
                              updateDaySlots(day, updated);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                            Ajouter
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {isEnabled && slots.map((slot: { start: string; end: string }, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 mt-2"
                          >
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => {
                                const newSlots = [...slots];
                                newSlots[index].start = e.target.value;
                                updateDaySlots(day, newSlots);
                              }}
                              className="flex-1 border-2 border-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#8a6bfe] focus:border-[#8a6bfe] outline-none"
                            />

                            <span className="text-gray-400 font-medium">→</span>

                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => {
                                const newSlots = [...slots];
                                newSlots[index].end = e.target.value;
                                updateDaySlots(day, newSlots);
                              }}
                              className="flex-1 border-2 border-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#8a6bfe] focus:border-[#8a6bfe] outline-none"
                            />

                            <button
                              onClick={() => {
                                const updated = [...slots];
                                updated.splice(index, 1);
                                updateDaySlots(day, updated);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Expériences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-xl flex items-center justify-center text-white">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Expériences professionnelles
                </h2>
              </div>

              <div className="space-y-4">
                {(profile.experiences || []).map((exp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-2 border-gray-200 rounded-xl p-5 relative group hover:shadow-md transition-all"
                  >
                    <button
                      onClick={() => handleRemoveExperience(i)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-4 text-black">
                      <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                          label="Titre du poste"
                          value={exp.title}
                          onChange={(e) =>
                            handleUpdateExperience(i, 'title', e.target.value)
                          }
                          icon={<Briefcase className="w-4 h-4" />}
                        />
                        <InputField
                          label="Entreprise"
                          value={exp.company}
                          onChange={(e) =>
                            handleUpdateExperience(i, 'company', e.target.value)
                          }
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                          label="Date de début"
                          type="month"
                          value={exp.startDate}
                          onChange={(e) =>
                            handleUpdateExperience(i, 'startDate', e.target.value)
                          }
                        />
                        <InputField
                          label="Date de fin"
                          type="month"
                          value={exp.endDate}
                          onChange={(e) =>
                            handleUpdateExperience(i, 'endDate', e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={exp.description}
                          onChange={(e) =>
                            handleUpdateExperience(i, 'description', e.target.value)
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-[#8a6bfe] outline-none transition-all resize-none"
                          rows={3}
                          placeholder="Décris ton rôle, tes missions et tes réalisations..."
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={handleAddExperience}
                className="flex items-center gap-2 mt-4 w-full justify-center py-3 border-2 border-dashed border-[#8a6bfe] text-[#8a6bfe] hover:bg-purple-50 rounded-xl font-medium transition-all"
              >
                <Plus className="w-5 h-5" />
                Ajouter une expérience
              </button>
            </motion.div>

            {/* Bouton de sauvegarde */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end gap-3"
            >
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------
          MODALE DE CROP DE L'IMAGE
         ------------------------------------------- */}
      <AnimatePresence>
        {showCropper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Recadrer votre photo
              </h2>

              <div className="relative w-full h-80 bg-gray-100 rounded-xl overflow-hidden mb-6">
                <Cropper
                  image={selectedImage!}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#8a6bfe]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCropper(false);
                    setSelectedImage(null);
                    setRawFile(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>

                <button
                  onClick={handleCropSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

//////////////////////////////////////////////////////////
// Composant générique InputField amélioré
//////////////////////////////////////////////////////////

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  icon,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full border-2 border-gray-200 rounded-xl ${
            icon ? 'pl-10' : 'pl-4'
          } pr-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-[#8a6bfe] outline-none transition-all`}
        />
      </div>
    </div>
  );
}