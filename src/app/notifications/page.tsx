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
  updateDoc,
  doc,
} from 'firebase/firestore';

import {
  Bell,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

// ------------------------------------------------------------
// TypeScript Notification type
// ------------------------------------------------------------
interface Notification {
  id: string;
  message: string;
  annonceId?: string;
  fromUser?: string;
  createdAt?: any;
  read: boolean;
}

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------
export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // LOAD NOTIFICATIONS
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('toUser', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: Notification[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Notification[];

      setNotifications(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // Mark as read
  async function markAsRead(id: string) {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Erreur mise à jour notification :', err);
    }
  }

  // ------------------------------------------------------------
  // LOADING
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-[#8a6bfe]" />
        Chargement des notifications...
      </div>
    );
  }

  // ------------------------------------------------------------
  // RENDER PAGE
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] mb-6"
        >
          <ArrowLeft size={18} />
          Retour au tableau de bord
        </Link>

        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <Bell size={28} className="text-[#8a6bfe]" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>

        {/* EMPTY */}
        {notifications.length === 0 && (
          <p className="text-gray-600 text-center py-12">
            Aucune notification pour le moment.
          </p>
        )}

        {/* LIST */}
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer ${
                n.read ? 'opacity-70' : 'border-[#8a6bfe]'
              }`}
              onClick={() => {
                markAsRead(n.id);
                if (n.annonceId) router.push(`/jobs/${n.annonceId}`);
              }}
            >
              <div className="flex justify-between items-start">
                <p className="text-gray-800">{n.message}</p>

                {!n.read && (
                  <span className="bg-[#8a6bfe] text-white text-xs px-3 py-1 rounded-full">
                    Nouveau
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {n.createdAt?.seconds
                  ? new Date(n.createdAt.seconds * 1000).toLocaleString('fr-BE')
                  : ''}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
