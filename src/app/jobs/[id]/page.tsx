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
  updateDoc,
  deleteDoc,
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
  titre: string;
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
  acceptedUserId?: string;
  acceptedUserName?: string;
  taskCompletion?: { author?: boolean; student?: boolean };
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
  const [position, setPosition] = useState<[number, number] | null>(null);

  const formatLieu = annonce?.lieu.replaceAll(' ', '+');
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${formatLieu}`;

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // Charger annonce
  useEffect(() => {
    async function fetchAnnonce() {
      if (!id) return;
      try {
        const ref = doc(db, 'annonces', id as string);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const annonceData = { id: snap.id, ...snap.data() } as Annonce;

          const userRef = doc(db, 'users', annonceData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const u = userSnap.data();
            annonceData.userName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Utilisateur';
            annonceData.userPhotoURL =
              u.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                annonceData.userName
              )}&background=8a6bfe&color=fff&size=64`;
          }
          setAnnonce(annonceData);
        } else setAnnonce(null);
      } catch (err) {
        console.error('Erreur Firestore :', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnonce();
  }, [id]);

  // Charger candidatures
  useEffect(() => {
    async function fetchCandidatures() {
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
                userName: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
                photoURL:
                  u.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    u.firstName || 'Utilisateur'
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
        console.error('Erreur candidatures:', err);
      }
    }
    fetchCandidatures();
  }, [annonce, user]);

  // Géocodage
  useEffect(() => {
    async function geocodeAdresse() {
      if (!annonce?.lieu) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            annonce.lieu
          )}`
        );
        const data = await res.json();
        if (data.length > 0) setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } catch (err) {
        console.error('Erreur géocodage :', err);
      }
    }
    geocodeAdresse();
  }, [annonce]);

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
      console.error('Erreur chat :', err);
    }
  }



  // 🔥 Auto-suppression 2h après statut fini
  useEffect(() => {
    if (!annonce?.statut || annonce.statut !== 'fini') return;
    if (!annonce.createdAt?.seconds) return;

    const creationTime = annonce.createdAt.seconds * 1000;
    const twoHoursLater = creationTime + 2 * 60 * 60 * 1000;
    const now = Date.now();
    const delay = twoHoursLater - now;

    if (delay <= 0) deleteDoc(doc(db, 'annonces', annonce.id)).catch(console.error);
    else
      setTimeout(async () => {
        try {
          await deleteDoc(doc(db, 'annonces', annonce.id));
        } catch (err) {
          console.error('Erreur suppression auto :', err);
        }
      }, delay);
  }, [annonce]);

  // 📩 Postuler
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
        message: 'Un étudiant est intéressé par votre annonce.',
        createdAt: serverTimestamp(),
        read: false,
      });
      setMessage('Votre candidature a été envoyée avec succès 🎉');
    } catch (err) {
      setMessage('Erreur : impossible de postuler.');
    } finally {
      setSubmitting(false);
    }
  }

  // ✅ Accepter un candidat
  async function handleAccepterCandidat(c: Candidature) {
    if (!annonce) return;
    try {
      await updateDoc(doc(db, 'annonces', annonce.id), {
        statut: 'en cours',
        acceptedUserId: c.userId,
        acceptedUserName: c.userName,
        taskCompletion: { author: false, student: false },
      });
      await updateDoc(doc(db, 'candidatures', c.id), { statut: 'acceptée' });
      await addDoc(collection(db, 'notifications'), {
        toUser: c.userId,
        fromUser: user.uid,
        type: 'acceptation',
        annonceId: annonce.id,
        message: 'Votre candidature a été acceptée ! 🎉',
        createdAt: serverTimestamp(),
        read: false,
      });
      setAnnonce({
        ...annonce,
        statut: 'en cours',
        acceptedUserId: c.userId,
        acceptedUserName: c.userName,
        taskCompletion: { author: false, student: false },
      });
      setMessage('Candidat accepté avec succès ✅');
    } catch (err) {
      console.error(err);
      setMessage('Erreur : impossible d’accepter ce candidat.');
    }
  }

  // ✅ Tâche effectuée
async function handleTaskDone() {
  if (!annonce || !user) return;

  const isAuthor = user.uid === annonce.userId;
  const isStudent = user.uid === annonce.acceptedUserId;
  if (!isAuthor && !isStudent) return;

  try {
    const completion = annonce.taskCompletion || { author: false, student: false };
    const updated = {
      author: completion.author || isAuthor,
      student: completion.student || isStudent,
    };

    // 🔥 Mise à jour Firestore
    await updateDoc(doc(db, 'annonces', annonce.id), { taskCompletion: updated });

    // 🔄 Met à jour le state local immédiatement
    const updatedAnnonce = { ...annonce, taskCompletion: updated };
    setAnnonce(updatedAnnonce);

    // ✅ Si les deux ont confirmé la tâche :
    if (updated.author && updated.student) {
      await updateDoc(doc(db, 'annonces', annonce.id), { statut: 'fini' });

      // Important : redirection immédiate pour l'auteur
      if (isAuthor) {
        router.push(`/review/${annonce.acceptedUserId}?annonceId=${annonce.id}`);
        return;
      }

      setAnnonce({ ...updatedAnnonce, statut: 'fini' });
    }
  } catch (err) {
    console.error('Erreur handleTaskDone:', err);
  }
}
  const isAuteur = user?.uid === annonce?.userId;
  const isAcceptedStudent = user?.uid === annonce?.acceptedUserId;

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        <Loader2 className="animate-spin w-8 h-8 mr-2 text-[#8a6bfe]" /> Chargement...
      </div>
    );

  if (!annonce)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="text-red-500 w-8 h-8 mb-3" />
        <p className="text-gray-700">Annonce introuvable.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition mb-6"
        >
          <ArrowLeft size={18} /> Retour aux annonces
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between flex-wrap items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{annonce.titre}</h1>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
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

          <p className="text-gray-700 mb-8 leading-relaxed">{annonce.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <DetailItem
              icon={<User size={18} className="text-[#8a6bfe]" />}
              label="Auteur"
              value={isAuteur ? 'Vous-même' : annonce.userName}
            />
            <DetailItem
              icon={<MapPin size={18} className="text-[#8a6bfe]" />}
              label="Lieu"
              value={
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8a6bfe] hover:underline"
                >
                  {annonce.lieu}
                </a>
              }
            />
            <DetailItem
              icon={<Calendar size={18} className="text-[#8a6bfe]" />}
              label="Date"
              value={annonce.date}
            />
            <DetailItem
              icon={<Clock size={18} className="text-[#8a6bfe]" />}
              label="Durée"
              value={`${annonce.duree} h`}
            />
            <DetailItem
              icon={<Euro size={18} className="text-[#8a6bfe]" />}
              label="Rémunération"
              value={`${annonce.remuneration} €/h`}
            />
          </div>

          {isAuteur && (
            <>
              <div className="mt-10 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="text-[#8a6bfe]" /> Candidats intéressés
                </h3>
                {candidatures.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucune candidature reçue.</p>
                ) : (
                  <div className="space-y-3">
                    {candidatures.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={c.photoURL || ''}
                            alt={c.userName || ''}
                            width={48}
                            height={48}
                            className="rounded-full border object-cover"
                          />
                          <div>
                            <p className="font-semibold">{c.userName}</p>
                            <p className="text-xs text-gray-500">{c.statut}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <button
                            onClick={() => handleAccepterCandidat(c)}
                            disabled={annonce.acceptedUserId === c.userId}
                            className="bg-[#8a6bfe] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#7a5bfe]"
                          >
                            {annonce.acceptedUserId === c.userId ? 'Accepté' : 'Accepter'}
                          </button>
                        <button
                          onClick={() => handleMessage(c.userId)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white rounded-lg font-medium hover:shadow-md transition text-sm sm:text-base"
                        >
                          <MessageSquare size={16} />
                        </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {(isAuteur || isAcceptedStudent) && annonce.acceptedUserId && (
            <div className="mt-8 border-t pt-6 text-center">
              <button
                onClick={handleTaskDone}
                disabled={
                  (isAuteur && annonce.taskCompletion?.author) ||
                  (isAcceptedStudent && annonce.taskCompletion?.student)
                }
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                <CheckCircle size={18} /> Tâche effectuée
              </button>

              {annonce.taskCompletion?.author && annonce.taskCompletion?.student && (
                <p className="text-green-600 mt-3 font-medium">
                  ✅ Tâche confirmée par les deux parties.
                </p>
              )}
            </div>
          )}

          {!isAuteur && !isAcceptedStudent && annonce.statut === 'ouverte' && (
            <div className="mt-8 text-center">
              <button
                onClick={handlePostuler}
                disabled={submitting}
                className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {submitting ? 'Envoi...' : 'Postuler à cette annonce'}
              </button>
            </div>
          )}

          {message && (
            <p className="mt-4 text-center text-sm text-[#8a6bfe] font-medium">{message}</p>
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
  value: React.ReactNode;
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
