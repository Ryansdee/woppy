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
  const [isMobile, setIsMobile]       = useState(false);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [avgRating, setAvgRating]     = useState<number | null>(null);
  const [jobsDone, setJobsDone]       = useState(0);

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
          const list: Review[] = snap.docs
          .filter(d => d.data().status !== 'pending')
          .map(d => ({ id: d.id, ...d.data() as any }));
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

  async function handleMessage() {
    if (!currentUser || !uid) return;
    const chat = await addDoc(collection(db, 'chats'), {
      participants: [currentUser.uid, uid], createdAt: serverTimestamp(),
      lastMessage: '', lastMessageTime: serverTimestamp(), typing: {},
    });
    router.push(`/messages?chatId=${chat.id}`);
  }

  if (loading) return (
    <div className="min-h-screen bg-paper-2 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-ink flex items-center justify-center animate-pulse">
          <Briefcase size={18} className="text-white" />
        </div>
        <p className="text-sm text-muted">Chargement…</p>
      </div>
    </div>
  );

  if (!userProfile) return (
    <div className="min-h-screen bg-paper-2 flex flex-col items-center justify-center gap-3">
      <p className="text-sm text-muted">Profil introuvable.</p>
      <Link href="/students" className="text-xs text-brand hover:underline">Retour aux étudiants</Link>
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
      <style>{`
        .rbc-toolbar button { font-size: 12px !important; }
        .rbc-event { background: #7357f6 !important; border: none !important; border-radius: 6px !important; font-size: 11px !important; }
        .rbc-today { background: #efebff !important; }
      `}</style>

      <div className="min-h-screen bg-paper-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-line sticky top-16 z-40">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
            <Link href="/students" className="p-1.5 rounded-lg hover:bg-paper-2 text-muted hover:text-ink-2 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div className="w-px h-4 bg-line" />
            <span className="text-sm font-semibold text-ink truncate" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
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
                className="bg-white rounded-2xl border border-line p-6 text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image src={avatarUrl} alt={fullName} width={80} height={80}
                    className="rounded-2xl object-cover border border-line w-full h-full" />
                </div>
                <h1 className="font-bold text-base text-ink mb-1 tracking-tight" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
                  {fullName}
                </h1>
                {userProfile.city && (
                  <p className="text-xs text-muted flex items-center justify-center gap-1 mb-3">
                    <MapPin size={10} />
                    <a href={`https://www.google.com/maps/place/${userProfile.city}`} target="_blank"
                      className="hover:text-brand transition-colors">{userProfile.city}</a>
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
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-soft text-brand-dark border border-brand/30">
                      {studentProfile.hourlyRate} €/h
                    </span>
                  )}
                  {studentProfile?.age && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-paper-2 text-ink-2 border border-line">
                      {studentProfile.age} ans
                    </span>
                  )}
                </div>

                {userProfile.createdAt?.seconds && (
                  <p className="text-[11px] text-muted">
                    Membre depuis {new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('fr-BE', { month: 'long', year: 'numeric' })}
                  </p>
                )}

                {currentUser && currentUser.uid !== uid && (
                  <button onClick={handleMessage}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-ink hover:bg-ink-2
                               text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-brand/30">
                    <MessageSquare size={14} /> Envoyer un message
                  </button>
                )}
              </motion.div>

              {/* Bio */}
              {(userProfile.bio || studentProfile?.description) && (
                <div className="bg-white rounded-2xl border border-line p-5">
                  <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">À propos</h2>
                  <p className="text-sm text-ink-2 leading-relaxed">
                    {studentProfile?.description || userProfile.bio}
                  </p>
                  {studentProfile?.description && userProfile.bio && (
                    <p className="text-xs text-muted mt-2 italic">{userProfile.bio}</p>
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
                      <div key={r.id} className="p-4 bg-paper-2 border border-line rounded-xl">
                        <div className="flex items-center gap-1 mb-2">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={13}
                              className={n <= (r.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-line fill-line'} />
                          ))}
                          <span className="text-xs font-semibold text-ink-2 ml-1">{r.rating}/5</span>
                        </div>
                        {r.comment && <p className="text-sm text-ink-2 leading-relaxed mb-1.5">{r.comment}</p>}
                        <p className="text-[11px] text-muted">
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
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-brand-soft border border-brand-soft rounded-xl">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                          <span className="text-sm font-medium text-brand-dark">{ev.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden border border-line">
                      <BigCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 420 }}
                        views={['week']}
                        defaultView="week"
                        eventPropGetter={() => ({
                          style: { backgroundColor: '#7357f6', color: 'white', borderRadius: '6px', border: 'none', fontSize: '11px' }
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
                        className="p-4 bg-paper-2 border border-line rounded-xl">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-ink mb-0.5" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>{exp.title}</h3>
                            {exp.company && (
                              <p className="text-xs text-muted flex items-center gap-1 mb-1">
                                <Building2 size={11} /> {exp.company}
                              </p>
                            )}
                            {exp.description && <p className="text-xs text-ink-2 leading-relaxed mt-1.5">{exp.description}</p>}
                          </div>
                          {(exp.startDate || exp.endDate) && (
                            <span className="shrink-0 text-[11px] text-muted whitespace-nowrap">
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
                  <p className="text-sm text-muted text-center py-6">Aucune annonce publiée.</p>
                ) : (
                  <div className="space-y-2">
                    {annonces.map(a => {
                      const cfg = STATUS_CFG[a.statut] || STATUS_CFG['ouverte'];
                      return (
                        <Link key={a.id} href={`/jobs/${a.id}`}
                          className="group flex items-center justify-between p-4 bg-paper-2 border border-line
                                     hover:border-brand/30 hover:bg-brand-soft/30 rounded-xl transition-all">
                          <div className="flex-1 min-w-0 mr-3">
                            <h3 className="text-sm font-semibold text-ink group-hover:text-brand-dark transition-colors truncate mb-1">
                              {a.titre || a.description}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-xs text-muted">
                              {a.lieu && <span className="flex items-center gap-1"><MapPin size={10} />{a.lieu}</span>}
                              {a.date && <span className="flex items-center gap-1"><CalendarIcon size={10} />{a.date}</span>}
                              {a.remuneration && <span className="font-semibold text-brand">{a.remuneration} €/h</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                              {cfg.label}
                            </span>
                            <ChevronRight size={13} className="text-muted group-hover:text-brand transition-colors" />
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
    <div className="bg-white rounded-2xl border border-line overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h2 className="text-xs font-bold text-muted uppercase tracking-widest">{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="text-[11px] font-bold text-muted bg-paper-2 px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}