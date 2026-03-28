'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc, getDoc, getDocs, collection, query,
  where, orderBy, updateDoc, onSnapshot,
  deleteDoc, addDoc, serverTimestamp,
} from 'firebase/firestore';
import Image from 'next/image';
import {
  Loader2, Check, X, ZoomIn, XCircle, Flag, AlertTriangle,
  Trash2, Ban, ThumbsUp, Shield, Clock, UserCheck,
  MessageSquare, History, CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  blocked?: boolean;
  studentProfile?: {
    cardURL?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
  };
}

interface ReportData {
  id: string;
  reporterId: string;
  senderId: string;
  text: string;
  chatId: string;
  messageId: string;
  createdAt?: any;
}

export default function CollaborateurPage() {
  const [loading, setLoading]         = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pendingCards, setPendingCards] = useState<UserData[]>([]);
  const [reports, setReports]           = useState<ReportData[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState<'cards' | 'reports'>('cards');
  const [userCache, setUserCache]       = useState<Record<string, UserData>>({});
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/auth/login'); return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.data();
      if (data?.role === 'collaborator' || data?.role === 'admin') {
        setIsAuthorized(true);
        fetchPendingCards();
        fetchReports();
      } else {
        router.push('/dashboard');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const getUserName = useCallback(async (uid: string) => {
    if (userCache[uid]) return userCache[uid];
    const snap = await getDoc(doc(db, 'users', uid));
    const data = snap.exists()
      ? (snap.data() as UserData)
      : { id: uid, firstName: 'Utilisateur', lastName: 'Inconnu' };
    setUserCache((prev) => ({ ...prev, [uid]: data }));
    return data;
  }, [userCache]);

  useEffect(() => {
    reports.forEach(async (r) => {
      await getUserName(r.reporterId);
      await getUserName(r.senderId);
    });
  }, [reports, getUserName]);

  const fetchPendingCards = async () => {
    const q = query(collection(db, 'users'), where('studentProfile.verificationStatus', '==', 'pending'));
    const snap = await getDocs(q);
    setPendingCards(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  };

  const fetchReports = () => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReports(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  };

  const handleDecision = async (userId: string, decision: 'verified' | 'rejected') => {
    if (!confirm(`Confirmer la carte comme ${decision === 'verified' ? 'acceptée' : 'refusée'} ?`)) return;
    setProcessingId(userId);
    await updateDoc(doc(db, 'users', userId), { 'studentProfile.verificationStatus': decision });
    setPendingCards((prev) => prev.filter((u) => u.id !== userId));
    setProcessingId(null);
  };

  const deleteMessage = async (report: ReportData) => {
    if (!confirm('Supprimer ce message définitivement ?')) return;
    await deleteDoc(doc(db, 'chats', report.chatId, 'messages', report.messageId));
    await deleteDoc(doc(db, 'reports', report.id));
    alert('Message supprimé avec succès.');
  };

  const blockUser = async (uid: string) => {
    if (!confirm('Bloquer cet utilisateur définitivement ?')) return;
    await updateDoc(doc(db, 'users', uid), { blocked: true });
    alert('Utilisateur bloqué avec succès.');
  };

  const markNotOffensive = async (r: ReportData) => {
    if (!confirm("Confirmer que ce message n'est pas offensif ?")) return;
    await addDoc(collection(db, 'reportsResolved'), {
      ...r, resolvedAt: serverTimestamp(),
      resolvedBy: auth.currentUser?.uid, decision: 'not_offensive',
    });
    await deleteDoc(doc(db, 'reports', r.id));
    alert('Signalement classé comme non offensif.');
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f8f5]">
      <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
      <p className="font-['DM_Sans',system-ui] text-gray-500 font-medium">
        Vérification des autorisations...
      </p>
    </div>
  );

  /* ── Non autorisé ── */
  if (!isAuthorized) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f8f5] px-5">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-5">
        <Ban className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="font-['Sora',system-ui] font-bold text-xl text-[#1a1a2e] mb-2">
        Accès refusé
      </h2>
      <p className="text-gray-400 text-sm mb-6 font-['DM_Sans',system-ui]">
        Vous n'avez pas les permissions nécessaires.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        className="px-5 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-semibold font-['DM_Sans',system-ui] hover:bg-violet-600 transition-colors"
      >
        Retour au tableau de bord
      </button>
    </div>
  );

  /* ── Render ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      <main className="min-h-screen bg-[#f9f8f5] font-['DM_Sans',system-ui,sans-serif]">

        {/* ── Hero ── */}
        <section className="max-w-[960px] mx-auto px-5 pt-14 pb-10 sm:pt-20 sm:pb-14">

          {/* Badge */}
          <div className="flex justify-center mb-7">
            <span className="inline-flex items-center gap-2 px-4 py-[7px] rounded-full bg-violet-50 border border-violet-200 text-[13px] font-semibold text-violet-500">
              <Shield className="w-3.5 h-3.5" />
              Espace Collaborateur
            </span>
          </div>

          <h1 className="font-['Sora',system-ui] text-center font-extrabold text-[2rem] sm:text-[3rem] leading-[1.15] tracking-[-0.03em] text-[#1a1a2e] mb-4">
            Modération{" "}
            <span className="bg-gradient-to-br from-violet-500 to-violet-300 bg-clip-text text-transparent">
              Woppy
            </span>
          </h1>

          <p className="text-center text-[15px] text-gray-400 max-w-[480px] mx-auto mb-10 leading-[1.7]">
            Gérez les vérifications de cartes étudiantes et modérez les signalements de la plateforme.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
              <p className="font-['Sora',system-ui] font-bold text-2xl text-[#1a1a2e]">
                {pendingCards.length}
              </p>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                Cartes en attente
              </p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
              <p className="font-['Sora',system-ui] font-bold text-2xl text-[#1a1a2e]">
                {reports.length}
              </p>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                Signalements
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-[960px] mx-auto px-5 pb-20">

          {/* ── Tabs ── */}
          <div className="bg-white border border-stone-200 rounded-2xl p-1.5 mb-6 flex gap-1.5">
            {([
              { key: 'cards',   label: 'Cartes étudiantes', icon: <UserCheck className="w-4 h-4" />, count: pendingCards.length, countColor: 'bg-violet-50 text-violet-500 border border-violet-200' },
              { key: 'reports', label: 'Signalements',       icon: <Flag className="w-4 h-4" />,      count: reports.length,      countColor: 'bg-red-50 text-red-500 border border-red-200' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                  ${activeTab === tab.key
                    ? 'bg-violet-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-stone-50'
                  }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${activeTab === tab.key ? 'bg-white/25 text-white' : tab.countColor}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Cartes étudiantes ── */}
          {activeTab === 'cards' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6"
            >
              {/* Header section */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-violet-500" />
                  </div>
                  <h2 className="font-['Sora',system-ui] font-bold text-lg text-[#1a1a2e]">
                    Vérification des cartes
                  </h2>
                </div>
                {pendingCards.length > 0 && (
                  <span className="text-[11px] font-semibold text-gray-400 bg-stone-100 px-3 py-1 rounded-full">
                    {pendingCards.length} en attente
                  </span>
                )}
              </div>

              {pendingCards.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <p className="font-['Sora',system-ui] font-bold text-[#1a1a2e] mb-1">
                    Tout est à jour !
                  </p>
                  <p className="text-sm text-gray-400">
                    Aucune carte étudiante en attente de vérification.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingCards.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-stone-200 rounded-2xl p-4 sm:p-5 hover:border-violet-200 hover:shadow-[0_2px_20px_rgba(138,107,254,0.08)] transition-all duration-150"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* Image carte */}
                        {user.studentProfile?.cardURL ? (
                          <div
                            className="relative cursor-pointer group shrink-0 self-start"
                            onClick={() => setSelectedImage(user.studentProfile!.cardURL!)}
                          >
                            <Image
                              src={user.studentProfile.cardURL}
                              alt="Carte étudiante"
                              width={160}
                              height={100}
                              className="rounded-xl border border-stone-200 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-xl">
                              <ZoomIn className="text-white w-6 h-6" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-[160px] h-[100px] bg-stone-50 rounded-xl flex items-center justify-center border border-dashed border-stone-300 shrink-0 self-start">
                            <span className="text-xs text-gray-400">Pas d'image</span>
                          </div>
                        )}

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <p className="font-['Sora',system-ui] font-bold text-[15px] text-[#1a1a2e] mb-1">
                            {user.firstName} {user.lastName}
                          </p>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Clock className="w-3 h-3 text-violet-400" />
                            <span className="text-[12px] text-gray-400">En attente de vérification</span>
                          </div>
                          <span className="text-[10px] text-gray-400 bg-stone-100 px-2.5 py-1 rounded-lg font-mono">
                            {user.id}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 shrink-0">
                          <button
                            disabled={processingId === user.id}
                            onClick={() => handleDecision(user.id, 'verified')}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === user.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Check className="w-4 h-4" />
                            }
                            Accepter
                          </button>
                          <button
                            disabled={processingId === user.id}
                            onClick={() => handleDecision(user.id, 'rejected')}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                            Refuser
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Signalements ── */}
          {activeTab === 'reports' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6"
            >
              {/* Header section */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                    <Flag className="w-4 h-4 text-red-500" />
                  </div>
                  <h2 className="font-['Sora',system-ui] font-bold text-lg text-[#1a1a2e]">
                    Messages signalés
                  </h2>
                </div>
                <button
                  onClick={() => router.push('/dashboard/collaborateur/reportsResolved')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  Historique
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <p className="font-['Sora',system-ui] font-bold text-[#1a1a2e] mb-1">
                    Aucun signalement
                  </p>
                  <p className="text-sm text-gray-400">
                    Tous les signalements ont été traités.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {reports.map((r, index) => {
                    const reporter = userCache[r.reporterId];
                    const sender   = userCache[r.senderId];
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-stone-200 rounded-2xl p-4 sm:p-5 hover:border-red-200 hover:shadow-[0_2px_20px_rgba(239,68,68,0.06)] transition-all duration-150"
                      >
                        {/* Top : qui + quand */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                              </div>
                              <span className="text-[13px] font-semibold text-[#1a1a2e]">
                                Signalé par{" "}
                                <span className="text-violet-500">
                                  {reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Inconnu'}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 pl-8">
                              <MessageSquare className="w-3 h-3 text-gray-400" />
                              <span className="text-[12px] text-gray-400">
                                Expéditeur :{" "}
                                <span className="font-semibold text-gray-600">
                                  {sender ? `${sender.firstName} ${sender.lastName}` : 'Inconnu'}
                                </span>
                              </span>
                            </div>
                          </div>
                          <span className="self-start sm:self-auto text-[11px] font-semibold text-red-500 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                            {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('fr-FR') : '—'}
                          </span>
                        </div>

                        {/* Message signalé */}
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-3">
                          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                            {r.text}
                          </p>
                        </div>

                        {/* Chat ID */}
                        <p className="text-[10px] text-gray-400 font-mono bg-stone-100 inline-block px-2.5 py-1 rounded-lg mb-4">
                          Chat: {r.chatId}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => deleteMessage(r)}
                            className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Supprimer
                          </button>
                          <button
                            onClick={() => blockUser(r.senderId)}
                            className="inline-flex items-center gap-1.5 bg-[#1a1a2e] hover:bg-[#2a2a3e] text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Bloquer
                          </button>
                          <button
                            onClick={() => markNotOffensive(r)}
                            className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Pas offensif
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* ── Image preview ── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-5"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Carte étudiante"
                width={1200}
                height={800}
                className="rounded-2xl shadow-2xl object-contain max-h-[85vh] w-full"
              />
              <button
                className="absolute -top-3 -right-3 bg-white text-gray-600 hover:text-gray-900 rounded-full p-1.5 shadow-lg transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <XCircle className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-sm text-gray-600 font-medium">
                  💡 Vérifiez que la carte est valide et correspond à l'utilisateur
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}