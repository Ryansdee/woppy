'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import {
  doc, getDoc, collection, query, where,
  getDocs, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Loader2, MapPin, Euro, Calendar as CalendarIcon,
  Briefcase, ArrowLeft, Star, MessageSquare, Building2,
  ChevronRight, Clock, CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import * as frLocale from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales   = { fr: frLocale };
const localizer = dateFnsLocalizer({
  format, parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay, locales,
});

interface Experience {
  title: string; company?: string;
  startDate?: string; endDate?: string; description?: string;
}
interface UserProfile {
  id: string; firstName: string; lastName: string; email: string;
  photoURL?: string; city?: string; bio?: string; createdAt?: any;
  experiences?: Experience[];
  studentProfile?: { age?: string; description?: string; hourlyRate?: string; };
  availabilitySchedule?: Record<string, any>;
}
interface Annonce {
  id: string; titre?: string; description: string; date: string;
  duree: string; lieu: string; remuneration: number; statut: string; userId: string;
}
interface Review {
  id: string; rating?: number; comment?: string; createdAt?: any;
}

const STATUS_CFG: Record<string, { label: string; dot: string; color: string; bg: string; border: string }> = {
  ouverte:   { label: "Ouverte",   dot: "#22c55e", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  "en cours":{ label: "En cours",  dot: "#f59e0b", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  fini:      { label: "Terminée",  dot: "#94a3b8", color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const uid = typeof params.uid === 'string' ? params.uid : Array.isArray(params.uid) ? params.uid[0] : undefined;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [annonces, setAnnonces]       = useState<Annonce[]>([]);
  const [loading, setLoading]         = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
<<<<<<< HEAD
  const [isMobile, setIsMobile]       = useState(false);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [avgRating, setAvgRating]     = useState<number | null>(null);
  const [jobsDone, setJobsDone]       = useState(0);
=======
  const [isMobile, setIsMobile] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    h(); window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) setUserProfile({ id: snap.id, ...snap.data() } as UserProfile);
        const aSnap = await getDocs(query(collection(db, 'annonces'), where('userId', '==', uid)));
        setAnnonces(aSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Annonce[]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'reviews'), where('reviewedId', '==', uid)));
        const list: Review[] = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        setReviewsList(list);
        if (list.length > 0) setAvgRating(Number((list.reduce((s, r) => s + (Number(r.rating) || 0), 0) / list.length).toFixed(1)));
      } catch (e) { console.error(e); }
    })();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    getDocs(query(collection(db, 'annonces'), where('acceptedUserId', '==', uid), where('statut', '==', 'fini')))
      .then(s => setJobsDone(s.size)).catch(console.error);
  }, [uid]);

<<<<<<< HEAD
  async function handleMessage() {
    if (!currentUser || !uid) return;
    const chat = await addDoc(collection(db, 'chats'), {
      participants: [currentUser.uid, uid], createdAt: serverTimestamp(),
      lastMessage: '', lastMessageTime: serverTimestamp(), typing: {},
    });
    router.push(`/messages?chatId=${chat.id}`);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center animate-pulse">
          <Briefcase size={18} className="text-white" />
        </div>
        <p className="text-sm text-slate-500">Chargement…</p>
      </div>
    </div>
  );

  if (!userProfile) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
      <p className="text-sm text-slate-500">Profil introuvable.</p>
      <Link href="/students" className="text-xs text-violet-600 hover:underline">Retour aux étudiants</Link>
    </div>
  );

  const { studentProfile, experiences } = userProfile;
  const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
  const avatarUrl = userProfile.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=7c5fe6&color=fff&size=128`;

  /* calendar events */
  const events = userProfile.availabilitySchedule
    ? Object.entries(userProfile.availabilitySchedule)
        .filter(([_, v]) => v.enabled && v.start && v.end)
        .map(([day, data]) => {
          const dayMap: Record<string, number> = { Lundi:1,Mardi:2,Mercredi:3,Jeudi:4,Vendredi:5,Samedi:6,Dimanche:0 };
          const today = new Date();
          const diff = (dayMap[day] - today.getDay() + 7) % 7;
          const base = new Date(today); base.setDate(today.getDate() + diff);
          const [sh, sm] = data.start.split(':').map(Number);
          const [eh, em] = data.end.split(':').map(Number);
          const start = new Date(base); start.setHours(sh, sm);
          const end   = new Date(base); end.setHours(eh, em);
          return { title: `${day} (${data.start} – ${data.end})`, start, end, allDay: false };
        })
    : [];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&display=swap');
        .rbc-toolbar button { font-size: 12px !important; }
        .rbc-event { background: #7c5fe6 !important; border: none !important; border-radius: 6px !important; font-size: 11px !important; }
        .rbc-today { background: #f5f3ff !important; }
      `}</style>

      <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
            <Link href="/students" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div className="w-px h-4 bg-slate-200" />
            <span className="text-sm font-semibold text-slate-900 truncate" style={{ fontFamily: 'Sora, system-ui' }}>
              {fullName}
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Sidebar ── */}
            <div className="space-y-4">

              {/* Identity card */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image src={avatarUrl} alt={fullName} width={80} height={80}
                    className="rounded-2xl object-cover border border-slate-200 w-full h-full" />
                </div>
                <h1 className="font-bold text-base text-slate-900 mb-1 tracking-tight" style={{ fontFamily: 'Sora, system-ui' }}>
                  {fullName}
                </h1>
                {userProfile.city && (
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-3">
                    <MapPin size={10} />
                    <a href={`https://www.google.com/maps/place/${userProfile.city}`} target="_blank"
                      className="hover:text-violet-600 transition-colors">{userProfile.city}</a>
                  </p>
                )}

                {/* Stats pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {avgRating !== null && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Star size={10} className="fill-amber-500 text-amber-500" /> {avgRating}/5
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle size={10} /> {jobsDone} mission{jobsDone > 1 ? 's' : ''}
                  </span>
                  {studentProfile?.hourlyRate && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      {studentProfile.hourlyRate} €/h
                    </span>
                  )}
                  {studentProfile?.age && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {studentProfile.age} ans
                    </span>
                  )}
                </div>

                {userProfile.createdAt?.seconds && (
                  <p className="text-[11px] text-slate-400">
                    Membre depuis {new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('fr-BE', { month: 'long', year: 'numeric' })}
                  </p>
                )}

                {currentUser && currentUser.uid !== uid && (
                  <button onClick={handleMessage}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700
                               text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-violet-200">
                    <MessageSquare size={14} /> Envoyer un message
                  </button>
                )}
              </motion.div>

              {/* Bio */}
              {(userProfile.bio || studentProfile?.description) && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">À propos</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {studentProfile?.description || userProfile.bio}
                  </p>
                  {studentProfile?.description && userProfile.bio && (
                    <p className="text-xs text-slate-400 mt-2 italic">{userProfile.bio}</p>
                  )}
                </div>
              )}
            </div>

            {/* ── Main content ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Avis */}
              {reviewsList.length > 0 && (
                <Section title="Avis reçus" count={reviewsList.length}>
                  <div className="space-y-3">
                    {reviewsList.map(r => (
                      <div key={r.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-1 mb-2">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={13}
                              className={n <= (r.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                          ))}
                          <span className="text-xs font-semibold text-slate-600 ml-1">{r.rating}/5</span>
                        </div>
                        {r.comment && <p className="text-sm text-slate-700 leading-relaxed mb-1.5">{r.comment}</p>}
                        <p className="text-[11px] text-slate-400">
                          {r.createdAt?.seconds
                            ? new Date(r.createdAt.seconds * 1000).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Date inconnue'}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Disponibilités */}
              {events.length > 0 && (
                <Section title="Disponibilités">
                  {isMobile ? (
                    <div className="space-y-2">
                      {events.map((ev, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-violet-50 border border-violet-100 rounded-xl">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                          <span className="text-sm font-medium text-violet-700">{ev.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden border border-slate-100">
                      <BigCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 420 }}
                        views={['week']}
                        defaultView="week"
                        eventPropGetter={() => ({
                          style: { backgroundColor: '#7c5fe6', color: 'white', borderRadius: '6px', border: 'none', fontSize: '11px' }
                        })}
                      />
                    </div>
                  )}
                </Section>
              )}

              {/* Expériences */}
              {experiences && experiences.length > 0 && (
                <Section title="Expériences professionnelles" count={experiences.length}>
                  <div className="space-y-3">
                    {experiences.map((exp, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 mb-0.5" style={{ fontFamily: 'Sora, system-ui' }}>{exp.title}</h3>
                            {exp.company && (
                              <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                                <Building2 size={11} /> {exp.company}
                              </p>
                            )}
                            {exp.description && <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{exp.description}</p>}
                          </div>
                          {(exp.startDate || exp.endDate) && (
                            <span className="shrink-0 text-[11px] text-slate-400 whitespace-nowrap">
                              {exp.startDate || '—'} → {exp.endDate || 'Présent'}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Annonces publiées */}
              <Section title="Annonces publiées" count={annonces.length}>
                {annonces.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Aucune annonce publiée.</p>
                ) : (
                  <div className="space-y-2">
                    {annonces.map(a => {
                      const cfg = STATUS_CFG[a.statut] || STATUS_CFG['ouverte'];
                      return (
                        <Link key={a.id} href={`/jobs/${a.id}`}
                          className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100
                                     hover:border-violet-200 hover:bg-violet-50/30 rounded-xl transition-all">
                          <div className="flex-1 min-w-0 mr-3">
                            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-violet-700 transition-colors truncate mb-1">
                              {a.titre || a.description}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                              {a.lieu && <span className="flex items-center gap-1"><MapPin size={10} />{a.lieu}</span>}
                              {a.date && <span className="flex items-center gap-1"><CalendarIcon size={10} />{a.date}</span>}
                              {a.remuneration && <span className="font-semibold text-violet-600">{a.remuneration} €/h</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                              {cfg.label}
                            </span>
                            <ChevronRight size={13} className="text-slate-300 group-hover:text-violet-400 transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </Section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
=======
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
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd
}