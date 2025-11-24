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
} from 'lucide-react';

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
    if (!confirm(`Confirmer la carte comme ${decision}?`)) return;
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

    alert('Message supprimé.');
  };

  /* -------------------------------------------------------------------------- */
  /*                                 BLOCK USER                                 */
  /* -------------------------------------------------------------------------- */
  const blockUser = async (uid: string) => {
    if (!confirm("Bloquer cet utilisateur ?")) return;

    await updateDoc(doc(db, 'users', uid), { blocked: true });

    alert('Utilisateur bloqué.');
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

    alert('Signalement classé.');
  };

  /* -------------------------------------------------------------------------- */
  /*                                  UI : LOADING                               */
  /* -------------------------------------------------------------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#8a6bfe]" />
      </div>
    );

  if (!isAuthorized)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Accès refusé.
      </div>
    );

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-black">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="w-7 h-7 text-[#8a6bfe]" />
          Espace collaborateur
        </h1>
        <p className="text-gray-700 mb-6">
          Gérez ici les cartes étudiantes et les signalements de la plateforme.
        </p>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-xl font-semibold transition ${
              activeTab === 'cards'
                ? 'bg-[#8a6bfe] text-white shadow-md'
                : 'bg-[#f5e5ff] text-gray-700 hover:bg-[#ddc2ff]/50'
            }`}
          >
            Cartes étudiantes
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition ${
              activeTab === 'reports'
                ? 'bg-[#8a6bfe] text-white shadow-md'
                : 'bg-[#f5e5ff] text-gray-700 hover:bg-[#ddc2ff]/50'
            }`}
          >
            Signalements
            {reports.length > 0 && (
              <span className="ml-1 bg-white text-[#8a6bfe] text-xs px-2 py-0.5 rounded-full shadow-sm">
                {reports.length}
              </span>
            )}
          </button>
        </div>

        {/* ------------------------------ CARTES ÉTUDIANTES ------------------------------ */}
        {activeTab === 'cards' && (
          <div className="bg-white border rounded-xl shadow p-5">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8a6bfe]" />
              Vérification des cartes étudiantes
            </h2>

            {pendingCards.length === 0 ? (
              <p className="text-gray-500">Aucune carte en attente.</p>
            ) : (
              pendingCards.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-[#f8f6ff] border border-[#e5d9ff] rounded-xl p-4 mb-3"
                >
                  {/* Image */}
                  <div className="flex items-center gap-4">
                    {user.studentProfile?.cardURL ? (
                      <div
                        className="relative cursor-pointer group"
                        onClick={() => setSelectedImage(user.studentProfile!.cardURL!)}
                      >
                        <Image
                          src={user.studentProfile.cardURL}
                          alt="Carte étudiante"
                          width={110}
                          height={80}
                          className="rounded-md border object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <ZoomIn className="text-white w-5 h-5" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-[110px] h-[80px] bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                        Pas d’image
                      </div>
                    )}

                    <div>
                      <p className="font-semibold">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">En attente de vérification</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      disabled={processingId === user.id}
                      onClick={() => handleDecision(user.id, 'verified')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Accepter
                    </button>

                    <button
                      disabled={processingId === user.id}
                      onClick={() => handleDecision(user.id, 'rejected')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
                    >
                      <X className="w-4 h-4" />
                      Refuser
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ------------------------------ SIGNALEMENTS ------------------------------ */}
        {activeTab === 'reports' && (
          <div className="bg-white border rounded-xl shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#8a6bfe] flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Messages signalés
              </h2>

              <button
                onClick={() => router.push('/dashboard/collaborateur/reportsResolved')}
                className="px-3 py-1.5 text-sm rounded-lg bg-[#8a6bfe]/10 text-[#8a6bfe] font-semibold hover:bg-[#8a6bfe]/20 transition"
              >
                Historique
              </button>
            </div>

            {reports.length === 0 ? (
              <p className="text-gray-500">Aucun signalement.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((r) => {
                  const reporter = userCache[r.reporterId];
                  const sender = userCache[r.senderId];

                  return (
                    <div
                      key={r.id}
                      className="p-5 bg-[#f8f6ff] border border-[#e5d9ff] rounded-xl shadow-sm hover:shadow-md transition"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold flex items-center gap-2 text-gray-900">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Signalé par :
                            <span className="text-[#8a6bfe] ml-1">
                              {reporter ? `${reporter.firstName} ${reporter.lastName}` : r.reporterId}
                            </span>
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Expéditeur :
                            <span className="font-medium text-gray-700 ml-1">
                              {sender ? `${sender.firstName} ${sender.lastName}` : r.senderId}
                            </span>
                          </p>
                        </div>

                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-semibold">
                          {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('fr-FR') : ''}
                        </span>
                      </div>

                      {/* Contenu signalé */}
                      <div className="mt-3 bg-white border border-[#e5d9ff] p-3 rounded-lg shadow-inner">
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {r.text}
                        </p>
                      </div>

                      {/* Infos */}
                      <p className="text-xs text-gray-500 mt-1">
                        Chat : <span className="font-mono">{r.chatId}</span>
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={() => deleteMessage(r)}
                          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer message
                        </button>

                        <button
                          onClick={() => blockUser(r.senderId)}
                          className="flex items-center gap-1 bg-[#8a6bfe] hover:bg-[#7b5aff] text-white px-3 py-1.5 rounded-lg text-sm"
                        >
                          <Ban className="w-4 h-4" />
                          Bloquer expéditeur
                        </button>

                        <button
                          onClick={() => markNotOffensive(r)}
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Pas offensif
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* IMAGE PREVIEW */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="Carte étudiante"
              width={900}
              height={700}
              className="rounded-xl shadow-xl object-contain max-h-[90vh]"
            />

            <button
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1"
              onClick={() => setSelectedImage(null)}
            >
              <XCircle className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
