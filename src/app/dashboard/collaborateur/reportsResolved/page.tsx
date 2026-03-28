'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection, query, orderBy, onSnapshot, getDoc, doc,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Flag, Loader2, CheckCircle, ThumbsUp, Ban, ArrowLeft,
  User, Trash2, Shield, Calendar, MessageSquare, Filter,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportResolved {
  id: string;
  reporterId: string;
  senderId: string;
  chatId: string;
  text: string;
  decision: string;
  resolvedBy: string;
  resolvedAt?: any;
}

interface UserData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

const DECISION_CONFIG = {
  not_offensive: {
    icon: <ThumbsUp className="w-3.5 h-3.5" />,
    label: 'Pas offensif',
    badge: 'bg-green-50 text-green-600 border border-green-200',
    hover: 'hover:border-green-200',
  },
  blocked: {
    icon: <Ban className="w-3.5 h-3.5" />,
    label: 'Utilisateur bloqué',
    badge: 'bg-red-50 text-red-500 border border-red-200',
    hover: 'hover:border-red-200',
  },
  deleted: {
    icon: <Trash2 className="w-3.5 h-3.5" />,
    label: 'Message supprimé',
    badge: 'bg-stone-100 text-gray-600 border border-stone-300',
    hover: 'hover:border-stone-300',
  },
} as const;

type FilterType = 'all' | 'not_offensive' | 'blocked' | 'deleted';

export default function ReportsResolvedPage() {
  const [loading, setLoading]     = useState(true);
  const [reports, setReports]     = useState<ReportResolved[]>([]);
  const [userCache, setUserCache] = useState<Record<string, UserData>>({});
  const [authorized, setAuthorized] = useState(false);
  const [filter, setFilter]       = useState<FilterType>('all');
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/auth/login'); return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      const role = snap.exists() ? snap.data()?.role : null;
      if (role === 'collaborator' || role === 'admin') {
        setAuthorized(true);
      } else {
        router.push('/dashboard');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    const q = query(collection(db, 'reportsResolved'), orderBy('resolvedAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ReportResolved[];
      setReports(list);

      const uids = new Set<string>();
      list.forEach((r) => {
        if (r.reporterId) uids.add(r.reporterId);
        if (r.senderId)   uids.add(r.senderId);
        if (r.resolvedBy) uids.add(r.resolvedBy);
      });

      const updatedCache = { ...userCache };
      await Promise.all(Array.from(uids).map(async (uid) => {
        if (!uid || updatedCache[uid]) return;
        const s = await getDoc(doc(db, 'users', uid));
        if (s.exists()) {
          const d = s.data();
          updatedCache[uid] = {
            displayName: d.displayName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Utilisateur',
            firstName: d.firstName, lastName: d.lastName,
          };
        } else {
          updatedCache[uid] = { displayName: 'Utilisateur inconnu' };
        }
      }));

      setUserCache(updatedCache);
      setLoading(false);
    });
    return () => unsub();
  }, [authorized]);

  const nameOf = (uid: string) => userCache[uid]?.displayName || 'Utilisateur inconnu';

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.decision === filter);

  const stats = {
    total:        reports.length,
    notOffensive: reports.filter(r => r.decision === 'not_offensive').length,
    blocked:      reports.filter(r => r.decision === 'blocked').length,
    deleted:      reports.filter(r => r.decision === 'deleted').length,
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f8f5]">
      <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
      <p className="font-['DM_Sans',system-ui] text-gray-400 font-medium">
        Chargement de l'historique...
      </p>
    </div>
  );

  if (!authorized) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f8f5] px-5">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
        <Ban className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="font-['Sora',system-ui] font-bold text-xl text-[#1a1a2e] mb-2">Accès refusé</h2>
      <p className="text-gray-400 text-sm mb-6 font-['DM_Sans',system-ui]">
        Vous n'avez pas les permissions nécessaires.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        className="px-5 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600 transition-colors"
      >
        Retour au tableau de bord
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      <main className="min-h-screen bg-[#f9f8f5] font-['DM_Sans',system-ui,sans-serif]">

        {/* ── Hero ── */}
        <section className="max-w-[960px] mx-auto px-5 pt-12 pb-10 sm:pt-16 sm:pb-12">

          {/* Retour */}
          <div className="flex justify-center mb-6">
            <Link
              href="/dashboard/collaborateur"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-400 hover:text-violet-500 transition-colors no-underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour à l'espace collaborateur
            </Link>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-[7px] rounded-full bg-violet-50 border border-violet-200 text-[13px] font-semibold text-violet-500">
              <Shield className="w-3.5 h-3.5" />
              Historique
            </span>
          </div>

          <h1 className="font-['Sora',system-ui] text-center font-extrabold text-[1.9rem] sm:text-[2.8rem] leading-[1.15] tracking-[-0.03em] text-[#1a1a2e] mb-4">
            Signalements{" "}
            <span className="bg-gradient-to-br from-violet-500 to-violet-300 bg-clip-text text-transparent">
              résolus
            </span>
          </h1>

          <p className="text-center text-[14px] sm:text-[16px] text-gray-400 max-w-[440px] mx-auto mb-10 leading-[1.7]">
            Consultez l'ensemble des signalements traités et les décisions prises par l'équipe.
          </p>

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { key: 'all',           label: 'Total',        value: stats.total,        icon: <Shield className="w-4 h-4" />,   color: 'text-violet-500', activeBg: 'bg-violet-500' },
              { key: 'not_offensive', label: 'Pas offensif', value: stats.notOffensive, icon: <ThumbsUp className="w-4 h-4" />, color: 'text-green-500',  activeBg: 'bg-green-500'  },
              { key: 'blocked',       label: 'Bloqués',      value: stats.blocked,      icon: <Ban className="w-4 h-4" />,      color: 'text-red-500',    activeBg: 'bg-red-500'    },
              { key: 'deleted',       label: 'Supprimés',    value: stats.deleted,      icon: <Trash2 className="w-4 h-4" />,   color: 'text-gray-500',   activeBg: 'bg-[#1a1a2e]' },
            ] as const).map((s) => (
              <button
                key={s.key}
                onClick={() => setFilter(s.key)}
                className={`rounded-2xl p-4 text-left border transition-all duration-150
                  ${filter === s.key
                    ? `${s.activeBg} border-transparent shadow-md`
                    : 'bg-white border-stone-200 hover:border-violet-200 hover:shadow-sm'
                  }`}
              >
                <div className={`mb-2 ${filter === s.key ? 'text-white/80' : s.color}`}>
                  {s.icon}
                </div>
                <p className={`font-['Sora',system-ui] font-bold text-xl ${filter === s.key ? 'text-white' : 'text-[#1a1a2e]'}`}>
                  {s.value}
                </p>
                <p className={`text-[11px] font-medium mt-0.5 ${filter === s.key ? 'text-white/70' : 'text-gray-400'}`}>
                  {s.label}
                </p>
              </button>
            ))}
          </div>
        </section>

        <div className="max-w-[960px] mx-auto px-5 pb-20">

          {/* Filtre actif */}
          <AnimatePresence>
            {filter !== 'all' && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 mb-5"
              >
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[13px] text-gray-400">
                  Filtre actif :{" "}
                  <span className="font-semibold text-[#1a1a2e]">
                    {filter === 'not_offensive' && 'Pas offensif'}
                    {filter === 'blocked'       && 'Bloqués'}
                    {filter === 'deleted'       && 'Supprimés'}
                  </span>
                </span>
                <button
                  onClick={() => setFilter('all')}
                  className="text-[13px] text-violet-500 font-semibold hover:text-violet-600 transition-colors"
                >
                  Réinitialiser
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty */}
          {filteredReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-stone-200 rounded-2xl p-16 text-center"
            >
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-violet-400" />
              </div>
              <p className="font-['Sora',system-ui] font-bold text-[#1a1a2e] mb-1">
                Aucun résultat
              </p>
              <p className="text-sm text-gray-400">
                {filter === 'all'
                  ? "Aucun signalement résolu pour l'instant."
                  : 'Aucun signalement ne correspond à ce filtre.'}
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredReports.map((r, index) => {
                const cfg = DECISION_CONFIG[r.decision as keyof typeof DECISION_CONFIG] ?? {
                  icon: <Flag className="w-3.5 h-3.5" />,
                  label: 'Traité',
                  badge: 'bg-violet-50 text-violet-500 border border-violet-200',
                  hover: 'hover:border-violet-200',
                };

                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`bg-white border border-stone-200 rounded-2xl p-5 transition-all duration-150 ${cfg.hover} hover:shadow-[0_2px_20px_rgba(0,0,0,0.06)]`}
                  >
                    {/* Top : qui + badge décision */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-violet-50 rounded-lg flex items-center justify-center shrink-0">
                            <Flag className="w-3 h-3 text-violet-400" />
                          </div>
                          <span className="text-[13px] font-semibold text-[#1a1a2e]">
                            Signalé par{" "}
                            <span className="text-violet-500">{nameOf(r.reporterId)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pl-8">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-[12px] text-gray-400">
                            Expéditeur :{" "}
                            <span className="font-semibold text-gray-600">{nameOf(r.senderId)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Badge décision */}
                      <span className={`self-start inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.badge}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>

                    {/* Message */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <MessageSquare className="w-3 h-3 text-gray-400" />
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Contenu signalé
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {r.text}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-violet-400" />
                        <span className="text-[12px] text-gray-400">
                          Traité par{" "}
                          <span className="font-semibold text-violet-500">{nameOf(r.resolvedBy)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px] text-gray-400">
                            {r.resolvedAt?.toDate &&
                              new Date(r.resolvedAt.toDate()).toLocaleString('fr-BE', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono bg-stone-100 px-2 py-0.5 rounded-lg">
                          {r.chatId}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}