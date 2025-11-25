'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  updateDoc,
  onSnapshot,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import Image from 'next/image';
import {
  Loader2,
  Check,
  X,
  ZoomIn,
  XCircle,
  Flag,
  Users,
  AlertTriangle,
  Trash2,
  Ban,
  ThumbsUp,
  Shield,
  Clock,
  UserCheck,
  MessageSquare,
  History,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*                                 INTERFACES                                 */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                               PAGE COLLABORATEUR                           */
/* -------------------------------------------------------------------------- */
export default function CollaborateurPage() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [pendingCards, setPendingCards] = useState<UserData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'reports'>('cards');

  const router = useRouter();

  const [userCache, setUserCache] = useState<Record<string, UserData>>({});

  /* -------------------------------------------------------------------------- */
  /*                          AUTH + ROLE VERIFICATION                          */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

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

  /* -------------------------------------------------------------------------- */
  /*                        FETCH USER DATA FOR NAMES                           */
  /* -------------------------------------------------------------------------- */
  const getUserName = useCallback(
    async (uid: string) => {
      if (userCache[uid]) return userCache[uid];

      const snap = await getDoc(doc(db, 'users', uid));
      const data = snap.exists()
        ? (snap.data() as UserData)
        : { id: uid, firstName: 'Utilisateur', lastName: 'Inconnu' };

      setUserCache((prev) => ({ ...prev, [uid]: data }));
      return data;
    },
    [userCache]
  );

  useEffect(() => {
    reports.forEach(async (r) => {
      await getUserName(r.reporterId);
      await getUserName(r.senderId);
    });
  }, [reports, getUserName]);

  /* -------------------------------------------------------------------------- */
  /*                             FETCH PENDING CARDS                             */
  /* -------------------------------------------------------------------------- */
  const fetchPendingCards = async () => {
    const q = query(
      collection(db, 'users'),
      where('studentProfile.verificationStatus', '==', 'pending')
    );
    const snap = await getDocs(q);

    setPendingCards(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }))
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                              FETCH REPORTS LIVE                             */
  /* -------------------------------------------------------------------------- */
  const fetchReports = () => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      setReports(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }))
      );
    });

    return () => unsub();
  };

  /* -------------------------------------------------------------------------- */
  /*                            VALIDATION CARTES                               */
  /* -------------------------------------------------------------------------- */
  const handleDecision = async (userId: string, decision: 'verified' | 'rejected') => {
    if (!confirm(`Confirmer la carte comme ${decision === 'verified' ? 'acceptée' : 'refusée'} ?`)) return;
    setProcessingId(userId);

    await updateDoc(doc(db, 'users', userId), {
      'studentProfile.verificationStatus': decision,
    });

    setPendingCards((prev) => prev.filter((u) => u.id !== userId));
    setProcessingId(null);
  };

  /* -------------------------------------------------------------------------- */
  /*                               DELETE MESSAGE                               */
  /* -------------------------------------------------------------------------- */
  const deleteMessage = async (report: ReportData) => {
    if (!confirm('Supprimer ce message définitivement ?')) return;

    await deleteDoc(doc(db, 'chats', report.chatId, 'messages', report.messageId));
    await deleteDoc(doc(db, 'reports', report.id));

    alert('Message supprimé avec succès.');
  };

  /* -------------------------------------------------------------------------- */
  /*                                 BLOCK USER                                 */
  /* -------------------------------------------------------------------------- */
  const blockUser = async (uid: string) => {
    if (!confirm("Bloquer cet utilisateur définitivement ?")) return;

    await updateDoc(doc(db, 'users', uid), { blocked: true });

    alert('Utilisateur bloqué avec succès.');
  };

  /* -------------------------------------------------------------------------- */
  /*                                  NOT OFFENSIVE                             */
  /* -------------------------------------------------------------------------- */
  const markNotOffensive = async (r: ReportData) => {
    if (!confirm("Confirmer que ce message n'est pas offensif ?")) return;

    await addDoc(collection(db, 'reportsResolved'), {
      ...r,
      resolvedAt: serverTimestamp(),
      resolvedBy: auth.currentUser?.uid,
      decision: 'not_offensive',
    });

    await deleteDoc(doc(db, 'reports', r.id));

    alert('Signalement classé comme non offensif.');
  };

  /* -------------------------------------------------------------------------- */
  /*                                  UI : LOADING                               */
  /* -------------------------------------------------------------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <Loader2 className="w-12 h-12 animate-spin text-[#8a6bfe] mb-4" />
        <p className="text-gray-600 font-medium">Vérification des autorisations...</p>
      </div>
    );

  if (!isAuthorized)
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
  /*                                   RENDER                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header avec gradient Woppy */}
      <div className="bg-gradient-to-r from-[#6b4fd9] via-[#8a6bfe] to-[#7b5bef] text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Espace Collaborateur</h1>
                <p className="text-purple-100">
                  Gérez les vérifications et modérez la plateforme
                </p>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[100px] text-center">
                <p className="text-2xl font-bold">{pendingCards.length}</p>
                <p className="text-xs text-purple-100">Cartes en attente</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[100px] text-center">
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-xs text-purple-100">Signalements</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs modernes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-2 mb-8 flex gap-2"
        >
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'cards'
                ? 'bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            Cartes étudiantes
            {pendingCards.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'cards' ? 'bg-white/30' : 'bg-purple-100 text-purple-700'
              }`}>
                {pendingCards.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Flag className="w-5 h-5" />
            Signalements
            {reports.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'reports' ? 'bg-white/30' : 'bg-red-100 text-red-700'
              }`}>
                {reports.length}
              </span>
            )}
          </button>
        </motion.div>

        {/* ------------------------------ CARTES ÉTUDIANTES ------------------------------ */}
        {activeTab === 'cards' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-xl flex items-center justify-center text-white">
                  <UserCheck className="w-5 h-5" />
                </div>
                Vérification des cartes étudiantes
              </h2>

              {pendingCards.length > 0 && (
                <span className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full font-medium">
                  {pendingCards.length} en attente
                </span>
              )}
            </div>

            {pendingCards.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tout est à jour !</h3>
                <p className="text-gray-600">Aucune carte étudiante en attente de vérification.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCards.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-2 border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {user.studentProfile?.cardURL ? (
                          <div
                            className="relative cursor-pointer group"
                            onClick={() => setSelectedImage(user.studentProfile!.cardURL!)}
                          >
                            <Image
                              src={user.studentProfile.cardURL}
                              alt="Carte étudiante"
                              width={160}
                              height={100}
                              className="rounded-xl border-2 border-gray-300 object-cover shadow-md"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-xl">
                              <ZoomIn className="text-white w-8 h-8" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-[160px] h-[100px] bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-500 border-2 border-dashed border-gray-300">
                            Pas d'image
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-[#8a6bfe]" />
                          En attente de vérification
                        </p>
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full font-medium">
                          ID: {user.id}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2">
                        <button
                          disabled={processingId === user.id}
                          onClick={() => handleDecision(user.id, 'verified')}
                          className="flex-1 md:flex-none bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Accepter
                        </button>

                        <button
                          disabled={processingId === user.id}
                          onClick={() => handleDecision(user.id, 'rejected')}
                          className="flex-1 md:flex-none bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* ------------------------------ SIGNALEMENTS ------------------------------ */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                  <Flag className="w-5 h-5" />
                </div>
                Messages signalés
              </h2>

              <button
                onClick={() => router.push('/dashboard/collaborateur/reportsResolved')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
              >
                <History className="w-4 h-4" />
                Historique
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun signalement</h3>
                <p className="text-gray-600">Tous les signalements ont été traités.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((r, index) => {
                  const reporter = userCache[r.reporterId];
                  const sender = userCache[r.senderId];

                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gradient-to-br from-red-50/50 to-pink-50/50 border-2 border-red-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                    >
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                            <p className="font-bold text-gray-900">
                              Signalé par{' '}
                              <span className="text-[#8a6bfe]">
                                {reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Inconnu'}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MessageSquare className="w-4 h-4" />
                            <span>Expéditeur :</span>
                            <span className="font-semibold text-gray-900">
                              {sender ? `${sender.firstName} ${sender.lastName}` : 'Inconnu'}
                            </span>
                          </div>
                        </div>

                        <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                          {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('fr-FR') : ''}
                        </span>
                      </div>

                      {/* Contenu signalé */}
                      <div className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-inner mb-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {r.text}
                        </p>
                      </div>

                      {/* Info chat */}
                      <p className="text-xs text-gray-500 mb-4 font-mono bg-gray-100 inline-block px-3 py-1 rounded-lg">
                        Chat: {r.chatId}
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => deleteMessage(r)}
                          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>

                        <button
                          onClick={() => blockUser(r.senderId)}
                          className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-900 hover:shadow-lg text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        >
                          <Ban className="w-4 h-4" />
                          Bloquer
                        </button>

                        <button
                          onClick={() => markNotOffensive(r)}
                          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        >
                          <ThumbsUp className="w-4 h-4" />
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

      {/* IMAGE PREVIEW avec animation */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Carte étudiante"
                width={1200}
                height={800}
                className="rounded-2xl shadow-2xl object-contain max-h-[90vh]"
              />

              <button
                className="absolute -top-4 -right-4 bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow-xl transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <XCircle className="w-8 h-8" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm text-gray-700 font-medium">
                  💡 Vérifiez que la carte est valide et correspond à l'utilisateur
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}