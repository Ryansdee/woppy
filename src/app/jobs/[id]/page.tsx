'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  MapPin,
  Euro,
  Clock,
  Calendar,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Bell,
  MessageSquare,
  User,
} from 'lucide-react';

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
  userName?: string;
  userPhotoURL?: string;
}

interface Candidature {
  id: string;
  userId: string;
  statut: string;
  date: any;
  userName?: string;
  photoURL?: string;
}

interface Chat {
  id: string;
  participants: string[];
  annonceId?: string;
  createdAt?: any;
}

export default function AnnonceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // Charger l’annonce + infos de l’auteur
  useEffect(() => {
    async function fetchAnnonce() {
      if (!id) return;
      try {
        const ref = doc(db, 'annonces', id as string);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const annonceData = { id: snap.id, ...snap.data() } as Annonce;

          // Ajouter les infos de l’auteur depuis la table users
          const userRef = doc(db, 'users', annonceData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const u = userSnap.data();
            annonceData.userName =
              `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
              u.email?.split('@')[0] ||
              'Utilisateur inconnu';
            annonceData.userPhotoURL =
              u.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                annonceData.userName || 'Utilisateur'
              )}&background=8a6bfe&color=fff&size=64`;
          } else {
            annonceData.userName = 'Utilisateur inconnu';
            annonceData.userPhotoURL = `https://ui-avatars.com/api/?name=Utilisateur&background=8a6bfe&color=fff&size=64`;
          }

          setAnnonce(annonceData);
        } else {
          setAnnonce(null);
        }
      } catch (err) {
        console.error('Erreur Firestore :', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnonce();
  }, [id]);

  // Charger les candidatures + infos user associées
  useEffect(() => {
    async function fetchCandidaturesWithUserData() {
      if (!annonce || !user || user.uid !== annonce.userId) return;
      try {
        const q = query(collection(db, 'candidatures'), where('annonceId', '==', annonce.id));
        const snap = await getDocs(q);
        const data = await Promise.all(
          snap.docs.map(async (docSnap) => {
            const c = { id: docSnap.id, ...docSnap.data() } as Candidature;
            const userRef = doc(db, 'users', c.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const u = userSnap.data();
              return {
                ...c,
                userName:
                  `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
                  u.email?.split('@')[0] ||
                  'Utilisateur inconnu',
                photoURL:
                  u.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Utilisateur'
                  )}&background=8a6bfe&color=fff&size=64`,
              };
            } else {
              return {
                ...c,
                userName: 'Utilisateur inconnu',
                photoURL: `https://ui-avatars.com/api/?name=Utilisateur&background=8a6bfe&color=fff&size=64`,
              };
            }
          })
        );
        setCandidatures(data);
      } catch (err) {
        console.error('❌ Erreur lors du chargement des candidatures:', err);
      }
    }
    fetchCandidaturesWithUserData();
  }, [annonce, user]);

  async function handlePostuler() {
    if (!user || !annonce) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await addDoc(collection(db, 'candidatures'), {
        userId: user.uid,
        annonceId: annonce.id,
        statut: 'en attente',
        date: serverTimestamp(),
      });

      await addDoc(collection(db, 'notifications'), {
        toUser: annonce.userId,
        fromUser: user.uid,
        type: 'nouvelle_candidature',
        annonceId: annonce.id,
        message: 'Un utilisateur est intéressé par votre annonce.',
        createdAt: serverTimestamp(),
        read: false,
      });

      setMessage('Votre candidature a été envoyée avec succès 🎉');
    } catch (err) {
      console.error('Erreur lors de la candidature :', err);
      setMessage('Erreur : impossible de postuler.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMessage(candidatId: string) {
    if (!user || !annonce) return;
    try {
      const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
      const snap = await getDocs(q);
      let existingChat: Chat | null = null;
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (Array.isArray(data.participants) && data.participants.includes(candidatId)) {
          existingChat = { ...(data as Chat), id: docSnap.id };
          break;
        }
      }
      if (!existingChat) {
        const newChatRef = await addDoc(collection(db, 'chats'), {
          participants: [user.uid, candidatId],
          annonceId: annonce.id,
          createdAt: serverTimestamp(),
          lastMessage: 'Conversation initiée',
          lastMessageTime: serverTimestamp(),
          unreadCount: { [user.uid]: 0, [candidatId]: 1 },
        });
        router.push(`/messages?chatId=${newChatRef.id}`);
      } else router.push(`/messages?chatId=${existingChat.id}`);
    } catch (err) {
      console.error('❌ Erreur lors de la création du chat :', err);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-[#8a6bfe]" />
        Chargement de l’annonce...
      </div>
    );

  if (!annonce)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-lg font-semibold">Annonce introuvable</p>
        <Link href="/jobs" className="mt-4 text-[#8a6bfe] hover:underline">
          Retour à la liste
        </Link>
      </div>
    );

  const isAuteur = user?.uid === annonce.userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition mb-4 sm:mb-6"
        >
          <ArrowLeft size={18} />
          Retour aux annonces
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {annonce.description.slice(0, 80)}...
            </h1>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full self-start sm:self-auto ${
                annonce.statut === 'ouverte'
                  ? 'bg-green-100 text-green-700'
                  : annonce.statut === 'en cours'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {annonce.statut}
            </span>
          </div>

          <p className="text-gray-700 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
            {annonce.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
            <Link href={`/profile/${annonce.userId}`}>
              <DetailItem
                icon={<Calendar size={18} className="text-[#8a6bfe]" />}
                label="Auteur de l'annonce"
                value={isAuteur ? 'Vous-même' : annonce.userName || 'Utilisateur'}
              />
            </Link>
            <DetailItem icon={<MapPin size={18} className="text-[#8a6bfe]" />} label="Lieu" value={annonce.lieu} />
            <DetailItem icon={<Calendar size={18} className="text-[#8a6bfe]" />} label="Date" value={annonce.date} />
            <DetailItem icon={<Clock size={18} className="text-[#8a6bfe]" />} label="Durée" value={`${annonce.duree} h`} />
            <DetailItem icon={<Euro size={18} className="text-[#8a6bfe]" />} label="Rémunération" value={`${annonce.remuneration} €/h`} />
          </div>

          {isAuteur ? (
            <div className="mt-8 sm:mt-10 border-t border-gray-100 pt-4 sm:pt-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="text-[#8a6bfe]" /> Candidats intéressés
              </h3>
              {candidatures.length === 0 ? (
                <p className="text-sm text-gray-600">Aucune candidature reçue pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {candidatures.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5"
                    >
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <Image
                          src={c.photoURL || ''}
                          alt={c.userName || 'Utilisateur'}
                          width={48}
                          height={48}
                          className="rounded-full border border-gray-200 object-cover"
                        />
                        <div>
                          <Link href={`/profile/${c.userId}`} className="hover:underline">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">{c.userName}</p>
                          </Link>
                          <p className="text-xs text-gray-500">
                            {c.statut} —{' '}
                            {c.date?.seconds
                              ? new Date(c.date.seconds * 1000).toLocaleDateString('fr-BE')
                              : 'Date inconnue'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMessage(c.userId)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white rounded-lg font-medium hover:shadow-md transition text-sm sm:text-base"
                      >
                        <MessageSquare size={16} />
                        Envoyer un message
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 sm:mt-10 border-t border-gray-100 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={handlePostuler}
                disabled={submitting}
                className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Postuler à cette annonce
                  </>
                )}
              </button>
            </div>
          )}

          {message && (
            <p
              className={`mt-4 text-center font-medium ${
                message.includes('succès') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <Bell className="inline w-4 h-4 mr-1" />
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 shrink-0">{icon}</div>
      <div>
        <div className="text-gray-500 text-xs uppercase font-semibold">{label}</div>
        <div className="text-gray-800 font-medium break-words">{value}</div>
      </div>
    </div>
  );
}
