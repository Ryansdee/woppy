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
  Trophy,
  ArrowRight,
  CheckCircle,
  Handshake,
  BarChart3,
  FileText,
  Mail
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getCountFromServer } from 'firebase/firestore';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    annonces: 0,
    jobs: 0,
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        window.location.href = '/auth/login';
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const annoncesSnap = await getCountFromServer(collection(db, 'annonces'));
        const jobsSnap = await getCountFromServer(collection(db, 'jobs'));
        // Tu peux adapter cette logique pour calculer les euros échangés à partir des jobs terminés
        const euros = jobsSnap.data().count * 25; // exemple simplifié : 25€/job
        setStats({
          students: usersSnap.data().count,
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
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900"
            >
              Bienvenue, {user.displayName || user.email.split('@')[0]} !
            </motion.h1>
            <p className="mt-4 text-gray-600 max-w-2xl">
              Tu es connecté à ton tableau de bord. Gère tes annonces, découvre les étudiants disponibles et accède à ta messagerie.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickAction href="/jobs/create" icon={<Megaphone className="w-5 h-5" />} label="Publier une annonce" primary />
              <QuickAction href="/jobs" icon={<ListChecks className="w-5 h-5" />} label="Voir les annonces" />
              <QuickAction href="/etudiants" icon={<Users className="w-5 h-5" />} label="Étudiants disponibles" />
              <QuickAction href="/messages" icon={<MessageSquare className="w-5 h-5" />} label="Messagerie" />
              <QuickAction href="/profil" icon={<UserCog className="w-5 h-5" />} label="Modifier mon profil" />
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Paiements sécurisés</span>
              <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> +Outils anti-spam</span>
              <span className="inline-flex items-center gap-2"><Handshake className="w-4 h-4" /> Confiance mutuelle</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/70 backdrop-blur rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-[#8a6bfe]" /> Palmarès en temps réel</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="Étudiants inscrits" value={stats.students} />
              <Stat label="Annonces publiées" value={stats.annonces} />
              <Stat label="Travaux réalisés" value={stats.jobs} />
            </div>
            <div className="mt-6 text-xs text-gray-500 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-500" />
              Données réelles depuis Woppy App !
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums">{value.toLocaleString('fr-BE')}</div>
    </div>
  );
}

function QuickAction({ href, icon, label, primary }: { href: string; icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={[
        'group flex items-center justify-between gap-3 rounded-xl border p-4',
        'transition bg-white/70 backdrop-blur border-gray-200',
        primary ? 'shadow-sm hover:shadow-md' : 'hover:border-[#8a6bfe] hover:shadow-sm'
      ].join(' ')}
    >
      <span className="inline-flex items-center gap-3 font-semibold">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#8a6bfe]/10 to-[#b89fff]/10 text-[#7a5bee]">
          {icon}
        </span>
        {label}
      </span>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#8a6bfe] transition" />
    </Link>
  );
}
