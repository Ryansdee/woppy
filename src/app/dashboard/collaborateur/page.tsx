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
  updateDoc,
} from 'firebase/firestore';
import Image from 'next/image';
import { Loader2, Check, X, ZoomIn, XCircle } from 'lucide-react';

interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  studentProfile?: {
    cardURL?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
  };
}

export default function CollaborateurPage() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pendingCards, setPendingCards] = useState<UserData[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  // 🔐 Vérifier le rôle collaborateur
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.role === 'collaborator' || data.role === 'admin') {
            setIsAuthorized(true);
            fetchPendingCards(); // Charger les cartes
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Erreur chargement rôle:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // 🔎 Charger les cartes étudiantes en attente
  const fetchPendingCards = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('studentProfile.verificationStatus', '==', 'pending')
      );
      const snap = await getDocs(q);
      const users: UserData[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as UserData[];
      setPendingCards(users);
    } catch (err) {
      console.error('Erreur chargement cartes:', err);
    }
  };

  // 🟢 Accepter ou refuser une carte
  const handleDecision = async (userId: string, decision: 'verified' | 'rejected') => {
    if (!confirm(`Confirmer la carte comme ${decision === 'verified' ? 'vérifiée' : 'refusée'} ?`))
      return;

    try {
      setProcessingId(userId);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'studentProfile.verificationStatus': decision,
      });
      setPendingCards((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      alert('❌ Impossible de modifier le statut.');
    } finally {
      setProcessingId(null);
    }
  };

  // 🌀 Chargement
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#8a6bfe]" />
      </div>
    );

  // 🚫 Accès refusé
  if (!isAuthorized)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Accès refusé.
      </div>
    );

  // ✅ Vue principale
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-black relative">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Espace collaborateur</h1>
        <p className="text-gray-700 mb-6">
          Bienvenue dans la section réservée aux collaborateurs. Vous pouvez ici vérifier les cartes étudiantes,
          gérer les profils et approuver ou refuser les demandes.
        </p>

        <div className="bg-white border border-gray-200 rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Cartes étudiantes en attente</h2>

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
      </div>

      {/* 🖼️ MODALE D’APERÇU PLEIN ÉCRAN */}
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
