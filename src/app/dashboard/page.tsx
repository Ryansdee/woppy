'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  ListChecks,
  Users,
  MessageSquare,
  UserCog,
  ShieldCheck,
  Sparkles,
  Handshake,
  Trophy,
  ArrowRight,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getCountFromServer,
  doc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    users: 0,
    annonces: 0,
    jobs: 0,
  });
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) window.location.href = '/auth/login';
      else {
        setUser(u);
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) setRole(snap.data().role || null);
        } catch (err) {
          console.error('Erreur récupération rôle :', err);
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const studentsQuery = query(
          collection(db, 'users'),
          where('hasStudentProfile', '==', true)
        );
        const [studentsSnap, usersSnap, annoncesSnap, jobsSnap] =
          await Promise.all([
            getCountFromServer(studentsQuery),
            getCountFromServer(collection(db, 'users')),
            getCountFromServer(collection(db, 'annonces')),
            getCountFromServer(collection(db, 'jobs')),
          ]);
        setStats({
          students: studentsSnap.data().count,
          users: usersSnap.data().count,
          annonces: annoncesSnap.data().count,
          jobs: jobsSnap.data().count,
        });
      } catch (err) {
        console.error('Erreur chargement stats :', err);
      }
    }
    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ede6ff] via-white to-[#e0d0ff] text-gray-900 flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 md:px-16 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-5xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#7b5bff] mb-6 leading-tight">
            Bienvenue {user.displayName || user.email.split('@')[0]} 👋
          </h1>

          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-14">
            Ton espace Woppy t’attend ! Gère tes annonces, explore les étudiants,
            connecte-toi avec la communauté et découvre de nouvelles opportunités.
          </p>

          {/* 🚀 Actions rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-20">
            <QuickAction
              href="/jobs/create"
              icon={<Megaphone className="w-8 h-8" />}
              label="Publier une annonce"
              primary
            />
            <QuickAction
              href="/jobs"
              icon={<ListChecks className="w-8 h-8" />}
              label="Voir les annonces"
            />
            <QuickAction
              href="/students"
              icon={<Users className="w-8 h-8" />}
              label="Étudiants disponibles"
            />
            <QuickAction
              href="/messages"
              icon={<MessageSquare className="w-8 h-8" />}
              label="Messagerie"
            />
            <QuickAction
              href="/dashboard/profile"
              icon={<UserCog className="w-8 h-8" />}
              label="Mon profil"
            />
            {role === 'collaborator' && (
              <QuickAction
                href="/dashboard/collaborateur"
                icon={<UserCheck className="w-8 h-8" />}
                label="Espace collaborateur"
                primary
              />
            )}
          </div>

          {/* 📊 Statistiques */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg border border-[#d8c8ff] rounded-3xl p-8 sm:p-12 shadow-xl max-w-6xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#7b5bff] mb-10 flex items-center justify-center gap-3">
              <Trophy className="w-7 h-7 text-[#7b5bff]" /> Tes statistiques en direct
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <Stat label="Étudiants inscrits" value={stats.students} />
              <Stat label="Annonces publiées" value={stats.annonces} />
              <Stat label="Travaux réalisés" value={stats.jobs} />
              <Stat label="Utilisateurs totaux" value={stats.users} />
            </div>
            <div className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#7b5bff]" />
              Données synchronisées avec Firestore
            </div>
          </motion.div>

          {/* 🛡️ Bandeau infos */}
          <div className="mt-20 flex flex-wrap justify-center gap-6 sm:gap-10 text-base sm:text-lg text-gray-600">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#7b5bff]" /> Paiements sécurisés
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#7b5bff]" /> Outils anti-spam
            </span>
            <span className="inline-flex items-center gap-2">
              <Handshake className="w-5 h-5 text-[#7b5bff]" /> Confiance & entraide
            </span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// 🔢 Statistique animée et mobile-friendly
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center bg-[#f8f5ff] border border-[#e5d9ff] rounded-2xl p-8 sm:p-10 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
      <div className="text-gray-600 text-base sm:text-lg mb-2">{label}</div>
      <div className="text-4xl sm:text-5xl font-extrabold text-[#7b5bff]">
        {value.toLocaleString('fr-BE')}
      </div>
    </div>
  );
}

// ⚡ QuickAction version plus douce et accessible
function QuickAction({
  href,
  icon,
  label,
  primary,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        'group flex flex-col items-center justify-center gap-4 rounded-2xl border p-8 sm:p-10 transition-all text-center hover:scale-[1.03] hover:shadow-lg duration-300',
        primary
          ? 'bg-gradient-to-br from-[#7b5bff] to-[#b89fff] text-white shadow-md'
          : 'bg-white/70 border-[#e5d9ff] text-gray-800 hover:border-[#7b5bff]',
      ].join(' ')}
    >
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ${
          primary ? 'bg-white/20' : 'bg-[#f3e7ff]'
        }`}
      >
        {icon}
      </div>
      <span className="text-lg sm:text-xl font-semibold">{label}</span>
      <ArrowRight
        className={`w-5 h-5 sm:w-6 sm:h-6 mt-1 ${
          primary ? 'text-white/70 group-hover:text-white' : 'text-[#7b5bff]'
        } transition`}
      />
    </Link>
  );
}
