'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Loader2,
  MapPin,
  Euro,
  Calendar,
  Briefcase,
  ArrowLeft,
  Star,
  MessageSquare,
} from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  description: string;
}

interface StudentProfile {
  age?: string;
  description?: string;
  hourlyRate?: string;
  experiences?: Experience[];
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL?: string;
  city?: string;
  bio?: string;
  createdAt?: any;
  hasStudentProfile?: boolean;
  studentProfile?: StudentProfile;
}

interface Annonce {
  id: string;
  description: string;
  date: string;
  duree: string;
  lieu: string;
  remuneration: number;
  statut: string;
  userId: string;
  createdAt?: any;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();

  // Récupère l'UID depuis l'URL proprement
  const uid =
    typeof params.uid === 'string'
      ? params.uid
      : Array.isArray(params.uid)
      ? params.uid[0]
      : undefined;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 🔐 Authentification
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
    });
    return () => unsub();
  }, []);

  // 📄 Chargement du profil utilisateur et de ses annonces
  useEffect(() => {
    async function fetchUser() {
      if (!uid) return;
      try {
        const userRef = doc(db, 'users', uid as string);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserProfile({ id: snap.id, ...snap.data() } as UserProfile);
        }

        const annoncesRef = collection(db, 'annonces');
        const q = query(annoncesRef, where('userId', '==', uid));
        const annoncesSnap = await getDocs(q);
        const annoncesData = annoncesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Annonce[];

        setAnnonces(annoncesData);
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [uid]);

  // 💬 Fonction pour créer ou ouvrir un chat
  async function handleMessage() {
    if (!currentUser || !uid) return;

    try {
      // Vérifie si un chat existe déjà entre les deux utilisateurs
      const snap = await getDocs(
        query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid))
      );

      let chatId: string | null = null;

      snap.forEach((docSnap) => {
        const data = docSnap.data() as { participants: string[] };
        if (data.participants.includes(uid as string)) {
          chatId = docSnap.id;
        }
      });

      // Créer un chat si aucun n'existe
      if (!chatId) {
        const newChat = await addDoc(collection(db, 'chats'), {
          participants: [currentUser.uid, uid],
          createdAt: serverTimestamp(),
        });
        router.push(`/messages?chatId=${newChat.id}`);
      } else {
        router.push(`/messages?chatId=${chatId}`);
      }
    } catch (err) {
      console.error('Erreur lors de la création du chat:', err);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-[#8a6bfe]" />
        Chargement du profil...
      </div>
    );

  if (!userProfile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 text-center">
        <p className="text-lg font-semibold">Profil introuvable</p>
        <Link href="/jobs" className="mt-4 text-[#8a6bfe] hover:underline">
          Retour
        </Link>
      </div>
    );

  const { studentProfile } = userProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition mb-8"
        >
          <ArrowLeft size={18} />
          Retour
        </Link>

        {/* 🧑 Profil utilisateur */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <Image
            src={
              userProfile.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                userProfile.firstName + ' ' + userProfile.lastName
              )}&background=8a6bfe&color=fff&size=128`
            }
            alt={userProfile.firstName}
            width={128}
            height={128}
            className="rounded-full border-4 border-[#8a6bfe]/80 object-cover"
          />

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {userProfile.firstName} {userProfile.lastName}
            </h1>

            <p className="text-gray-400 text-xs">
              <a href={`mailto:${userProfile.email}`} className="hover:underline">
                {userProfile.email}
              </a>
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {studentProfile?.hourlyRate
                ? `${studentProfile.hourlyRate} €/h`
                : 'Tarif non défini'}
            </p>

            {userProfile.city && (
              <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-[#8a6bfe]" />
                <a
                  href={`https://www.google.com/maps/place/${userProfile.city}`}
                  target="_blank"
                  className="hover:underline"
                >
                  {userProfile.city}
                </a>
              </p>
            )}

            {studentProfile?.description && (
              <p className="mt-4 text-gray-700 leading-relaxed">
                {studentProfile.description}
              </p>
            )}

            {userProfile.bio && (
              <p className="mt-2 text-gray-600 italic">{userProfile.bio}</p>
            )}

            <p className="mt-4 text-xs text-gray-500">
              Membre depuis{' '}
              {userProfile.createdAt?.seconds
                ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('fr-BE')
                : 'date inconnue'}
            </p>

            {/* 💬 Bouton envoyer un message */}
            {currentUser && currentUser.uid !== uid && (
              <button
                onClick={handleMessage}
                className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                <MessageSquare size={18} />
                Envoyer un message
              </button>
            )}
          </div>
        </div>

        {/* 💼 Expériences si profil étudiant */}
        {studentProfile?.experiences && studentProfile.experiences.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Star className="text-[#8a6bfe]" /> Expériences
            </h2>
            <div className="space-y-4">
              {studentProfile.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                  <p className="text-sm text-gray-700 mt-2">{exp.description || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📋 Annonces publiées */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Briefcase className="text-[#8a6bfe]" /> Annonces publiées
          </h2>

          {annonces.length === 0 ? (
            <p className="text-gray-600">Aucune annonce publiée pour le moment.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {annonces.map((a) => (
                <Link
                  key={a.id}
                  href={`/jobs/${a.id}`}
                  className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#8a6bfe] hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {a.description}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#8a6bfe]" />{' '}
                      {a.date || 'Date non spécifiée'}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#8a6bfe]" /> {a.lieu || 'Lieu inconnu'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Euro size={14} className="text-[#8a6bfe]" /> {a.remuneration} €/h
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
