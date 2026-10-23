'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Loader2, Search, MessageSquare, MapPin,
  X, BookOpen, SlidersHorizontal, ChevronRight,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';

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
  const [showFilters, setShowFilters]     = useState(false);
  const [currentUser, setCurrentUser]     = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('hasStudentProfile', '==', true));
    const unsub = onSnapshot(q, snap => {
      setStudents(snap.docs.map(d => ({ uid: d.id, ...d.data() })) as Student[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleMessage(targetUid: string) {
    if (!currentUser) { router.push('/auth/login'); return; }
    const newChat = await addDoc(collection(db, 'chats'), {
      participants: [currentUser.uid, targetUid],
      createdAt: serverTimestamp(), lastMessage: '',
      lastMessageTime: serverTimestamp(), typing: {},
    });
    router.push(`/messages?chatId=${newChat.id}`);
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

  if (loading) return (
    <div className="min-h-screen bg-paper-2 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-ink flex items-center justify-center animate-pulse">
          <GraduationCap size={18} className="text-white" />
        </div>
        <p className="text-sm text-muted font-medium">Chargement…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{``}</style>

      <div className="min-h-screen bg-paper-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-line sticky top-16 z-40">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input type="text" placeholder="Nom, ville, compétence…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-line bg-paper-2
                           placeholder:text-muted text-ink
                           focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand
                           focus:bg-white transition-all" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink-2 transition">
                  <X size={13} />
                </button>
              )}
            </div>

            <button onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border transition-all ${
                showFilters ? 'border-brand/50 text-brand bg-brand-soft' : 'border-line bg-white text-ink-2 hover:border-brand/30'
              }`}>
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filtres</span>
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-ink text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>

            <span className="ml-auto text-xs text-muted hidden sm:block">
              {totalCount} profils · {availableCount} disponibles
            </span>
          </div>

          {showFilters && (
            <div className="border-t border-line bg-white px-6 py-3 flex flex-wrap gap-2 items-center">
              {[
                { label: `Tous (${totalCount})`, value: null },
                { label: `Disponibles (${availableCount})`, value: true },
                { label: `Indisponibles (${totalCount - availableCount})`, value: false },
              ].map(btn => (
                <button key={String(btn.value)} onClick={() => setFilterAvailable(btn.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filterAvailable === btn.value
                      ? 'bg-ink text-white border-brand'
                      : 'bg-white text-ink-2 border-line hover:border-brand/50'
                  }`}>
                  {btn.label}
                </button>
              ))}
              {cities.length > 0 && (
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-line rounded-lg focus:ring-2 focus:ring-brand/25 text-ink-2">
                  <option value="all">Toutes les villes</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              {activeFilters > 0 && (
                <button onClick={() => { setFilterAvailable(null); setSelectedCity('all'); }}
                  className="text-xs text-muted hover:text-brand transition-colors ml-1">
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Page header ── */}
        <div className="bg-white border-b border-line">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-bold text-2xl text-ink tracking-tight mb-1"
                style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
                Étudiants
              </h1>
              <p className="text-sm text-muted">
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
                {search && ` pour "${search}"`}
                {activeFilters > 0 && (
                  <button onClick={() => { setFilterAvailable(null); setSelectedCity('all'); }}
                    className="ml-2 text-brand hover:text-brand-dark font-medium transition-colors">
                    · Réinitialiser les filtres
                  </button>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedCity !== 'all' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-soft text-brand-dark border border-brand/30 px-2.5 py-1 rounded-full">
                  <MapPin size={10} /> {selectedCity}
                  <button onClick={() => setSelectedCity('all')}><X size={10} /></button>
                </span>
              )}
              {filterAvailable !== null && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-soft text-brand-dark border border-brand/30 px-2.5 py-1 rounded-full">
                  {filterAvailable ? 'Disponibles' : 'Indisponibles'}
                  <button onClick={() => setFilterAvailable(null)}><X size={10} /></button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-14 h-14 rounded-2xl bg-paper-2 flex items-center justify-center mb-4">
                <Search size={20} className="text-muted" />
              </div>
              <h3 className="text-base font-semibold text-ink mb-1">Aucun résultat</h3>
              <p className="text-sm text-muted mb-5">Modifie ta recherche ou réinitialise les filtres.</p>
              <button onClick={() => { setSearch(''); setFilterAvailable(null); setSelectedCity('all'); }}
                className="px-4 py-2 bg-ink text-white rounded-xl text-sm font-semibold hover:bg-ink-2 transition">
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(student => (
                <StudentCard key={student.uid} student={student} currentUser={currentUser} onMessage={handleMessage} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════ */
function StudentCard({ student, currentUser, onMessage }: {
  student: Student; currentUser: any; onMessage: (uid: string) => void;
}) {
  const name = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.username || 'Étudiant';

  return (
    <div className="group bg-white rounded-2xl border border-line hover:border-brand/30
                    hover:shadow-[0_8px_32px_rgba(124,95,230,0.1)] transition-all duration-200 overflow-hidden flex flex-col">

      {/* Top strip */}
      <div className="relative h-14 bg-transparent border-b border-transparent"></div>

      {/* Avatar */}
      <div className="-mt-7 px-5">
        <img src={student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c5fe6&color=fff`}
          alt={name}
          className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-md bg-brand-soft z-10" />
      </div>

      {/* Content */}
      <div className="px-5 pt-2 pb-5 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-ink mb-0.5 group-hover:text-brand-dark transition-colors"
          style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
          {name}
        </h3>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {student.city && (
            <span className="text-xs text-muted flex items-center gap-1">
              <MapPin size={10} /> {student.city}
            </span>
          )}
          {student.studentProfile?.hourlyRate && (
            <span className="text-xs font-bold text-brand">{student.studentProfile.hourlyRate} €/h</span>
          )}
        </div>

        <p className="text-xs text-muted line-clamp-2 mb-3 flex-1 leading-relaxed">
          {student.studentProfile?.description || student.bio || 'Étudiant disponible pour des missions.'}
        </p>

        {student.studentProfile?.experiences && student.studentProfile.experiences.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1 mb-1">
              <BookOpen size={9} /> Expériences
            </p>
            {student.studentProfile.experiences.slice(0, 2).map(exp => (
              <p key={exp.id} className="text-xs text-muted truncate">· {exp.title}</p>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-3 border-t border-line">
          <Link href={`/profile/${student.uid}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-ink hover:bg-ink-2
                       text-white text-xs font-semibold rounded-xl transition-all">
            Voir le profil <ChevronRight size={11} />
          </Link>
          {currentUser && currentUser.uid !== student.uid && (
            <button onClick={() => onMessage(student.uid)} title="Envoyer un message"
              className="px-3 py-2 bg-paper-2 hover:bg-line text-ink-2 hover:text-brand rounded-xl transition-all">
              <MessageSquare size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}