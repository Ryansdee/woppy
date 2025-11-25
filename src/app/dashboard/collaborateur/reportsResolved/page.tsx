'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Flag,
  Loader2,
  CheckCircle,
  ThumbsUp,
  Ban,
  ArrowLeft,
  User,
  Trash2,
  Shield,
  Calendar,
  MessageSquare,
  Filter,
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

/* =======================================================================================
    PAGE : Historique des signalements (WOPPY STYLE PRO)
======================================================================================= */
export default function ReportsResolvedPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportResolved[]>([]);
  const [userCache, setUserCache] = useState<{ [uid: string]: UserData }>({});
  const [authorized, setAuthorized] = useState(false);
  const [filter, setFilter] = useState<'all' | 'not_offensive' | 'blocked' | 'deleted'>('all');
  const router = useRouter();

  /* -------------------------------------------------------------------------- */
  /*                           AUTH + ROLE CHECK                                 */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

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

  /* -------------------------------------------------------------------------- */
  /*                           FETCH REPORTS & USERS                             */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!authorized) return;

    const q = query(collection(db, 'reportsResolved'), orderBy('resolvedAt', 'desc'));

    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ReportResolved[];
      setReports(list);

      // Charger tous les utilisateurs mentionnés (reporter / sender / resolvedBy)
      const uids = new Set<string>();

      list.forEach((r) => {
        if (r.reporterId) uids.add(r.reporterId);
        if (r.senderId) uids.add(r.senderId);
        if (r.resolvedBy) uids.add(r.resolvedBy);
      });

      const updatedCache = { ...userCache };

      await Promise.all(
        Array.from(uids).map(async (uid) => {
          if (!uid) return;

          if (!updatedCache[uid]) {
            const snap = await getDoc(doc(db, 'users', uid));

            if (snap.exists()) {
              const d = snap.data();
              updatedCache[uid] = {
                displayName:
                  d.displayName ||
                  `${d.firstName || ''} ${d.lastName || ''}`.trim() ||
                  'Utilisateur',
                firstName: d.firstName,
                lastName: d.lastName,
              };
            } else {
              updatedCache[uid] = { displayName: 'Utilisateur inconnu' };
            }
          }
        })
      );

      setUserCache(updatedCache);
      setLoading(false);
    });

    return () => unsub();
  }, [authorized]);

  const nameOf = (uid: string): string =>
    userCache[uid]?.displayName || 'Utilisateur inconnu';

  // Filter reports
  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true;
    return r.decision === filter;
  });

  // Stats
  const stats = {
    total: reports.length,
    notOffensive: reports.filter(r => r.decision === 'not_offensive').length,
    blocked: reports.filter(r => r.decision === 'blocked').length,
    deleted: reports.filter(r => r.decision === 'deleted').length,
  };

  /* -------------------------------------------------------------------------- */
  /*                                 UI LOADING                                  */
  /* -------------------------------------------------------------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <Loader2 className="w-12 h-12 animate-spin text-[#8a6bfe] mb-4" />
        <p className="text-gray-600 font-medium">Chargement de l'historique...</p>
      </div>
    );

  if (!authorized)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
          <Ban className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-600 mb-6">Vous n'avez pas les permissions nécessaires.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
          Retour au tableau de bord
        </button>
      </div>
    );

  /* -------------------------------------------------------------------------- */
  /*                                    UI                                       */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header avec gradient Woppy */}
      <div className="bg-gradient-to-r from-[#6b4fd9] via-[#8a6bfe] to-[#7b5bef] text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/dashboard/collaborateur"
              className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              Retour à l'espace collaborateur
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Historique des signalements</h1>
                  <p className="text-purple-100">
                    Consultez tous les signalements traités
                  </p>
                </div>
              </div>

              {/* Total count */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                <p className="text-3xl font-bold">{reports.length}</p>
                <p className="text-xs text-purple-100">Signalements traités</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <button
            onClick={() => setFilter('all')}
            className={`p-6 rounded-2xl shadow-md border transition-all text-left ${
              filter === 'all'
                ? 'bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] text-white border-[#8a6bfe] shadow-lg scale-105'
                : 'bg-white border-gray-200 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Shield className={`w-6 h-6 ${filter === 'all' ? 'text-white' : 'text-[#8a6bfe]'}`} />
              <span className={`text-2xl font-bold ${filter === 'all' ? 'text-white' : 'text-[#8a6bfe]'}`}>
                {stats.total}
              </span>
            </div>
            <p className={`text-sm font-medium ${filter === 'all' ? 'text-purple-100' : 'text-gray-600'}`}>
              Total
            </p>
          </button>

          <button
            onClick={() => setFilter('not_offensive')}
            className={`p-6 rounded-2xl shadow-md border transition-all text-left ${
              filter === 'not_offensive'
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white border-green-500 shadow-lg scale-105'
                : 'bg-white border-gray-200 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <ThumbsUp className={`w-6 h-6 ${filter === 'not_offensive' ? 'text-white' : 'text-green-500'}`} />
              <span className={`text-2xl font-bold ${filter === 'not_offensive' ? 'text-white' : 'text-green-500'}`}>
                {stats.notOffensive}
              </span>
            </div>
            <p className={`text-sm font-medium ${filter === 'not_offensive' ? 'text-green-100' : 'text-gray-600'}`}>
              Pas offensif
            </p>
          </button>

          <button
            onClick={() => setFilter('blocked')}
            className={`p-6 rounded-2xl shadow-md border transition-all text-left ${
              filter === 'blocked'
                ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white border-red-500 shadow-lg scale-105'
                : 'bg-white border-gray-200 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Ban className={`w-6 h-6 ${filter === 'blocked' ? 'text-white' : 'text-red-500'}`} />
              <span className={`text-2xl font-bold ${filter === 'blocked' ? 'text-white' : 'text-red-500'}`}>
                {stats.blocked}
              </span>
            </div>
            <p className={`text-sm font-medium ${filter === 'blocked' ? 'text-red-100' : 'text-gray-600'}`}>
              Bloqués
            </p>
          </button>

          <button
            onClick={() => setFilter('deleted')}
            className={`p-6 rounded-2xl shadow-md border transition-all text-left ${
              filter === 'deleted'
                ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white border-gray-700 shadow-lg scale-105'
                : 'bg-white border-gray-200 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Trash2 className={`w-6 h-6 ${filter === 'deleted' ? 'text-white' : 'text-gray-700'}`} />
              <span className={`text-2xl font-bold ${filter === 'deleted' ? 'text-white' : 'text-gray-700'}`}>
                {stats.deleted}
              </span>
            </div>
            <p className={`text-sm font-medium ${filter === 'deleted' ? 'text-gray-300' : 'text-gray-600'}`}>
              Supprimés
            </p>
          </button>
        </motion.div>

        {/* Active filter badge */}
        {filter !== 'all' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              Filtre actif :{' '}
              <span className="font-semibold">
                {filter === 'not_offensive' && 'Pas offensif'}
                {filter === 'blocked' && 'Bloqués'}
                {filter === 'deleted' && 'Supprimés'}
              </span>
            </span>
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-[#8a6bfe] hover:underline font-medium"
            >
              Réinitialiser
            </button>
          </motion.div>
        )}

        {/* LISTE DES SIGNALEMENTS RÉSOLUS */}
        {filteredReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'Aucun signalement résolu pour l\'instant.'
                : 'Aucun signalement ne correspond à ce filtre.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((r, index) => {
              const config = {
                not_offensive: {
                  gradient: 'from-green-500 to-emerald-500',
                  bgLight: 'from-green-50/50 to-emerald-50/50',
                  border: 'border-green-200',
                  icon: <ThumbsUp className="w-5 h-5" />,
                  label: 'Pas offensif',
                },
                blocked: {
                  gradient: 'from-red-500 to-pink-500',
                  bgLight: 'from-red-50/50 to-pink-50/50',
                  border: 'border-red-200',
                  icon: <Ban className="w-5 h-5" />,
                  label: 'Utilisateur bloqué',
                },
                deleted: {
                  gradient: 'from-gray-700 to-gray-900',
                  bgLight: 'from-gray-50/50 to-slate-50/50',
                  border: 'border-gray-300',
                  icon: <Trash2 className="w-5 h-5" />,
                  label: 'Message supprimé',
                },
              }[r.decision as 'not_offensive' | 'blocked' | 'deleted'] || {
                gradient: 'from-[#8a6bfe] to-[#6b4fd9]',
                bgLight: 'from-purple-50/50 to-blue-50/50',
                border: 'border-purple-200',
                icon: <Flag className="w-5 h-5" />,
                label: 'Traité',
              };

              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className={`bg-gradient-to-br ${config.bgLight} border-2 ${config.border} rounded-2xl p-6 hover:shadow-xl transition-all`}
                >
                  {/* Barre latérale colorée */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.gradient} rounded-l-2xl`} />

                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                          <Flag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            Signalé par{' '}
                            <span className="text-[#8a6bfe]">{nameOf(r.reporterId)}</span>
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <User className="w-4 h-4" />
                            <span>Expéditeur :</span>
                            <span className="font-semibold text-gray-900">
                              {nameOf(r.senderId)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badge décision */}
                    <span className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${config.gradient} text-white rounded-xl font-semibold text-sm shadow-lg whitespace-nowrap`}>
                      {config.icon}
                      {config.label}
                    </span>
                  </div>

                  {/* Contenu signalé */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-4 shadow-inner">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-[#8a6bfe] mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-semibold text-gray-700">Contenu signalé :</p>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed pl-6">
                      {r.text}
                    </p>
                  </div>

                  {/* Footer info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Shield className="w-4 h-4 text-[#8a6bfe]" />
                      <span>
                        Traité par{' '}
                        <span className="font-semibold text-[#8a6bfe]">
                          {nameOf(r.resolvedBy)}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {r.resolvedAt?.toDate &&
                        new Date(r.resolvedAt.toDate()).toLocaleString('fr-BE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                    </div>
                  </div>

                  {/* Chat ID */}
                  <p className="text-xs text-gray-400 mt-2 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
                    Chat: {r.chatId}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}