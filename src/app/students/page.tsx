'use client';

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  Loader2,
  Search,
  User,
  MessageSquare,
  MapPin,
  Filter,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  uid: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoURL?: string;
  bio?: string;
  isAvailable?: boolean;
  hasStudentProfile?: boolean;
  city?: string;
  studentProfile?: {
    description?: string;
    experiences?: {
      id: string;
      title: string;
      description: string;
      hourlyRate?: string;
    }[];
  };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [selectedCity, setSelectedCity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('hasStudentProfile', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() })) as Student[];
      setStudents(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🏙️ Liste dynamique des villes selon les résultats visibles
  const cities = useMemo(() => {
    const visibleCities = new Set(
      students
        .filter((s) => filterAvailable === null || s.isAvailable === filterAvailable)
        .map((s) => s.city)
        .filter(Boolean)
    );
    return Array.from(visibleCities).sort();
  }, [students, filterAvailable]);

  // 🔍 Filtrage pondéré et optimisé
  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students
      .map((s) => {
        const searchable = [
          s.firstName,
          s.lastName,
          s.username,
          s.city,
          s.bio,
          s.studentProfile?.description,
          s.studentProfile?.experiences
            ?.map((e) => `${e.title} ${e.description}`)
            .join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const score =
          (s.firstName?.toLowerCase().includes(normalizedSearch) ? 2 : 0) +
          (s.lastName?.toLowerCase().includes(normalizedSearch) ? 2 : 0) +
          (searchable.includes(normalizedSearch) ? 1 : 0);

        const matchesAvailability =
          filterAvailable === null || s.isAvailable === filterAvailable;
        const matchesCity = selectedCity === 'all' || s.city === selectedCity;

        return { ...s, score, matchesAvailability, matchesCity };
      })
      .filter(
        (s) =>
          (normalizedSearch === '' || s.score > 0) &&
          s.matchesAvailability &&
          s.matchesCity
      )
      .sort((a, b) => b.score - a.score);
  }, [students, search, filterAvailable, selectedCity]);

  const availableCount = students.filter((s) => s.isAvailable).length;
  const totalCount = students.length;

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
        <Loader2 className="animate-spin w-12 h-12 text-[#8a6bfe]" />
        <p className="text-gray-600 mt-4 font-medium">Chargement des étudiants...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br py-4 from-[#f5e5ff] via-white to-[#e8d5ff]">
      {/* 🎯 Header avec stats */}
      <div className="bg-white/60 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#8a6bfe] to-[#6b4ff0] rounded-xl text-white">
                  <User className="w-6 h-6" />
                </div>
                Étudiants
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} profils • {availableCount} disponibles
              </p>
            </div>

            {/* 🔍 Recherche + Filtres */}
            <div className="flex gap-3 flex-1 lg:max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, ville ou compétence..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white text-[#8a6bfe] border border-[#8a6bfe] rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent outline-none shadow-sm hover:shadow-md transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 bg-white border rounded-xl flex items-center gap-2 transition-all hover:shadow-md ${
                  showFilters ? 'border-[#8a6bfe] text-[#8a6bfe]' : 'border-gray-200 text-gray-700'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filtres</span>
              </button>
            </div>
          </div>

          {/* Résumé des filtres actifs */}
          {(filterAvailable !== null || selectedCity !== 'all' || search) && (
            <div className="flex flex-wrap gap-2 mt-3 text-sm">
              {search && (
                <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2">
                  🔍 {search}
                  <button onClick={() => setSearch('')}>
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </span>
              )}
              {selectedCity !== 'all' && (
                <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2">
                  📍 {selectedCity}
                  <button onClick={() => setSelectedCity('all')}>
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* 🎛️ Filtres déroulants – sans animation JS lourde */}
          {showFilters && (
            <div className="pt-4 pb-2 flex flex-wrap gap-3 transition-all">
              <button
                onClick={() => setFilterAvailable(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterAvailable === null
                    ? 'bg-[#8a6bfe] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous ({totalCount})
              </button>
              <button
                onClick={() => setFilterAvailable(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterAvailable === true
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Disponibles ({availableCount})
              </button>
              <button
                onClick={() => setFilterAvailable(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterAvailable === false
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Indisponibles ({totalCount - availableCount})
              </button>

              {cities.length > 0 && (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#8a6bfe]"
                >
                  <option value="all">Toutes les villes</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {filtered.length} {filtered.length === 1 ? 'résultat' : 'résultats'}{' '}
            {search && `pour "${search}"`}
          </p>
          {filtered.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4 text-[#8a6bfe]" />
              Profils mis à jour en temps réel
            </div>
          )}
        </div>

        {/* Liste des étudiants */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="w-10 h-10 text-[#8a6bfe] mb-3" />
            <p className="text-xl font-semibold text-gray-700 mb-1">Aucun résultat</p>
            <p className="text-gray-500 mb-4">
              Essayez de modifier vos critères ou réinitialisez les filtres.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setFilterAvailable(null);
                setSelectedCity('all');
              }}
              className="px-5 py-2 bg-[#8a6bfe] text-white rounded-lg hover:bg-[#7a5aee]"
            >
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((student) => (
              <div
                key={student.uid}
                className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:-translate-y-1"
              >
                <div className="h-20 bg-gradient-to-br from-[#8a6bfe] via-[#9b7dff] to-[#b19cff] relative" />

                <div className="relative -mt-12 px-6">
                  <img
                    src={
                      student.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        student.firstName || student.username || 'Etudiant'
                      )}&background=8a6bfe&color=fff`
                    }
                    alt={student.firstName || student.username}
                    className="w-24 h-24 rounded-2xl object-cover border-4 bg-[#8a6bfe] border-white shadow-xl"
                  />
                </div>

                <div className="px-6 pb-6">
                  <h3 className="font-bold text-lg text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  {student.city && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {student.city}
                    </p>
                  )}

                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {student.studentProfile?.description ||
                      student.bio ||
                      'Étudiant disponible pour des missions.'}
                  </p>

                  {student.studentProfile?.experiences &&
                    student.studentProfile.experiences.length > 0 && (
                      <div className="mt-4 space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Expériences
                        </p>
                        {student.studentProfile.experiences.slice(0, 2).map((exp) => (
                          <div key={exp.id} className="text-xs text-gray-700 truncate">
                            • {exp.title}
                          </div>
                        ))}
                      </div>
                    )}

                  <div className="flex gap-2 mt-5">
                    <Link
                      href={`/profile/${student.uid}`}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#8a6bfe] to-[#7a5aee] text-white text-sm rounded-lg text-center hover:shadow-lg transition-all"
                    >
                      Voir le profil
                    </Link>
                    <Link
                      href={`/messages?newChat=${student.uid}`}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
