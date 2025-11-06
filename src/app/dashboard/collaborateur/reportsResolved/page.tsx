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
} from 'lucide-react';
import Link from 'next/link';

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

export default function ReportsResolvedPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportResolved[]>([]);
  const [userCache, setUserCache] = useState<{ [uid: string]: UserData }>({});
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  // ✅ Étape 1 — Vérifier le rôle utilisateur
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const role = snap.exists() ? snap.data()?.role : null;

        if (role === 'collaborator' || role === 'admin') {
          setAuthorized(true);
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Erreur vérification rôle:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // ✅ Étape 2 — Charger les reports après autorisation
  useEffect(() => {
    if (!authorized) return;

    const q = query(collection(db, 'reportsResolved'), orderBy('resolvedAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReportResolved));
      setReports(list);

      // Récupérer tous les UID uniques mentionnés dans ces reports
      const uids = new Set<string>();
      list.forEach((r) => {
        if (r.reporterId) uids.add(r.reporterId);
        if (r.senderId) uids.add(r.senderId);
        if (r.resolvedBy) uids.add(r.resolvedBy);
      });

      // Charger les noms si non déjà présents dans le cache
      const newCache: { [uid: string]: UserData } = { ...userCache };
      await Promise.all(
        Array.from(uids).map(async (uid) => {
          if (!newCache[uid]) {
            try {
              const snap = await getDoc(doc(db, 'users', uid));
              if (snap.exists()) {
                const data = snap.data();
                newCache[uid] = {
                  firstName: data.firstName || '',
                  lastName: data.lastName || '',
                  displayName:
                    data.displayName ||
                    `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                };
              } else {
                newCache[uid] = { displayName: 'Utilisateur inconnu' };
              }
            } catch {
              newCache[uid] = { displayName: 'Utilisateur inconnu' };
            }
          }
        })
      );

      setUserCache(newCache);
      setLoading(false);
    });

    return () => unsub();
  }, [authorized]);

  // === Étape 3 — UI ===
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5e5ff]/60">
        <Loader2 className="w-10 h-10 animate-spin text-[#8a6bfe]" />
      </div>
    );

  if (!authorized)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Accès refusé.
      </div>
    );

  // Utilitaire pour afficher un nom lisible
  const nameOf = (uid: string) => {
    const u = userCache[uid];
    return u?.displayName || 'Utilisateur inconnu';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#8a6bfe] flex items-center gap-2">
            <Flag className="w-7 h-7" /> Historique des signalements
          </h1>
          <Link
            href="/dashboard/collaborateur"
            className="flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>

        {reports.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">
            Aucun signalement résolu pour l’instant.
          </p>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-white border border-[#ddc2ff] rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-[#8a6bfe]" />
                    Signalé par{' '}
                    <span className="text-[#8a6bfe]">{nameOf(r.reporterId)}</span>
                  </p>
                  <span
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      r.decision === 'not_offensive'
                        ? 'text-green-600'
                        : r.decision === 'blocked'
                        ? 'text-red-600'
                        : 'text-[#8a6bfe]'
                    }`}
                  >
                    {r.decision === 'not_offensive' && <ThumbsUp className="w-4 h-4" />}
                    {r.decision === 'blocked' && <Ban className="w-4 h-4" />}
                    {r.decision === 'deleted' && <CheckCircle className="w-4 h-4" />}
                    {r.decision === 'not_offensive'
                      ? 'Pas offensif'
                      : r.decision === 'blocked'
                      ? 'Utilisateur bloqué'
                      : 'Message supprimé'}
                  </span>
                </div>

                <p className="text-gray-700 mt-2">
                  Contenu : <span className="font-medium">{r.text}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#8a6bfe]" />
                  Chat : {r.chatId} • Expéditeur :{' '}
                  <span className="text-[#8a6bfe]">{nameOf(r.senderId)}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Décision prise par :{' '}
                  <span className="text-[#8a6bfe] font-medium">{nameOf(r.resolvedBy)}</span>{' '}
                  —{' '}
                  {r.resolvedAt?.toDate &&
                    new Date(r.resolvedAt.toDate()).toLocaleString('fr-BE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
