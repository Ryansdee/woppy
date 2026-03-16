'use client';

import Link from 'next/link';
import { JSX, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone, ListChecks, Users, MessageSquare, UserCog,
  ShieldCheck, Trophy, ArrowRight, BarChart3, UserCheck,
  TrendingUp, Star, Bell, Settings, Briefcase, Activity,
  ChevronRight, Zap,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection, getCountFromServer, doc, getDoc, query, where,
} from 'firebase/firestore';

export default function DashboardPage() {
  const [stats, setStats]     = useState({ students: 0, users: 0, annonces: 0, jobs: 0 });
  const [user, setUser]       = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [role, setRole]       = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { window.location.href = '/auth/login'; return; }
      setUser(u);
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const d = snap.data();
          setRole(d.role || null);
          setFirstName(d.firstName || u.displayName?.split(' ')[0] || u.email?.split('@')[0] || '');
        }
      } catch {
        setFirstName(u.displayName?.split(' ')[0] || u.email?.split('@')[0] || '');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 13 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [sS, uS, aS, jS] = await Promise.all([
          getCountFromServer(query(collection(db, 'users'), where('hasStudentProfile', '==', true))),
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'annonces')),
          getCountFromServer(query(collection(db, 'annonces'), where('statut', '==', 'fini'))),
        ]);
        setStats({ students: sS.data().count, users: uS.data().count, annonces: aS.data().count, jobs: jS.data().count });
      } catch {}
    })();
  }, []);

  if (!user) return null;

  /* ── data ── */
  const primaryActions = [
    { href: '/jobs/create',  icon: <Megaphone   size={15} />, label: 'Publier une annonce',    sub: 'Créer et diffuser' },
    { href: '/jobs',         icon: <ListChecks  size={15} />, label: 'Annonces',               sub: 'Parcourir les offres' },
    { href: '/students',     icon: <Users       size={15} />, label: 'Étudiants',              sub: 'Trouver des talents' },
    { href: '/messages',     icon: <MessageSquare size={15}/>, label: 'Messagerie',            sub: 'Conversations' },
  ];

  const accountLinks: { href: string; icon: JSX.Element; label: string; desc: string }[] = [
    { href: '/dashboard/profile',   icon: <UserCog  size={14}/>, label: 'Mon profil',          desc: 'Informations personnelles' },
    { href: '/dashboard/activity',  icon: <Activity size={14}/>, label: 'Activité',            desc: 'Historique et missions' },
  ];
  if (role === 'collaborator' || role === 'admin')
    accountLinks.push({ href: '/dashboard/collaborateur', icon: <UserCheck size={14}/>, label: 'Espace collaborateur', desc: 'Gestion des profils' });
  if (role === 'admin') {
    accountLinks.push({ href: '/dashboard/jobs-career',  icon: <Briefcase size={14}/>, label: 'Postes internes',      desc: 'Créer des offres' });
    accountLinks.push({ href: '/dashboard/applications', icon: <ListChecks size={14}/>, label: 'Candidatures',        desc: 'Gérer les demandes' });
  }

  const kpis = [
    { label: 'Étudiants', value: stats.students, delta: '+12 %', icon: <Users size={13}/> },
    { label: 'Annonces',  value: stats.annonces,  delta: '+8 %',  icon: <Megaphone size={13}/> },
    { label: 'Missions terminées', value: stats.jobs, delta: '+15 %', icon: <Trophy size={13}/> },
    { label: 'Utilisateurs', value: stats.users,  delta: '+10 %', icon: <Star size={13}/> },
  ];

  const roleLabel = role === 'admin' ? 'Admin' : role === 'collaborator' ? 'Collaborateur' : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        .db { font-family: system-ui, -apple-system, sans-serif; }
        .db-mono { font-family: 'Geist Mono', 'Fira Code', monospace; }
        .db-title { font-family: 'Sora', system-ui, sans-serif; }
      `}</style>

      <div className="db min-h-screen" style={{ background: '#ffffff', color: '#0c0b14' }}>

        {/* ════════════ TOPBAR ════════════ */}
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.055)', background: 'rgba(255, 255, 255, 0.92)' }}
          className="sticky top-0 z-50 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">

            {/* left */}
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: '#7c5fe6' }}>
                <span className="db-title font-bold text-white" style={{ fontSize: 9 }}>W</span>
              </div>
              <span className="db-title font-semibold text-sm" style={{ color: '#0c0b14', letterSpacing: '-0.01em' }}>
                Dashboard
              </span>
              {roleLabel && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(124,95,230,0.12)', color: '#9d82ff', border: '1px solid rgba(124,95,230,0.2)' }}>
                  {roleLabel}
                </span>
              )}
            </div>

            {/* right */}
            <div className="flex items-center gap-0.5">
              {[
                { href: '/notifications', icon: <Bell size={15} /> },
                { href: '/dashboard/profile', icon: <Settings size={15} /> },
              ].map(({ href, icon }) => (
                <Link key={href} href={href}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: '#6b6880' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#c4bfdc')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b6880')}>
                  {icon}
                </Link>
              ))}
              <div className="w-px h-3.5 mx-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="h-6 px-2.5 rounded-md flex items-center gap-1.5 text-xs font-medium cursor-default"
                style={{ background: 'rgba(124,95,230,0.1)', color: '#0c0b14', border: '1px solid rgba(124,95,230,0.18)' }}>
                <div className="w-1.5 h-1.5 rounded-full text-[#0c0b14]" />
                {firstName || '…'}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* ════════════ GREETING ════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <p className="text-xs font-medium mb-3" style={{ color: '#4a4760', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {greeting}
            </p>
            <h1 className="db-title font-bold mb-2"
              style={{ fontSize: 'clamp(26px,4vw,36px)', color: '#0c0b14', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {firstName || '…'}
            </h1>
            <p className="text-sm" style={{ color: '#5a5672' }}>
              Aperçu de la plateforme Woppy — données synchronisées en temps réel.
            </p>
          </motion.div>

          {/* ════════════ KPI ROW ════════════ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-12 rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.055)', background: 'rgba(255,255,255,0.055)' }}
          >
            {kpis.map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="flex flex-col justify-between p-5 cursor-default group transition-colors"
                style={{ background: '#0c0b14' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#110f1f')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0c0b14')}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium" style={{ color: '#4a4760' }}>{k.label}</span>
                  <span className="text-xs font-semibold db-mono" style={{ color: '#34d399' }}>{k.delta}</span>
                </div>
                <div className="db-mono font-medium" style={{ fontSize: 28, color: '#eae8f8', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {k.value.toLocaleString('fr-BE')}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ════════════ BODY GRID ════════════ */}
          <div className="grid lg:grid-cols-5 gap-5">

            {/* ── LEFT 3/5 ── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Primary actions */}
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a4760' }}>
                    Actions
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.055)' }}>
                  {primaryActions.map((a, i) => (
                    <Link key={a.href} href={a.href}
                      className="group flex items-center justify-between px-5 py-3.5 transition-colors"
                      style={{
                        borderBottom: i < primaryActions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: '#0e0c1c',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#131128')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#0e0c1c')}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: 'rgba(124,95,230,0.08)', border: '1px solid rgba(124,95,230,0.14)', color: '#7c5fe6' }}>
                          {a.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium transition-colors" style={{ color: '#ccc8e8', letterSpacing: '-0.01em' }}>
                            {a.label}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#3d3a56' }}>{a.sub}</div>
                        </div>
                      </div>
                      <ChevronRight size={13} style={{ color: '#2e2b45' }} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </motion.section>

              {/* Activity bars */}
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl p-5"
                style={{ border: '1px solid rgba(255,255,255,0.055)', background: '#0e0c1c' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a4760' }}>
                    Répartition
                  </span>
                  <span className="text-xs db-mono" style={{ color: '#3d3a56' }}>
                    {stats.users} total
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Étudiants inscrits', value: stats.students, pct: Math.round((stats.students / Math.max(stats.users, 1)) * 100) },
                    { label: 'Annonces actives',   value: stats.annonces, pct: Math.min(Math.round((stats.annonces / Math.max(stats.users, 1)) * 100), 100) },
                    { label: 'Missions terminées', value: stats.jobs,     pct: Math.min(Math.round((stats.jobs     / Math.max(stats.users, 1)) * 100), 100) },
                  ].map(bar => (
                    <div key={bar.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs" style={{ color: '#5a5672' }}>{bar.label}</span>
                        <span className="text-xs db-mono font-medium" style={{ color: '#7c5fe6' }}>
                          {bar.value.toLocaleString('fr-BE')}
                          <span style={{ color: '#3d3a56' }}> · {bar.pct}%</span>
                        </span>
                      </div>
                      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bar.pct}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #7c5fe6, #a78bfa)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Security row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.26 }}
                className="flex items-center gap-4 px-5 py-4 rounded-xl"
                style={{ border: '1px solid rgba(124,95,230,0.12)', background: 'rgba(124,95,230,0.04)' }}
              >
                <ShieldCheck size={15} style={{ color: '#7c5fe6', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium" style={{ color: '#9d82ff' }}>Plateforme sécurisée</span>
                  <span className="text-xs ml-2" style={{ color: '#3d3a56' }}>
                    Stripe · vérification manuelle · anti-spam
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs db-mono shrink-0" style={{ color: '#34d399' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Opérationnel
                </div>
              </motion.div>
            </div>

            {/* ── RIGHT 2/5 ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="lg:col-span-2 space-y-5"
            >

              {/* Account nav */}
              <section>
                <div className="mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a4760' }}>
                    Mon espace
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.055)' }}>
                  {accountLinks.map((a, i) => (
                    <Link key={a.href} href={a.href}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors"
                      style={{
                        borderBottom: i < accountLinks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: '#0e0c1c',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#131128')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#0e0c1c')}
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#5a5672', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {a.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate transition-colors"
                          style={{ color: '#bbb8d6', letterSpacing: '-0.01em' }}>
                          {a.label}
                        </div>
                        <div className="text-xs truncate mt-0.5" style={{ color: '#3a374f' }}>{a.desc}</div>
                      </div>
                      <ChevronRight size={12} style={{ color: '#2a2740', flexShrink: 0 }}
                        className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </section>

              {/* Tip */}
              <section className="rounded-xl p-4" style={{ border: '1px solid rgba(255,255,255,0.055)', background: '#0e0c1c' }}>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Zap size={11} style={{ color: '#7c5fe6' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a4760' }}>
                    Conseil
                  </span>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: '#bbb8d6', letterSpacing: '-0.01em' }}>
                  Profil incomplet détecté
                </p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: '#3d3a56' }}>
                  Compléter ton profil augmente ta visibilité de 3× auprès des particuliers et recruteurs.
                </p>
                <Link href="/dashboard/profile"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  style={{ color: '#7c5fe6' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7c5fe6')}
                >
                  Compléter le profil <ArrowRight size={11} />
                </Link>
              </section>

              {/* Quick stat callout */}
              <section className="rounded-xl p-4" style={{ border: '1px solid rgba(255,255,255,0.055)', background: '#0e0c1c' }}>
                <div className="flex items-center gap-1.5 mb-4">
                  <BarChart3 size={11} style={{ color: '#4a4760' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a4760' }}>
                    Plateforme
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Taux de réalisation', value: stats.jobs > 0 ? `${Math.round((stats.jobs / Math.max(stats.annonces, 1)) * 100)}%` : '—' },
                    { label: 'Ratio étudiant/user', value: stats.users > 0 ? `${Math.round((stats.students / Math.max(stats.users, 1)) * 100)}%` : '—' },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="db-mono font-medium mb-1" style={{ fontSize: 20, color: '#eae8f8', letterSpacing: '-0.02em' }}>
                        {item.value}
                      </div>
                      <div className="text-xs" style={{ color: '#3d3a56', lineHeight: 1.3 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </section>

            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}