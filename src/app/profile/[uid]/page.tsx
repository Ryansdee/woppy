'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Building2, ChevronRight, MapPin, MessageSquare, Star } from 'lucide-react';
import { openChat } from '@/lib/chat';
import { formatRate, shortPlace } from '@/lib/annonce';
import { Avatar, Badge, EmptyState, Loading, Page, PageHeader, Section } from '@/components/ui';

interface Experience { title: string; company?: string; startDate?: string; endDate?: string; description?: string }
type Slot = { start?: string; end?: string };
type DaySchedule = { enabled?: boolean; slots?: Slot[]; start?: string; end?: string };
interface UserProfile {
  id: string; firstName?: string; lastName?: string;
  photoURL?: string; city?: string; bio?: string; createdAt?: Timestamp;
  experiences?: Experience[];
  hasStudentProfile?: boolean;
  studentProfile?: { age?: string; description?: string; hourlyRate?: string };
  availabilitySchedule?: Record<string, DaySchedule>;
}
interface Annonce { id: string; titre?: string; description?: string; date?: string; lieu?: string; remuneration?: number; rateMode?: string; statut: string }
interface Review { id: string; rating?: number; comment?: string; createdAt?: Timestamp }

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const STATUS: Record<string, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  ouverte: { label: 'Ouverte', tone: 'success' },
  'en cours': { label: 'En cours', tone: 'warning' },
  fini: { label: 'Terminée', tone: 'neutral' },
};

/* Accepte l'ancien format ({ start, end }) et le nouveau ({ slots: [...] }) */
function slotsOf(d?: DaySchedule): Slot[] {
  if (!d?.enabled) return [];
  const slots = d.slots?.length ? d.slots : d.start || d.end ? [{ start: d.start, end: d.end }] : [];
  return slots.filter((s) => s.start || s.end);
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const uid = typeof params.uid === 'string' ? params.uid : Array.isArray(params.uid) ? params.uid[0] : undefined;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [jobsDone, setJobsDone] = useState(0);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<User | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setMe), []);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) setProfile({ id: snap.id, ...snap.data() } as UserProfile);
        const aSnap = await getDocs(query(collection(db, 'annonces'), where('userId', '==', uid)));
        setAnnonces(aSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Annonce));
      } catch {} finally {
        setLoading(false);
      }
    })();
    getDocs(query(collection(db, 'reviews'), where('reviewedId', '==', uid)))
      .then((snap) => setReviews(snap.docs.filter((d) => d.data().status !== 'pending').map((d) => ({ id: d.id, ...d.data() }) as Review)))
      .catch(() => {});
    getDocs(query(collection(db, 'annonces'), where('acceptedUserId', '==', uid), where('statut', '==', 'fini')))
      .then((s) => setJobsDone(s.size))
      .catch(() => {});
  }, [uid]);

  async function message() {
    if (!me || !uid) { router.push('/auth/login'); return; }
    setOpening(true);
    try {
      router.push(`/messages?chatId=${await openChat(me.uid, uid)}`);
    } catch {
      setOpening(false);
    }
  }

  if (loading) return <Loading full />;

  if (!profile) {
    return (
      <Page narrow>
        <div className="card">
          <EmptyState title="Profil introuvable" action={<Link href="/students" className="btn btn-outline">Retour aux étudiants</Link>} />
        </div>
      </Page>
    );
  }

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Utilisateur';
  const about = profile.studentProfile?.description || profile.bio;
  const avg = reviews.length ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length : null;
  const memberSince = profile.createdAt?.toDate?.().toLocaleDateString('fr-BE', { month: 'long', year: 'numeric' });
  const availability = DAYS.map((day) => ({ day, slots: slotsOf(profile.availabilitySchedule?.[day]) })).filter((d) => d.slots.length);
  const experiences = profile.experiences?.filter((e) => e.title) ?? [];

  return (
    <Page>
      <PageHeader back={{ href: '/students', label: 'Étudiants' }} title={name} />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <div className="card p-6 text-center">
            <div className="flex justify-center"><Avatar name={name} src={profile.photoURL} size={88} /></div>
            <p className="mt-4 text-lg font-semibold">{name}</p>
            {profile.city && <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-muted"><MapPin size={13} /> {profile.city}</p>}
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {profile.hasStudentProfile && <Badge tone="brand">Étudiant</Badge>}
              {avg !== null && <Badge tone="warning"><Star size={11} className="fill-current" /> {avg.toFixed(1).replace('.', ',')} ({reviews.length})</Badge>}
              <Badge>{jobsDone} mission{jobsDone > 1 ? 's' : ''} réalisée{jobsDone > 1 ? 's' : ''}</Badge>
              {profile.studentProfile?.hourlyRate && <Badge>{profile.studentProfile.hourlyRate} €/h</Badge>}
            </div>
            {memberSince && <p className="mt-4 text-xs text-muted">Membre depuis {memberSince}</p>}
            {me && me.uid !== uid && (
              <button onClick={message} disabled={opening} className="btn btn-primary mt-5 w-full">
                <MessageSquare size={15} /> Envoyer un message
              </button>
            )}
          </div>

          {availability.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold">Disponibilités</p>
              <dl className="mt-3 space-y-2 text-sm">
                {availability.map(({ day, slots }) => (
                  <div key={day} className="flex justify-between gap-3">
                    <dt className="text-muted">{day}</dt>
                    <dd className="text-right font-medium">{slots.map((s) => `${s.start || '?'}–${s.end || '?'}`).join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </aside>

        <div className="space-y-6">
          <Section title="À propos">
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-2">{about || 'Pas encore de présentation.'}</p>
          </Section>

          {experiences.length > 0 && (
            <Section title="Expériences">
              <ul className="space-y-4">
                {experiences.map((exp, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-paper-2 text-muted"><Building2 size={15} /></span>
                    <div className="min-w-0">
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-sm text-muted">
                        {[exp.company, exp.startDate || exp.endDate ? `${exp.startDate || '—'} → ${exp.endDate || 'aujourd’hui'}` : null].filter(Boolean).join(' · ')}
                      </p>
                      {exp.description && <p className="mt-1 text-sm text-ink-2">{exp.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title={`Avis reçus${reviews.length ? ` (${reviews.length})` : ''}`}>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted">Aucun avis pour l’instant.</p>
            ) : (
              <ul className="divide-y divide-line">
                {reviews.map((r) => (
                  <li key={r.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={13} className={n <= (r.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-line text-line'} />
                        ))}
                      </div>
                      {r.createdAt?.toDate && <span className="text-xs text-muted">{r.createdAt.toDate().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                    </div>
                    {r.comment && <p className="mt-1.5 text-sm text-ink-2">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {annonces.length > 0 && (
            <section className="card">
              <div className="border-b border-line px-5 py-4"><h2 className="text-[15px] font-semibold">Annonces publiées</h2></div>
              <ul className="divide-y divide-line">
                {annonces.map((a) => {
                  const st = STATUS[a.statut] ?? STATUS.ouverte;
                  return (
                    <li key={a.id}>
                      <Link href={`/jobs/${a.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-paper-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{a.titre || a.description}</p>
                          <p className="mt-0.5 text-sm text-muted">
                            {[shortPlace(a.lieu), a.date, a.remuneration != null ? formatRate(a.remuneration, a.rateMode) : null].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <Badge tone={st.tone}>{st.label}</Badge>
                        <ChevronRight size={16} className="text-muted" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Page>
  );
}
