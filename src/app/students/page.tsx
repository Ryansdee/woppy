'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Loader2, Search, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// 🔹 Type des données utilisateur
interface Student {
  uid: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  isOnline?: boolean;
  hasStudentProfile?: boolean;
  city?: string;
  studentProfile?: {
    description?: string;
    age?: string;
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

  // 🔄 Charger uniquement les utilisateurs avec un profil étudiant actif
  useEffect(() => {
    const q = query(collection(db, 'users'), where('hasStudentProfile', '==', true));

    const unsub = onSnapshot(q, (snap) => {
      const list: Student[] = snap.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      })) as Student[];
      setStudents(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 🔍 Recherche
  const filtered = students.filter(
    (s) =>
      s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      s.username?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentProfile?.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
        <Loader2 className="animate-spin w-10 h-10 mb-4 text-[#8a6bfe]" />
        <p className="text-gray-600 animate-pulse">Chargement des étudiants...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ====== Header ====== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User className="text-[#8a6bfe]" /> Étudiants disponibles
          </h1>

          <div className="relative w-full sm:w-72 mt-4 sm:mt-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* ====== Liste des étudiants ====== */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500">Aucun étudiant trouvé.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((student) => (
              <motion.div
                key={student.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition"
              >
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={
                      student.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        student.firstName || student.username || 'Etudiant'
                      )}&background=8a6bfe&color=fff`
                    }
                    alt={student.firstName || student.username}
                    className="w-20 h-20 rounded-full object-cover mb-3"
                  />
                  {student.isOnline && (
                    <span className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Nom */}
                <h2 className="font-semibold text-lg text-gray-900">
                  {student.firstName} {student.lastName}
                </h2>
                {student.city && <p className="text-sm text-gray-500">{student.city}</p>}

                {/* Description */}
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {student.studentProfile?.description ||
                    student.bio ||
                    'Aucune description disponible.'}
                </p>

                {/* Expériences récentes */}
                {student.studentProfile?.experiences && student.studentProfile.experiences.length > 0 && (
                  <div className="mt-3 text-left w-full">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Expériences récentes :</p>
                    <ul className="space-y-1">
                      {student.studentProfile.experiences.slice(0, 2).map((exp) => (
                        <li key={exp.id} className="text-xs text-gray-600 line-clamp-1">
                          • <span className="font-medium">{exp.title}</span> — {exp.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-5">
                  <Link
                    href={`/profile/${student.uid}`}
                    className="text-[#8a6bfe] text-sm font-medium hover:underline"
                  >
                    Voir le profil
                  </Link>
                  <Link
                    href={`/messages?newChat=${student.uid}`}
                    className="text-sm flex items-center gap-1 text-[#8a6bfe] hover:underline"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
