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
import Image from 'next/image';
import { Loader2, Save, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  city?: string;
  photoURL?: string;
  hasStudentProfile?: boolean;
  studentProfile?: {
    age?: string;
    description?: string;
  };
}

export default function DashboardProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // -------------------------
  // 🔐 Authentification
  // -------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/auth/login');
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, [router]);

  // -------------------------
  // 📦 Charger le profil
  // -------------------------
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

  // -------------------------
  // 💾 Sauvegarder le profil
  // -------------------------
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

  // -------------------------
  // ✏️ Interface
  // -------------------------
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
          {/* Photo de profil */}
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

          {/* Informations principales */}
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

          {/* Profil étudiant (si applicable) */}
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

          {/* Bouton de sauvegarde */}
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

// Champ de saisie réutilisable
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
