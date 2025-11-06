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

// 📅 Calendrier visuel
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import * as frLocale from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { fr: frLocale };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchUser() {
      if (!uid) return;
      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) setUserProfile({ id: snap.id, ...snap.data() } as UserProfile);

        const annoncesRef = collection(db, 'annonces');
        const q = query(annoncesRef, where('userId', '==', uid));
        const annoncesSnap = await getDocs(q);
        const annoncesData = annoncesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
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

  async function handleMessage() {
    if (!currentUser || !uid) return;
    try {
      const snap = await getDocs(
        query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid))
      );

      let chatId: string | null = null;
      snap.forEach((docSnap) => {
        const data = docSnap.data() as { participants: string[] };
        if (data.participants.includes(uid)) chatId = docSnap.id;
      });

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
      console.error('Erreur chat:', err);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 bg-gradient-to-br from-[#f5e5ff] to-[#ddc2ff]">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-[#8a6bfe]" />
        Chargement du profil...
      </div>
    );

  if (!userProfile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 text-center bg-[#f5e5ff]">
        <p className="text-lg font-semibold">Profil introuvable</p>
        <Link href="/jobs" className="mt-4 text-[#8a6bfe] hover:underline">
          Retour
        </Link>
      </div>
    );

  const { studentProfile, experiences } = userProfile;

  // 🧮 Transformation du calendrier Firestore → événements calendrier
  const events =
    userProfile.availabilitySchedule &&
    Object.entries(userProfile.availabilitySchedule)
      .filter(([_, v]) => v.enabled && v.start && v.end)
      .map(([day, data]) => {
        const today = new Date();
        const dayMap: any = {
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
          title: `Disponible (${data.start} - ${data.end})`,
          start,
          end,
          allDay: false,
        };
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-[#ddc2ff]/30 to-[#f5e5ff] text-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-[#8a6bfe] transition mb-8 font-medium"
        >
          <ArrowLeft size={18} />
          Retour
        </Link>

        {/* 👤 Profil principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white rounded-3xl p-8 border border-[#ddc2ff] shadow-md hover:shadow-lg transition"
        >
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-[#ddc2ff]/60 rounded-full"></div>
            <Image
              src={
                userProfile.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  `${userProfile.firstName} ${userProfile.lastName}`
                )}&background=8a6bfe&color=fff&size=128`
              }
              alt={userProfile.firstName}
              width={128}
              height={128}
              className="relative rounded-full border-4 border-[#8a6bfe]/80 object-cover shadow-lg"
            />
          </div>

          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-extrabold text-[#8a6bfe]">
              {userProfile.firstName} {userProfile.lastName}
            </h1>

            <p className="text-gray-500 text-xs">
              <a href={`mailto:${userProfile.email}`} className="hover:underline">
                {userProfile.email}
              </a>
            </p>

            {studentProfile?.hourlyRate && (
              <p className="text-lg font-semibold text-[#8a6bfe] mt-2 bg-[#ddc2ff]/40 w-fit px-3 py-1 rounded-full">
                {studentProfile.hourlyRate} €/h
              </p>
            )}

            {userProfile.city && (
              <p className="flex items-center gap-2 text-sm text-gray-700">
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

            {studentProfile?.age && (
              <p className="mt-3 text-gray-700 leading-relaxed bg-[#f5e5ff]/50 p-3 rounded-xl border border-[#ddc2ff]/60">
                {studentProfile?.age} ans
              </p>
            )}

            {studentProfile?.description && (
              <p className="mt-3 text-gray-700 leading-relaxed bg-[#f5e5ff]/50 p-3 rounded-xl border border-[#ddc2ff]/60">
                {studentProfile.description}
              </p>
            )}

            {userProfile.bio && <p className="text-gray-600 italic">{userProfile.bio}</p>}

            <p className="text-xs text-gray-500 pt-2">
              Membre depuis{' '}
              {userProfile.createdAt?.seconds
                ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('fr-BE')
                : 'date inconnue'}
            </p>

            {currentUser && currentUser.uid !== uid && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMessage}
                className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-[#8a6bfe] to-[#ddc2ff] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
              >
                <MessageSquare size={18} />
                Envoyer un message
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* 📅 Calendrier de disponibilités */}
        {events && events.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#8a6bfe]">
              <CalendarIcon className="text-[#8a6bfe]" /> Disponibilités
            </h2>
            <div className="bg-white border border-[#ddc2ff] rounded-2xl p-6 shadow-sm">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                views={['week']}
                defaultView="week"
                messages={{
                  week: 'Semaine',
                  day: 'Jour',
                  month: 'Mois',
                  today: "Aujourd'hui",
                  previous: '←',
                  next: '→',
                }}
                eventPropGetter={() => ({
                  style: {
                    backgroundColor: '#8a6bfe',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                  },
                })}
              />
            </div>
          </div>
        )}

        {/* 💼 Expériences professionnelles */}
        {experiences && experiences.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-[#8a6bfe]">
              <Star className="text-[#8a6bfe]" /> Expériences professionnelles
            </h2>

            <div className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-0 before:bottom-0 before:w-1 before:bg-[#ddc2ff] before:rounded-full">
              {experiences
                .slice()
                .sort((a, b) => {
                  if (!a.startDate) return 1;
                  if (!b.startDate) return -1;
                  return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                })
                .map((exp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative bg-white border border-[#ddc2ff] rounded-2xl p-6 mb-6 shadow-sm hover:shadow-md hover:bg-[#f5e5ff]/60 transition"
                  >
                    <span className="absolute -left-[14px] top-6 w-4 h-4 bg-[#8a6bfe] rounded-full border-2 border-[#ddc2ff] shadow-md"></span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {exp.title || 'Poste non précisé'}
                    </h3>
                    {exp.company && (
                      <p className="flex items-center gap-1 text-sm text-gray-700 mt-1">
                        <Building2 size={14} className="text-[#8a6bfe]" /> {exp.company}
                      </p>
                    )}
                    {(exp.startDate || exp.endDate) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {exp.startDate || '—'} → {exp.endDate || 'Présent'}
                      </p>
                    )}
                    {exp.description && (
                      <p className="mt-3 text-gray-700 leading-relaxed">{exp.description}</p>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* 📋 Annonces */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#8a6bfe]">
            <Briefcase className="text-[#8a6bfe]" /> Annonces publiées
          </h2>

          {annonces.length === 0 ? (
            <p className="text-gray-600">Aucune annonce publiée pour le moment.</p>
          ) : (
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
            >
              {annonces.map((a) => (
                <motion.div
                  key={a.id}
                  whileHover={{ scale: 1.03 }}
                  className="block bg-white border border-[#ddc2ff] rounded-2xl p-5 hover:bg-[#f5e5ff]/50 hover:border-[#8a6bfe] shadow-sm hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {a.description}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <CalendarIcon size={14} className="text-[#8a6bfe]" />{' '}
                      {a.date || 'Date non spécifiée'}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#8a6bfe]" /> {a.lieu || 'Lieu inconnu'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Euro size={14} className="text-[#8a6bfe]" /> {a.remuneration} €/h
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
