'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { openChat } from '@/lib/chat';
import { onAuthStateChanged } from 'firebase/auth';
import { Search, MessageSquare, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import { Avatar, Badge, EmptyState, Loading, Page, PageHeader, Tabs } from '@/components/ui';

interface Student {
  uid: string;
  firstName?: string; lastName?: string; username?: string;
  photoURL?: string; bio?: string; isAvailable?: boolean;
  hasStudentProfile?: boolean; city?: string;
  studentProfile?: {
    description?: string; hourlyRate?: string;
    experiences?: { id: string; title: string; description: string; hourlyRate?: string; }[];
  };
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents]           = useState<Student[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [selectedCity, setSelectedCity]   = useState('all');
  const [currentUser, setCurrentUser]     = useState<{ uid: string } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('hasStudentProfile', '==', true));
    const unsub = onSnapshot(q, snap => {
      setStudents(snap.docs.map(d => ({ uid: d.id, ...d.data() })) as Student[]);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  async function handleMessage(targetUid: string) {
    if (!currentUser) { router.push('/auth/login'); return; }
    router.push(`/messages?chatId=${await openChat(currentUser.uid, targetUid)}`);
  }

  const cities = useMemo(() => {
    const s = new Set(
      students.filter(s => filterAvailable === null || s.isAvailable === filterAvailable)
        .map(s => s.city).filter(Boolean)
    );
    return Array.from(s).sort();
  }, [students, filterAvailable]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students
      .map(s => {
        const text = [s.firstName, s.lastName, s.username, s.city, s.bio,
          s.studentProfile?.description,
          s.studentProfile?.experiences?.map(e => `${e.title} ${e.description}`).join(' '),
        ].filter(Boolean).join(' ').toLowerCase();
        const score = (s.firstName?.toLowerCase().includes(q) ? 2 : 0) +
          (s.lastName?.toLowerCase().includes(q) ? 2 : 0) +
          (text.includes(q) ? 1 : 0);
        return { ...s, score,
          matchesAvailability: filterAvailable === null || s.isAvailable === filterAvailable,
          matchesCity: selectedCity === 'all' || s.city === selectedCity,
        };
      })
      .filter(s => (q === '' || s.score > 0) && s.matchesAvailability && s.matchesCity)
      .sort((a, b) => b.score - a.score);
  }, [students, search, filterAvailable, selectedCity]);

  const totalCount     = students.length;
  const availableCount = students.filter(s => s.isAvailable).length;
  const activeFilters  = [filterAvailable !== null, selectedCity !== 'all'].filter(Boolean).length;

  if (loading) return <Loading full />;

  const resetFilters = () => { setFilterAvailable(null); setSelectedCity('all'); };

  return (
    <Page>
      <PageHeader
        title="Étudiants"
        description={`${totalCount} profil${totalCount !== 1 ? 's' : ''} · ${availableCount} disponible${availableCount !== 1 ? 's' : ''}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[200px] flex-1">
          <span className="sr-only">Rechercher un étudiant</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Nom, ville, compétence…" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9 pr-9" />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
              <X size={15} />
            </button>
          )}
        </label>
        <Tabs
          value={filterAvailable === null ? 'all' : filterAvailable ? 'yes' : 'no'}
          onChange={(v) => setFilterAvailable(v === 'all' ? null : v === 'yes')}
          items={[
            { value: 'all', label: 'Tous' },
            { value: 'yes', label: 'Disponibles' },
            { value: 'no', label: 'Indisponibles' },
          ]}
        />
        {cities.length > 0 && (
          <select aria-label="Ville" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="input w-auto">
            <option value="all">Toutes les villes</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        {activeFilters > 0 && <button onClick={resetFilters} className="btn btn-ghost">Réinitialiser</button>}
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description="Modifiez votre recherche ou vos filtres."
              action={<button onClick={() => { setSearch(''); resetFilters(); }} className="btn btn-outline">Tout réinitialiser</button>}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((student) => (
              <StudentCard key={student.uid} student={student} canMessage={!!currentUser && currentUser.uid !== student.uid} onMessage={handleMessage} />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

function StudentCard({ student, canMessage, onMessage }: { student: Student; canMessage: boolean; onMessage: (uid: string) => void }) {
  const name = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.username || 'Étudiant';
  const about = student.studentProfile?.description || student.bio;

  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-center gap-3">
        <Avatar name={name} src={student.photoURL} size={48} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          {student.city && (
            <p className="flex items-center gap-1 text-sm text-muted"><MapPin size={13} /> {student.city}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {student.isAvailable && <Badge tone="success" dot>Disponible</Badge>}
        {student.studentProfile?.hourlyRate && <Badge>{student.studentProfile.hourlyRate} €/h</Badge>}
      </div>
      <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted">{about || 'Pas encore de présentation.'}</p>
      <div className="mt-4 flex gap-2 border-t border-line pt-4">
        <Link href={`/profile/${student.uid}`} className="btn btn-outline btn-sm flex-1">Voir le profil</Link>
        {canMessage && (
          <button onClick={() => onMessage(student.uid)} aria-label={`Envoyer un message à ${name}`} className="btn btn-outline btn-sm">
            <MessageSquare size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
