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
  Calendar as CalendarIcon,
  Briefcase,
  ArrowLeft,
  Star,
  MessageSquare,
  Building2,
} from 'lucide-react';

import { motion } from 'framer-motion';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import * as frLocale from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

/* ==========================
   Réglages calendrier
========================== */
const locales = { fr: frLocale };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

/* ==========================
   Interfaces
========================== */
interface Experience {
  title: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface StudentProfile {
  age?: string;
  description?: string;
  hourlyRate?: string;
}

interface AvailabilityDay {
  enabled?: boolean;
  start?: string;
  end?: string;
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
  experiences?: Experience[];
  studentProfile?: StudentProfile;
  availabilitySchedule?: Record<string, AvailabilityDay>;
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

interface Review {
  id: string;
  rating?: number;
  comment?: string;
  createdAt?: any;
}

/* ==========================
   Page Profil Étudiant
========================== */
export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();

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
  const [isMobile, setIsMobile] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  /* Auth */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  /* Responsive */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* Charger Profil + Annonces publiées */
  useEffect(() => {
    async function fetchUser() {
      if (!uid) return;

      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setUserProfile({ id: snap.id, ...snap.data() } as UserProfile);
        }

        const annoncesRef = collection(db, 'annonces');
        const qAnnonces = query(annoncesRef, where('userId', '==', uid));
        const annoncesSnap = await getDocs(qAnnonces);

        const list = annoncesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Annonce[];

        setAnnonces(list);
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [uid]);

  /* ==========================
     Reviews + Travaux effectués
  =========================== */
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [jobsDone, setJobsDone] = useState(0);

  /* Reviews */
  useEffect(() => {
    async function loadReviews() {
      if (!uid) return;

      try {
        // ⚠️ IMPORTANT : champ aligné avec les règles => reviewedId
        const qReviews = query(
          collection(db, 'reviews'),
          where('reviewedId', '==', uid)
        );

        const snap = await getDocs(qReviews);

        const list: Review[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        setReviewsList(list);

        if (list.length === 0) {
          setReviewsCount(0);
          setAvgRating(null);
          return;
        }

        const avg =
          list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
          list.length;

        setReviewsCount(list.length);
        setAvgRating(Number(avg.toFixed(1)));
      } catch (err) {
        console.error('Erreur reviews:', err);
      }
    }

    loadReviews();
  }, [uid]);

  /* Travaux effectués */
  useEffect(() => {
    async function loadJobsDone() {
      if (!uid) return;

      try {
        const qJobs = query(
          collection(db, 'annonces'),
          where('acceptedUserId', '==', uid),
          where('statut', '==', 'fini')
        );

        const snap = await getDocs(qJobs);
        setJobsDone(snap.docs.length);
      } catch (err) {
        console.error('Erreur travaux:', err);
      }
    }

    loadJobsDone();
  }, [uid]);

  /* ==========================
     Messagerie - AVEC VÉRIFICATION DE CHAT EXISTANT
  =========================== */
  async function handleMessage() {
    if (!currentUser || !uid) return;
    if (sendingMessage) return; // Éviter les doubles clics

    setSendingMessage(true);

    try {
      // 1. Chercher un chat existant où les deux utilisateurs sont participants
      const chatsRef = collection(db, 'chats');
      
      // Requête pour trouver les chats où l'utilisateur actuel est participant
      const qChats = query(
        chatsRef,
        where('participants', 'array-contains', currentUser.uid)
      );

      const chatsSnap = await getDocs(qChats);

      // 2. Vérifier si un chat avec l'autre utilisateur existe déjà
      let existingChatId: string | null = null;

      for (const chatDoc of chatsSnap.docs) {
        const chatData = chatDoc.data();
        const participants = chatData.participants as string[];

        // Vérifier si l'autre utilisateur est aussi dans ce chat
        if (participants.includes(uid)) {
          existingChatId = chatDoc.id;
          break;
        }
      }

      // 3. Si un chat existe, rediriger vers celui-ci
      if (existingChatId) {
        router.push(`/messages?chatId=${existingChatId}`);
        return;
      }

      // 4. Sinon, créer un nouveau chat
      const newChat = await addDoc(collection(db, 'chats'), {
        participants: [currentUser.uid, uid],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        typing: {},
      });

      router.push(`/messages?chatId=${newChat.id}`);
    } catch (error) {
      console.error('Erreur lors de la création/récupération du chat:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSendingMessage(false);
    }
  }

  /* ==========================
     Loading
  =========================== */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 bg-gradient-to-br from-[#f5e5ff] to-[#ddc2ff]">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-[#8a6bfe]" />
        Chargement du profil...
      </div>
    );

  if (!userProfile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-700">
        <p>Profil introuvable.</p>
        <Link href="/students" className="text-[#8a6bfe] mt-4 hover:underline">
          Retour
        </Link>
      </div>
    );

  const { studentProfile, experiences } = userProfile;

  /* ==========================
     Disponibilités (Calendrier)
  =========================== */
  const events =
    userProfile?.availabilitySchedule &&
    Object.entries(userProfile.availabilitySchedule)
      .filter(([_, v]) => v.enabled && v.start && v.end)
      .map(([day, data]) => {
        const today = new Date();
        const dayMap: Record<string, number> = {
          Lundi: 1,
          Mardi: 2,
          Mercredi: 3,
          Jeudi: 4,
          Vendredi: 5,
          Samedi: 6,
          Dimanche: 0,
        };

        const diff = (dayMap[day] - today.getDay() + 7) % 7;
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + diff);

        const [sh, sm] = data.start!.split(':').map(Number);
        const [eh, em] = data.end!.split(':').map(Number);

        const start = new Date(startDate);
        start.setHours(sh, sm);

        const end = new Date(startDate);
        end.setHours(eh, em);

        return {
          title: `${day} (${data.start} - ${data.end})`,
          start,
          end,
          allDay: false,
        };
      });

  /* ==========================
     UI MAIN
  =========================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f5ff] via-[#f5eaff] to-[#faf5ff] text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* ⬅️ Retour */}
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-[#8a6bfe] mb-8"
        >
          <ArrowLeft size={18} /> Retour
        </Link>

        {/* ==========================
            🧑 Profil Étudiant
        =========================== */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row gap-8 bg-white/70 p-8 rounded-3xl border border-[#ddc2ff] shadow-lg"
        >
          {/* Photo */}
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-[#ddc2ff]/50 rounded-full"></div>
            <Image
              src={
                userProfile.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  `${userProfile.firstName} ${userProfile.lastName}`
                )}&background=8a6bfe&color=fff&size=128`
              }
              alt="photo"
              width={150}
              height={150}
              className="relative rounded-full border-4 border-[#8a6bfe]/80 object-cover shadow-xl"
            />
          </div>

          {/* Infos */}
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-extrabold text-[#8a6bfe]">
              {userProfile.firstName} {userProfile.lastName}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mt-3">
              {avgRating !== null && (
                <span className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full font-medium text-sm border border-yellow-300 flex items-center gap-1">
                  <Star size={14} className="text-yellow-600" />
                  {avgRating} / 5
                </span>
              )}

              <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full font-medium text-sm border border-green-300 flex items-center gap-1">
                <Briefcase size={14} />
                {jobsDone} travail{jobsDone > 1 ? 's' : ''} effectué
                {jobsDone > 1 ? 's' : ''}
              </span>

              {studentProfile?.hourlyRate && (
                <span className="px-4 py-1.5 bg-[#8a6bfe]/10 text-[#8a6bfe] rounded-full text-sm border border-[#8a6bfe]/30">
                  {studentProfile.hourlyRate} €/h
                </span>
              )}

              {studentProfile?.age && (
                <span className="px-4 py-1.5 bg-[#ddc2ff]/30 text-gray-700 rounded-full text-sm border border-[#ddc2ff]/60">
                  {studentProfile.age} ans
                </span>
              )}

              {userProfile.city && (
                <span className="flex items-center gap-1 text-sm text-gray-700">
                  <MapPin size={14} className="text-[#8a6bfe]" />
                  <a
                    href={`https://www.google.com/maps/place/${userProfile.city}`}
                    target="_blank"
                    className="hover:underline"
                  >
                    {userProfile.city}
                  </a>
                </span>
              )}
            </div>

            {/* ⭐ Bloc Avis reçus */}
            {reviewsList.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="mt-6"
              >
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#8a6bfe]">
                  <Star /> Avis reçus ({reviewsList.length})
                </h2>

                <div className="space-y-4">
                  {reviewsList.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white border border-[#ddc2ff]/70 rounded-2xl p-4 shadow-sm"
                    >
                      {/* ⭐ note */}
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={16}
                            className={
                              n <= (review.rating || 0)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>

                      {/* 💬 commentaire */}
                      {review.comment && (
                        <p className="text-gray-700 text-sm mb-2">
                          {review.comment}
                        </p>
                      )}

                      {/* 🕒 date */}
                      <p className="text-xs text-gray-500">
                        Posté le{' '}
                        {review.createdAt?.seconds
                          ? new Date(
                              review.createdAt.seconds * 1000
                            ).toLocaleDateString('fr-BE')
                          : 'date inconnue'}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {studentProfile?.description && (
              <p className="mt-3 text-gray-700 bg-[#f5e5ff]/40 p-4 rounded-xl border border-[#ddc2ff]/60">
                {studentProfile.description}
              </p>
            )}

            {userProfile.bio && (
              <p className="italic text-gray-600">{userProfile.bio}</p>
            )}

            <p className="text-xs text-gray-500">
              Membre depuis{' '}
              {userProfile.createdAt?.seconds
                ? new Date(
                    userProfile.createdAt.seconds * 1000
                  ).toLocaleDateString('fr-BE')
                : 'date inconnue'}
            </p>

            {currentUser && currentUser.uid !== uid && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMessage}
                disabled={sendingMessage}
                className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-3 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <MessageSquare size={18} />
                    Envoyer un message
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ==========================
            Disponibilités
        =========================== */}
        {events && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-14"
          >
            <h2 className="text-2xl font-bold mb-6 text-[#8a6bfe] flex items-center gap-2">
              <CalendarIcon /> Disponibilités
            </h2>

            <div className="bg-white border border-[#ddc2ff] rounded-2xl p-4 shadow-md">
              {isMobile ? (
                <div className="space-y-3">
                  {events.map((ev, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#f8f2ff] border border-[#ddc2ff] rounded-xl"
                    >
                      <span className="font-medium text-[#8a6bfe]">
                        {ev.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <BigCalendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500 }}
                  views={['week']}
                  defaultView="week"
                  eventPropGetter={() => ({
                    style: {
                      backgroundColor: '#8a6bfe',
                      color: 'white',
                      borderRadius: '8px',
                    },
                  })}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ==========================
            Expériences
        =========================== */}
        {experiences && experiences.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-14"
          >
            <h2 className="text-2xl font-bold mb-8 text-[#8a6bfe] flex items-center gap-2">
              <Star /> Expériences professionnelles
            </h2>

            <div className="space-y-6">
              {experiences.map((exp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-[#ddc2ff] p-6 rounded-2xl shadow"
                >
                  <h3 className="text-lg font-semibold">{exp.title}</h3>

                  {exp.company && (
                    <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                      <Building2 size={14} /> {exp.company}
                    </p>
                  )}

                  {(exp.startDate || exp.endDate) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {exp.startDate || '—'} → {exp.endDate || 'Présent'}
                    </p>
                  )}

                  {exp.description && (
                    <p className="mt-3 text-gray-700">{exp.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ==========================
            Annonces publiées
        =========================== */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-14"
        >
          <h2 className="text-2xl font-bold mb-6 text-[#8a6bfe] flex items-center gap-2">
            <Briefcase /> Annonces publiées
          </h2>

          {annonces.length === 0 ? (
            <p className="text-gray-600">Aucune annonce publiée.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {annonces.map((a) => (
                <Link key={a.id} href={`/jobs/${a.id}`} className="block">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="bg-white border border-[#ddc2ff] p-5 rounded-2xl shadow h-full"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {a.description}
                    </h3>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <CalendarIcon size={14} className="text-[#8a6bfe]" />{' '}
                        {a.date}
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#8a6bfe]" /> {a.lieu}
                      </p>

                      <p className="flex items-center gap-2">
                        <Euro size={14} className="text-[#8a6bfe]" />{' '}
                        {a.remuneration} €/h
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}