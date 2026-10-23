'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone, ListChecks, Users, MessageSquare, UserCog,
  TrendingUp, Briefcase, Activity, ChevronRight, UserCheck, LifeBuoy, ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, getCountFromServer, doc, getDoc, query, where } from 'firebase/firestore';

type Stats = { students: number; users: number; annonces: number; jobs: number };
type NavItem = { href: string; icon: LucideIcon; label: string; desc: string };

function greetingFor(date: Date) {
  const h = date.getHours();
  return h < 13 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
}

function NavList({ items }: { items: NavItem[] }) {
  return (
    <div className="card divide-y divide-line overflow-hidden">
      {items.map(({ href, icon: Icon, label, desc }) => (
        <Link key={href} href={href} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-paper">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
            <Icon size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{label}</span>
            <span className="block truncate text-sm text-muted">{desc}</span>
          </span>
          <ChevronRight size={16} className="text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [greeting] = useState(() => greetingFor(new Date()));

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { window.location.href = '/auth/login'; return; }
      setUser(u);
      const fallback = u.displayName?.split(' ')[0] || u.email?.split('@')[0] || '';
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        const d = snap.data();
        setRole(d?.role || null);
        setFirstName(d?.firstName || fallback);
      } catch {
        setFirstName(fallback);
      }
    });
  }, []);

  const isStaff = role === 'admin' || role === 'collaborator';

  /* Les chiffres de la plateforme ne concernent que l'équipe */
  useEffect(() => {
    if (!isStaff) return;
    Promise.all([
      getCountFromServer(query(collection(db, 'users'), where('hasStudentProfile', '==', true))),
      getCountFromServer(collection(db, 'users')),
      getCountFromServer(collection(db, 'annonces')),
      getCountFromServer(query(collection(db, 'annonces'), where('statut', '==', 'fini'))),
    ])
      .then(([s, u, a, j]) =>
        setStats({ students: s.data().count, users: u.data().count, annonces: a.data().count, jobs: j.data().count })
      )
      .catch(() => {});
  }, [isStaff]);

  if (!user) return null;

  const actions: NavItem[] = [
    { href: '/jobs/create', icon: Megaphone, label: 'Publier une annonce', desc: 'Trouver un étudiant pour une mission' },
    { href: '/jobs', icon: ListChecks, label: 'Parcourir les annonces', desc: 'Les missions ouvertes près de chez vous' },
    { href: '/students', icon: Users, label: 'Étudiants', desc: 'Voir les profils disponibles' },
    { href: '/messages', icon: MessageSquare, label: 'Messagerie', desc: 'Vos conversations' },
  ];

  const account: NavItem[] = [
    { href: '/dashboard/activity', icon: Activity, label: 'Mon activité', desc: 'Annonces, candidatures et missions' },
    { href: '/dashboard/profile', icon: UserCog, label: 'Mon profil', desc: 'Informations et profil étudiant' },
    { href: '/contact', icon: LifeBuoy, label: 'Aide et support', desc: 'Poser une question à l’équipe' },
  ];

  const staff: NavItem[] = [
    { href: '/dashboard/collaborateur', icon: UserCheck, label: 'Espace collaborateur', desc: 'Profils et signalements' },
    { href: '/contact/admin', icon: MessageSquare, label: 'Support', desc: 'Gérer les tickets' },
    { href: '/dashboard/recap', icon: TrendingUp, label: 'Statistiques', desc: 'Activité de la plateforme' },
  ];
  if (role === 'admin') {
    staff.push(
      { href: '/dashboard/jobs-career', icon: Briefcase, label: 'Postes internes', desc: 'Offres d’emploi Woppy' },
      { href: '/dashboard/applications', icon: ListChecks, label: 'Candidatures', desc: 'Réponses aux offres Woppy' },
      { href: '/dashboard/market-survey', icon: ClipboardList, label: 'Enquête de marché', desc: 'Réponses au formulaire' },
    );
  }

  return (
    <main className="container-w py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Tableau de bord</p>
        <h1 className="display mt-1 text-2xl sm:text-3xl">
          {greeting}, {firstName || '…'}
        </h1>
        {isStaff && (
          <span className="chip mt-3 !border-brand/20 !bg-brand-soft !text-brand-dark">
            {role === 'admin' ? 'Administrateur' : 'Collaborateur'}
          </span>
        )}
      </motion.div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="eyebrow mb-3">Actions</h2>
          <NavList items={actions} />
        </section>
        <section>
          <h2 className="eyebrow mb-3">Mon espace</h2>
          <NavList items={account} />
        </section>
      </div>

      {isStaff && (
        <section className="mt-12 border-t border-line pt-10">
          <h2 className="display text-2xl">Équipe Woppy</h2>
          {stats && (
            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-4">
              {[
                { label: 'Utilisateurs', value: stats.users },
                { label: 'Profils étudiants', value: stats.students },
                { label: 'Annonces publiées', value: stats.annonces },
                { label: 'Missions terminées', value: stats.jobs },
              ].map((k) => (
                <div key={k.label} className="bg-white p-5">
                  <dt className="text-sm text-muted">{k.label}</dt>
                  <dd className="display mt-1 text-3xl">{k.value.toLocaleString('fr-BE')}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-6">
            <NavList items={staff} />
          </div>
        </section>
      )}
    </main>
  );
}
