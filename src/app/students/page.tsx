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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center animate-pulse">
          <GraduationCap size={18} className="text-white" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Chargement…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&display=swap');`}</style>

      <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Nom, ville, compétence…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50
                           placeholder:text-slate-400 text-slate-800
                           focus:outline-none focus:ring-2 focus:ring-violet-400/25 focus:border-violet-400
                           focus:bg-white transition-all" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  <X size={13} />
                </button>
              )}
            </div>

            <button onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border transition-all ${
                showFilters ? 'border-violet-300 text-violet-600 bg-violet-50' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200'
              }`}>
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filtres</span>
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>

            <span className="ml-auto text-xs text-slate-400 hidden sm:block">
              {totalCount} profils · {availableCount} disponibles
            </span>
          </div>

          {showFilters && (
            <div className="border-t border-slate-100 bg-white px-6 py-3 flex flex-wrap gap-2 items-center">
              {[
                { label: `Tous (${totalCount})`, value: null },
                { label: `Disponibles (${availableCount})`, value: true },
                { label: `Indisponibles (${totalCount - availableCount})`, value: false },
              ].map(btn => (
                <button key={String(btn.value)} onClick={() => setFilterAvailable(btn.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filterAvailable === btn.value
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                  }`}>
                  {btn.label}
                </button>
              ))}
              {cities.length > 0 && (
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-400/25 text-slate-600">
                  <option value="all">Toutes les villes</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              {activeFilters > 0 && (
                <button onClick={() => { setFilterAvailable(null); setSelectedCity('all'); }}
                  className="text-xs text-slate-400 hover:text-violet-600 transition-colors ml-1">
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Page header ── */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-bold text-2xl text-slate-900 tracking-tight mb-1"
                style={{ fontFamily: 'Sora, system-ui' }}>
                Étudiants
              </h1>
              <p className="text-sm text-slate-500">
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
                {search && ` pour "${search}"`}
                {activeFilters > 0 && (
                  <button onClick={() => { setFilterAvailable(null); setSelectedCity('all'); }}
                    className="ml-2 text-violet-600 hover:text-violet-700 font-medium transition-colors">
                    · Réinitialiser les filtres
                  </button>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedCity !== 'all' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">
                  <MapPin size={10} /> {selectedCity}
                  <button onClick={() => setSelectedCity('all')}><X size={10} /></button>
                </span>
              )}
              {filterAvailable !== null && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">
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
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Search size={20} className="text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">Aucun résultat</h3>
              <p className="text-sm text-slate-400 mb-5">Modifie ta recherche ou réinitialise les filtres.</p>
              <button onClick={() => { setSearch(''); setFilterAvailable(null); setSelectedCity('all'); }}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition">
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
    <div className="group bg-white rounded-2xl border border-slate-100 hover:border-violet-200
                    hover:shadow-[0_8px_32px_rgba(124,95,230,0.1)] transition-all duration-200 overflow-hidden flex flex-col">

      {/* Top strip */}
      <div className="relative h-14 bg-transparent border-b border-transparent"></div>

      {/* Avatar */}
      <div className="-mt-7 px-5">
        <img src={student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c5fe6&color=fff`}
          alt={name}
          className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-md bg-violet-100 z-10" />
      </div>

      {/* Content */}
      <div className="px-5 pt-2 pb-5 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-slate-900 mb-0.5 group-hover:text-violet-700 transition-colors"
          style={{ fontFamily: 'Sora, system-ui' }}>
          {name}
        </h3>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {student.city && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin size={10} /> {student.city}
            </span>
          )}
          {student.studentProfile?.hourlyRate && (
            <span className="text-xs font-bold text-violet-600">{student.studentProfile.hourlyRate} €/h</span>
          )}
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1 leading-relaxed">
          {student.studentProfile?.description || student.bio || 'Étudiant disponible pour des missions.'}
        </p>

        {student.studentProfile?.experiences && student.studentProfile.experiences.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <BookOpen size={9} /> Expériences
            </p>
            {student.studentProfile.experiences.slice(0, 2).map(exp => (
              <p key={exp.id} className="text-xs text-slate-500 truncate">· {exp.title}</p>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-3 border-t border-slate-50">
          <Link href={`/profile/${student.uid}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-violet-600 hover:bg-violet-700
                       text-white text-xs font-semibold rounded-xl transition-all">
            Voir le profil <ChevronRight size={11} />
          </Link>
          {currentUser && currentUser.uid !== student.uid && (
            <button onClick={() => onMessage(student.uid)} title="Envoyer un message"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-violet-600 rounded-xl transition-all">
              <MessageSquare size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}