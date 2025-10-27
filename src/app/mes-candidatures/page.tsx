'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { Loader2, Briefcase, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Candidature {
  id: string;
  annonceId: string;
  statut: string;
  date: any;
}

interface Annonce {
  id: string;
  description: string;
  lieu: string;
  remuneration: number;
  statut: string;
}

export default function MesCandidaturesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [candidatures, setCandidatures] = useState<(Candidature & { annonce?: Annonce })[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'candidatures'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list: Candidature[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Candidature[];

      // récupérer les infos d’annonce
      const withAnnonce = await Promise.all(
        list.map(async (c) => {
          const ref = doc(db, 'annonces', c.annonceId);
          const snapAnnonce = await getDoc(ref);
          return { ...c, annonce: snapAnnonce.exists() ? (snapAnnonce.data() as Annonce) : undefined };
        })
      );

      setCandidatures(withAnnonce);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-[#8a6bfe]" />
        Chargement de vos candidatures...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] mb-6"
        >
          <ArrowLeft size={18} />
          Retour au tableau de bord
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <Briefcase size={28} className="text-[#8a6bfe]" />
          <h1 className="text-2xl font-bold">Mes candidatures</h1>
        </div>

        {candidatures.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            Vous n’avez encore postulé à aucune annonce.
          </p>
        ) : (
          <div className="space-y-4">
            {candidatures.map((c) => (
              <Link
                key={c.id}
                href={`/annonces/${c.annonceId}`}
                className="block bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#8a6bfe] transition p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {c.annonce?.description?.slice(0, 60) || 'Annonce supprimée'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{c.annonce?.lieu}</p>
                  </div>
                  <StatusBadge statut={c.statut} />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                  <span>
                    Postulé le{' '}
                    {c.date?.seconds
                      ? new Date(c.date.seconds * 1000).toLocaleDateString('fr-BE')
                      : ''}
                  </span>
                  {c.annonce && (
                    <span className="text-[#8a6bfe] font-semibold">
                      {c.annonce.remuneration} €
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  let color = 'bg-gray-200 text-gray-700';
  let icon = <Clock size={14} />;
  if (statut === 'acceptée') {
    color = 'bg-green-100 text-green-700';
    icon = <CheckCircle size={14} />;
  } else if (statut === 'refusée') {
    color = 'bg-red-100 text-red-600';
    icon = <XCircle size={14} />;
  } else if (statut === 'en attente') {
    color = 'bg-yellow-100 text-yellow-700';
    icon = <Clock size={14} />;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {icon}
      {statut}
    </span>
  );
}
