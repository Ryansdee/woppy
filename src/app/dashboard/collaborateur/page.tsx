'use client';

import { useEffect, useState } from 'react';
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

interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
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
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pendingCards, setPendingCards] = useState<UserData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'reports'>('cards');
  const router = useRouter();

  // 🔐 Vérifie le rôle collaborateur/admin
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = snap.exists() ? snap.data() : {};
        if (data.role === 'collaborator' || data.role === 'admin') {
          setIsAuthorized(true);
          fetchPendingCards();
          fetchReports();
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Erreur rôle:', err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  // 🎓 Cartes étudiantes
  const fetchPendingCards = async () => {
    const q = query(
      collection(db, 'users'),
      where('studentProfile.verificationStatus', '==', 'pending')
    );
    const snap = await getDocs(q);
    const users: UserData[] = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as UserData[];
    setPendingCards(users);
  };

  // 🚨 Signalements (écoute en temps réel)
  const fetchReports = () => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) =>
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReportData)))
    );
    return () => unsub();
  };

  // 🟢 Accepter/refuser carte étudiante
  const handleDecision = async (userId: string, decision: 'verified' | 'rejected') => {
    if (!confirm(`Confirmer la carte comme ${decision === 'verified' ? 'vérifiée' : 'refusée'} ?`))
      return;
    setProcessingId(userId);
    await updateDoc(doc(db, 'users', userId), {
      'studentProfile.verificationStatus': decision,
    });
    setPendingCards((prev) => prev.filter((u) => u.id !== userId));
    setProcessingId(null);
  };

  // 🗑️ Supprimer message signalé
  const deleteMessage = async (report: ReportData) => {
    if (!confirm('Supprimer définitivement ce message signalé ?')) return;
    await deleteDoc(doc(db, 'chats', report.chatId, 'messages', report.messageId));
    await deleteDoc(doc(db, 'reports', report.id));
    alert('Message supprimé et signalement effacé.');
  };

  // 🚫 Bloquer utilisateur
  const blockUser = async (userId: string) => {
    if (!confirm("Bloquer l'expéditeur signalé ?")) return;
    await updateDoc(doc(db, 'users', userId), { blocked: true });
    alert('Utilisateur bloqué.');
  };

  // 👍 Marquer “Pas offensif”
  const markNotOffensive = async (report: ReportData) => {
    if (!confirm('Confirmer que ce message n’est pas offensif ?')) return;
    await addDoc(collection(db, 'reportsResolved'), {
      ...report,
      resolvedAt: serverTimestamp(),
      resolvedBy: auth.currentUser?.uid || 'collaborator',
      decision: 'not_offensive',
    });
    await deleteDoc(doc(db, 'reports', report.id));
    alert('Signalement marqué comme non offensif.');
  };

  // 🌀 Loading
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-black relative">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-7 h-7 text-[#8a6bfe]" /> Espace collaborateur
        </h1>
        <p className="text-gray-700 mb-6">
          Ici, vous pouvez vérifier les cartes étudiantes et traiter les signalements des utilisateurs.
        </p>

        {/* Onglets avec compteur */}
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
              <span className="ml-1 bg-white/80 text-[#8a6bfe] text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                {reports.length}
              </span>
            )}
          </button>
        </div>
        

        {/* === CARTES ÉTUDIANTES === */}
        {activeTab === 'cards' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8a6bfe]" /> Vérification des cartes étudiantes
            </h2>

            {pendingCards.length === 0 ? (
              <p className="text-gray-500">Aucune carte à vérifier pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {pendingCards.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-[#f8f6ff] border border-[#e5d9ff] rounded-xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      {user.studentProfile?.cardURL ? (
                        <div
                          className="relative cursor-pointer group"
                          onClick={() => setSelectedImage(user.studentProfile!.cardURL!)}
                        >
                          <Image
                            src={user.studentProfile.cardURL}
                            alt="Carte étudiante"
                            width={100}
                            height={70}
                            className="rounded-md border object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <ZoomIn className="text-white w-5 h-5" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-[100px] h-[70px] bg-gray-200 flex items-center justify-center rounded-md text-xs text-gray-500">
                          Pas d’image
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.firstName || ''} {user.lastName || ''}
                        </p>
                        <p className="text-sm text-gray-600">
                          Statut : <span className="text-yellow-600">En attente</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(user.id, 'verified')}
                        disabled={processingId === user.id}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleDecision(user.id, 'rejected')}
                        disabled={processingId === user.id}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === SIGNALEMENTS === */}
        {activeTab === 'reports' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow p-4">
            {/* Lien vers l’historique */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#8a6bfe] flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Gestion des signalements
              </h2>
              <button
                onClick={() => router.push('/dashboard/collaborateur/reportsResolved')}
                className="flex items-center gap-2 text-sm bg-[#8a6bfe]/10 hover:bg-[#8a6bfe]/20 text-[#8a6bfe] px-3 py-1.5 rounded-lg transition font-semibold"
              >
                Voir l’historique
              </button>
            </div>
            {reports.length === 0 ? (
              <p className="text-gray-500">Aucun message signalé.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-[#f8f6ff] border border-[#e5d9ff] rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Signalé par : <span className="text-[#8a6bfe]">{r.reporterId}</span>
                    </p>
                    <p className="text-gray-700 mt-1">
                      Contenu : <span className="font-medium">{r.text}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Chat : {r.chatId} • Expéditeur : {r.senderId}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <button
                        onClick={() => deleteMessage(r)}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer message
                      </button>
                      <button
                        onClick={() => blockUser(r.senderId)}
                        className="flex items-center gap-1 bg-[#8a6bfe] hover:bg-[#7b5aff] text-white px-3 py-1 rounded-lg text-sm"
                      >
                        <Ban className="w-4 h-4" />
                        Bloquer expéditeur
                      </button>
                      <button
                        onClick={() => markNotOffensive(r)}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Pas offensif
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🖼️ MODALE D’APERÇU */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="Carte étudiante"
              width={800}
              height={600}
              className="object-contain rounded-lg shadow-lg max-h-[90vh] mx-auto"
            />
            <button
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1"
              onClick={() => setSelectedImage(null)}
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
