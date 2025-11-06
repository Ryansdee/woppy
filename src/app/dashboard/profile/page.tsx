'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import {
  Loader2,
  Save,
  Upload,
  Banknote,
  Plus,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ✅ Type pour une expérience
interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

// ✅ Type pour le profil utilisateur
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

export default function DashboardProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);
  const router = useRouter();
  const storage = getStorage();

  // 🔐 Authentification utilisateur
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // 📦 Charger les données du profil
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) setProfile(snap.data() as UserProfile);
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  // 💾 Sauvegarder le profil
  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...profile,
        updatedAt: serverTimestamp(),
      });
      alert('✅ Profil mis à jour avec succès !');
    } catch (err) {
      console.error('Erreur sauvegarde profil:', err);
      alert('❌ Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  // ⚡ Mise à jour de la disponibilité
  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!user) return;
    setProfile((prev) => ({ ...prev!, isAvailable: checked }));
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isAvailable: checked,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('❌ Erreur mise à jour disponibilité:', err);
    }
  };

  // 📤 Upload carte étudiante
  const handleCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingCard(true);

    try {
      const storageRef = ref(storage, `studentCards/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const updatedProfile: UserProfile = {
        ...profile!,
        studentProfile: {
          ...profile?.studentProfile,
          cardURL: downloadURL,
          verificationStatus: 'pending',
        },
      };

      setProfile(updatedProfile);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        studentProfile: updatedProfile.studentProfile,
        updatedAt: serverTimestamp(),
      });

      alert('✅ Carte étudiante envoyée pour vérification.');
    } catch (err) {
      console.error('Erreur upload carte:', err);
      alert('❌ Erreur lors de l’upload.');
    } finally {
      setUploadingCard(false);
    }
  };

  // ➕ Ajouter une expérience
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

  // 🗑️ Supprimer une expérience
  const handleRemoveExperience = (index: number) => {
    const updated = [...(profile?.experiences || [])];
    updated.splice(index, 1);
    setProfile({ ...profile!, experiences: updated });
  };

  // ✏️ Modifier une expérience
  const handleUpdateExperience = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    const updated = [...(profile?.experiences || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile!, experiences: updated });
  };

  // 🌀 États de chargement
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
        <Loader2 className="w-10 h-10 animate-spin text-[#8a6bfe]" />
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Aucun profil trouvé.
      </div>
    );

  const isCardVerified =
    profile.studentProfile?.verificationStatus === 'verified';

  // 🧱 Interface principale
  return (
    <div className="min-h-screen bg-gradient-to-br text-black from-[#f5e5ff] via-white to-[#e8d5ff]">
      <div className="max-w-3xl mx-auto p-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-6"
        >
          Mon profil
        </motion.h1>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">
          {/* 📸 Photo de profil */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <Image
                src={
                  profile.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${profile.firstName || ''} ${profile.lastName || ''}`
                  )}&background=8a6bfe&color=fff`
                }
                alt="Photo de profil"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-[#8a6bfe] text-white rounded-lg hover:bg-[#7a5bee] transition"
            >
              <Upload className="w-4 h-4" />
              Changer la photo
            </button>
          </div>

          {/* 🪪 Carte étudiante */}
          {profile.hasStudentProfile && (
            <div className="border border-[#e5d9ff] rounded-xl p-4 bg-[#f8f6ff]">
              <h2 className="font-semibold text-gray-800 mb-2">
                Vérification carte étudiante
              </h2>
              {profile.studentProfile?.cardURL ? (
                <div className="flex items-center gap-4">
                  <Image
                    src={profile.studentProfile.cardURL}
                    alt="Carte étudiante"
                    width={120}
                    height={80}
                    className="rounded-md border cursor-pointer"
                    onClick={() =>
                      window.open(profile.studentProfile?.cardURL, '_blank')
                    }
                  />
                  <p className="text-sm text-gray-700">
                    Statut :{' '}
                    {profile.studentProfile.verificationStatus === 'pending' && (
                      <span className="text-yellow-600 font-medium">
                        En attente
                      </span>
                    )}
                    {profile.studentProfile.verificationStatus === 'verified' && (
                      <span className="text-green-600 font-medium">
                        Vérifiée ✅
                      </span>
                    )}
                    {profile.studentProfile.verificationStatus === 'rejected' && (
                      <span className="text-red-600 font-medium">
                        Refusée ❌
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-2">
                  Aucune carte étudiante envoyée.
                </p>
              )}

              <label className="flex items-center gap-2 cursor-pointer text-[#8a6bfe] hover:underline mt-2">
                <Upload className="w-4 h-4" />
                <span>
                  {uploadingCard ? 'Envoi en cours...' : 'Uploader une carte'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCardUpload}
                  className="hidden"
                  disabled={uploadingCard}
                />
              </label>
            </div>
          )}

          {/* 💳 Lier son compte bancaire */}
          <div className="flex justify-center">
            <button
              disabled={!isCardVerified}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition ${
                isCardVerified
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => {
                if (isCardVerified) router.push('/dashboard/bank-link');
                else
                  alert(
                    '❌ Vous devez d’abord faire vérifier votre carte étudiante.'
                  );
              }}
            >
              <Banknote className="w-5 h-5" />
              Lier son compte bancaire
            </button>
          </div>

              {/* 📅 Calendrier de disponibilité */}
              <div className="border border-[#e5d9ff] rounded-xl p-5 bg-[#f8f6ff] mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Calendrier de disponibilité
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  Choisis tes jours et horaires disponibles.
                </p>
                {['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'].map((day) => (
                  <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={profile?.availabilitySchedule?.[day]?.enabled || false}
                        onChange={(e) => {
                          const updated = {
                            ...profile?.availabilitySchedule,
                            [day]: {
                              ...(profile?.availabilitySchedule?.[day] || {}),
                              enabled: e.target.checked,
                            },
                          };
                          setProfile({ ...profile!, availabilitySchedule: updated });
                        }}
                        className="w-4 h-4 accent-[#8a6bfe]"
                      />
                      <span className="font-medium text-gray-700">{day}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={profile?.availabilitySchedule?.[day]?.start || ''}
                        onChange={(e) => {
                          const updated = {
                            ...profile?.availabilitySchedule,
                            [day]: {
                              ...(profile?.availabilitySchedule?.[day] || {}),
                              start: e.target.value,
                            },
                          };
                          setProfile({ ...profile!, availabilitySchedule: updated });
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      />
                      <span>-</span>
                      <input
                        type="time"
                        value={profile?.availabilitySchedule?.[day]?.end || ''}
                        onChange={(e) => {
                          const updated = {
                            ...profile?.availabilitySchedule,
                            [day]: {
                              ...(profile?.availabilitySchedule?.[day] || {}),
                              end: e.target.value,
                            },
                          };
                          setProfile({ ...profile!, availabilitySchedule: updated });
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>  

          {/* 🧍 Informations personnelles */}
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Prénom"
              value={profile.firstName || ''}
              onChange={(e) =>
                setProfile({ ...profile, firstName: e.target.value })
              }
            />
            <InputField
              label="Nom"
              value={profile.lastName || ''}
              onChange={(e) =>
                setProfile({ ...profile, lastName: e.target.value })
              }
            />
            <InputField
              label="Ville"
              value={profile.city || ''}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
          </div>

          {/* ✍️ Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent outline-none"
              rows={3}
              placeholder="Décris-toi en quelques mots..."
            />
          </div>

          {/* 💼 Expériences professionnelles */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Expériences professionnelles
            </h2>
            {(profile.experiences || []).map((exp, i) => (
              <div
                key={i}
                className="bg-[#f9f7ff] border border-[#e2d9ff] rounded-xl p-4 mb-3 shadow-sm relative"
              >
                <button
                  onClick={() => handleRemoveExperience(i)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputField
                    label="Titre du poste"
                    value={exp.title}
                    onChange={(e) =>
                      handleUpdateExperience(i, 'title', e.target.value)
                    }
                  />
                  <InputField
                    label="Entreprise / Organisation"
                    value={exp.company}
                    onChange={(e) =>
                      handleUpdateExperience(i, 'company', e.target.value)
                    }
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
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
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleUpdateExperience(i, 'description', e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent outline-none"
                    rows={3}
                    placeholder="Décris ton rôle, tes missions, les résultats obtenus..."
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleAddExperience}
              className="flex items-center gap-2 mt-2 text-[#8a6bfe] hover:text-[#6b4dfc] font-medium"
            >
              <Plus className="w-4 h-4" /> Ajouter une expérience
            </button>
          </div>

          {/* 🎓 Profil étudiant */}
          {profile.hasStudentProfile && (
            <div className="mt-4 border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Profil étudiant
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Âge"
                  value={profile.studentProfile?.age || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      studentProfile: {
                        ...profile.studentProfile,
                        age: e.target.value,
                      },
                    })
                  }
                />
                <InputField
                  label="Description"
                  value={profile.studentProfile?.description || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      studentProfile: {
                        ...profile.studentProfile,
                        description: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* 💾 Sauvegarde */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🧩 Composant réutilisable pour les champs de saisie
function InputField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent outline-none"
      />
    </div>
  );
}
