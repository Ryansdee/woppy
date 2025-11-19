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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-700 text-center bg-[#f5e5ff]">
        <p className="text-lg font-semibold">Profil introuvable</p>
        <Link href="/jobs" className="mt-4 text-[#8a6bfe] hover:underline">
          Retour
        </Link>
      </div>
    );

  const { studentProfile, experiences } = userProfile;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f5ff] via-[#f5eaff] to-[#faf5ff] text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-[#8a6bfe] transition mb-8 font-medium"
        >
          <ArrowLeft size={18} /> Retour
        </Link>

        {/* 👤 Profil principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-[#ddc2ff] shadow-lg hover:shadow-xl transition"
        >
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-[#ddc2ff]/50 rounded-full"></div>
            <Image
              src={
                userProfile.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  `${userProfile.firstName} ${userProfile.lastName}`
                )}&background=8a6bfe&color=fff&size=128`
              }
              alt={userProfile.firstName}
              width={150}
              height={150}
              className="relative rounded-full border-4 border-[#8a6bfe]/80 object-cover shadow-xl"
            />
          </div>

          <div className="flex-1 w-full space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#8a6bfe]">
              {userProfile.firstName} {userProfile.lastName}
            </h1>
            <p className="text-gray-500 text-sm">
              <a href={`mailto:${userProfile.email}`} className="hover:underline">
                {userProfile.email}
              </a>
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
              {studentProfile?.hourlyRate && (
                <span className="px-4 py-1.5 bg-[#8a6bfe]/10 text-[#8a6bfe] rounded-full font-medium text-sm border border-[#8a6bfe]/30">
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

            {studentProfile?.description && (
              <p className="mt-3 text-gray-700 leading-relaxed bg-[#f5e5ff]/40 p-4 rounded-xl border border-[#ddc2ff]/60">
                {studentProfile.description}
              </p>
            )}

            {userProfile.bio && (
              <p className="italic text-gray-600 leading-relaxed">{userProfile.bio}</p>
            )}

            <p className="text-xs text-gray-500">
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
                className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
              >
                <MessageSquare size={18} /> Envoyer un message
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* 📅 Calendrier ou Liste de disponibilités */}
        {events && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-14"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#8a6bfe]">
              <CalendarIcon /> Disponibilités
            </h2>

            <div className="bg-white border border-[#ddc2ff]/70 rounded-2xl p-4 shadow-md">
              {isMobile ? (
                <div className="space-y-3">
                  {events.map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-[#f8f2ff]/60 border border-[#ddc2ff]/50 rounded-xl text-sm"
                    >
                      <span className="font-medium text-[#8a6bfe]">
                        {ev.title.split(' ')[0]}
                      </span>
                      <span className="text-gray-700">
                        {ev.start.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {ev.end.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative w-full overflow-x-auto rounded-xl border border-[#ddc2ff]/50">
                  <div className="min-w-[600px]">
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
                        today: "Aujourd'hui",
                        previous: '←',
                        next: '→',
                      }}
                      eventPropGetter={() => ({
                        style: {
                          backgroundColor: '#8a6bfe',
                          color: 'white',
                          borderRadius: '10px',
                          border: 'none',
                        },
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 💼 Expériences */}
        {experiences && experiences.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-14"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-[#8a6bfe]">
              <Star /> Expériences professionnelles
            </h2>
            <div className="space-y-6">
              {experiences.map((exp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-[#ddc2ff]/70 rounded-2xl p-6 shadow-sm hover:shadow-md hover:bg-[#f8f2ff]/70 transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                  {exp.company && (
                    <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
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
          </motion.div>
        )}

        {/* 📋 Annonces publiées */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-14"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#8a6bfe]">
            <Briefcase /> Annonces publiées
          </h2>

          {annonces.length === 0 ? (
            <p className="text-gray-600">Aucune annonce publiée pour le moment.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {annonces.map((a) => (
                <motion.div
                  key={a.id}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white border border-[#ddc2ff]/70 rounded-2xl p-5 hover:bg-[#f5e5ff]/50 hover:border-[#8a6bfe] shadow-sm hover:shadow-md transition"
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
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
