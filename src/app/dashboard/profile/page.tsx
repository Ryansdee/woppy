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
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  type CroppedArea = { x: number; y: number; width: number; height: number };
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

      alert('Profil mis à jour !');
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
  // UPLOAD CARTE ÉTUDIANTE
  ////////////////////////////////////////

   {/* const handleCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const storageRef = ref(storage, `studentCards/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const updatedStudent = {
        ...profile?.studentProfile,
        cardURL: downloadURL,
        verificationStatus: 'pending',
      };

      await updateDoc(doc(db, 'users', user.uid), {
        studentProfile: updatedStudent,
        updatedAt: serverTimestamp(),
      });

      setProfile({ ...profile!, studentProfile: updatedStudent });

      alert('Carte envoyée.');
    } catch (err) {
      console.error(err);
      alert('Erreur envoi carte.');
    }
  };
  */}

  ////////////////////////////////////////
  // COMPTE ÉTUDIANT → ACTIVATION DIRECTE
  ////////////////////////////////////////

const activateStudentAccount = async () => {
  if (!user || !profile) return;

  const updated = {
    ...profile,
    hasStudentProfile: true,
    studentProfile: {
      verificationStatus: 'verified' as const // ✔ plus de validation, directement OK
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );

  if (!profile)
    return <div className="p-6 text-center">Aucun profil trouvé.</div>;

  //////////////////////////////////////////////////////////
  // UI PRINCIPALE (JSX)
  //////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
      <div className="max-w-3xl mx-auto p-6">
        {/* TITRE */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-6"
        >
          Mon profil
        </motion.h1>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">

          {/* -------------------------------------------
              TYPE DE COMPTE (Étudiant ou non)
             ------------------------------------------- */}
          <div className="border border-[#e5d9ff] rounded-xl p-5 bg-gray-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Type de compte
            </h2>
            
            {/* 🔒 Carte étudiante (désactivée temporairement) */}
            {profile.hasStudentProfile ? (
              <p className="text-gray-700">Vous êtes étudiant 🎓</p>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-700">Activer le compte étudiant</p>
                <button
                  onClick={activateStudentAccount}
                  className="bg-[#8a6bfe] text-white px-4 py-2 rounded-lg hover:bg-[#7a5bee]"
                >
                  Activer
                </button>
              </div>
            )}
          </div>

          {/* -------------------------------------------
              PHOTO DE PROFIL
             ------------------------------------------- */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <NextImage
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

            <label className="flex items-center gap-2 px-4 py-2 bg-[#8a6bfe] text-white rounded-lg cursor-pointer hover:bg-[#7a5bee]">
              <Upload className="w-4 h-4" />
              Changer la photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          {/* -------------------------------------------
              CARTE ÉTUDIANTE (si compte étudiant actif)
             ------------------------------------------- 
          {profile.hasStudentProfile && (
            <div className="border border-[#e5d9ff] rounded-xl p-4 bg-[#f8f6ff]">
              <h2 className="font-semibold text-gray-800 mb-2">
                Vérification carte étudiante
              </h2>

              {profile.studentProfile?.cardURL ? (
                <div className="flex items-center gap-4">
                  <NextImage
                    src={profile.studentProfile.cardURL}
                    alt="Carte étudiante"
                    width={120}
                    height={80}
                    className="rounded-md border cursor-pointer"
                    onClick={() =>
                      window.open(profile.studentProfile?.cardURL!, '_blank')
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
                        Vérifiée
                      </span>
                    )}
                    {profile.studentProfile.verificationStatus === 'rejected' && (
                      <span className="text-red-600 font-medium">
                        Refusée
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-2">
                  Aucune carte envoyée pour le moment.
                </p>
              )}

              <label className="flex items-center gap-2 cursor-pointer text-[#8a6bfe] hover:underline">
                <Upload className="w-4 h-4" />
                <span>Uploader une carte</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCardUpload}
                />
              </label>
            </div>
          )}
          */}

          {/* BIO */}
          <div className="border border-[#e5d9ff] rounded-xl p-5 bg-[#f8f6ff]">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Bio</h2>

            <textarea
              value={profile.bio || ""}
              onChange={(e) =>
                setProfile({
                  ...profile!,
                  bio: e.target.value,
                })
              }
              className="w-full border border-gray-300 text-gray-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#8a6bfe] outline-none"
              rows={5}
              placeholder="Parlez un peu de vous, vos passions, vos compétences..."
            />
          </div>
          {/* -------------------------------------------
              DISPONIBILITÉS MULTI-CRÉNEAUX
             ------------------------------------------- */}
          <div className="border border-[#e5d9ff] rounded-xl p-5 bg-[#f8f6ff]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Calendrier de disponibilité
            </h2>

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

              return (
                <div
                  key={day}
                  className="mb-6 pb-4 border-b text-black last:border-0 last:mb-0"
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={
                          profile.availabilitySchedule?.[day]?.enabled || false
                        }
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
                        className="w-4 h-4 accent-[#8a6bfe]"
                      />
                      <span className="font-medium">{day}</span>
                    </label>

                    <button
                      className="text-[#8a6bfe] text-sm font-medium hover:text-[#6b4dfc]"
                      onClick={() => {
                        const updated = [...slots, { start: '', end: '' }];
                        updateDaySlots(day, updated);
                      }}
                    >
                      + Ajouter une plage
                    </button>
                  </div>

                  {slots.map((slot: { start: string; end: string }, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 mt-3 ml-6"
                    >
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => {
                          const newSlots = [...slots];
                          newSlots[index].start = e.target.value;
                          updateDaySlots(day, newSlots);
                        }}
                        className="border px-2 py-1 rounded-lg"
                      />

                      <span>-</span>

                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => {
                          const newSlots = [...slots];
                          newSlots[index].end = e.target.value;
                          updateDaySlots(day, newSlots);
                        }}
                        className="border px-2 py-1 rounded-lg"
                      />

                      <button
                        onClick={() => {
                          const updated = [...slots];
                          updated.splice(index, 1);
                          updateDaySlots(day, updated);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* -------------------------------------------
              EXPÉRIENCES
             ------------------------------------------- */}
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
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid md:grid-cols-2 gap-4 text-black">
                  <InputField
                    label="Titre du poste"
                    value={exp.title}
                    onChange={(e) =>
                      handleUpdateExperience(i, 'title', e.target.value)
                    }
                  />
                  <InputField
                    label="Entreprise"
                    value={exp.company}
                    onChange={(e) =>
                      handleUpdateExperience(i, 'company', e.target.value)
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-3 text-black">
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

                <div className="mt-3 text-black">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleUpdateExperience(i, 'description', e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#8a6bfe]"
                    rows={3}
                    placeholder="Décris ton rôle, tes missions..."
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

          {/* -------------------------------------------
              SAUVEGARDE
             ------------------------------------------- */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 transition"
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

      {/* -------------------------------------------
          MODALE DE CROP DE L’IMAGE
         ------------------------------------------- */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-center">Recadrer la photo</h2>

            <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
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

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCropper(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Annuler
              </button>

              <button
                onClick={handleCropSave}
                className="px-4 py-2 bg-[#8a6bfe] text-white rounded-lg"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//////////////////////////////////////////////////////////
// Composant générique InputField
//////////////////////////////////////////////////////////

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
        className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#8a6bfe] outline-none"
      />
    </div>
  );
}
