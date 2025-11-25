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
  writeBatch,
} from 'firebase/firestore';

import {
  Bell,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  MessageSquare,
  AlertCircle,
  CheckCheck,
  Trash2,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  type?: 'job' | 'message' | 'system' | 'alert';
}

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------
export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
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

  // Mark all as read
  async function markAllAsRead() {
    if (!user) return;
    
    try {
      const batch = writeBatch(db);
      const unreadNotifs = notifications.filter(n => !n.read);
      
      unreadNotifs.forEach(n => {
        const notifRef = doc(db, 'notifications', n.id);
        batch.update(notifRef, { read: true });
      });
      
      await batch.commit();
    } catch (err) {
      console.error('Erreur lors du marquage des notifications :', err);
    }
  }

  // Delete notification
  async function deleteNotification(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    
    if (!confirm('Supprimer cette notification ?')) return;
    
    try {
      await updateDoc(doc(db, 'notifications', id), { deleted: true });
    } catch (err) {
      console.error('Erreur suppression notification :', err);
    }
  }

  // Get icon based on type
  function getNotificationIcon(type?: string) {
    switch (type) {
      case 'job':
        return <Briefcase className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  }

  // Get color based on type
  function getNotificationColor(type?: string) {
    switch (type) {
      case 'job':
        return 'from-blue-500 to-cyan-500';
      case 'message':
        return 'from-[#8a6bfe] to-[#6b4fd9]';
      case 'alert':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // ------------------------------------------------------------
  // LOADING
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <Loader2 className="animate-spin w-12 h-12 mb-4 text-[#8a6bfe]" />
        <p className="text-gray-600 font-medium">Chargement des notifications...</p>
      </div>
    );
  }

  // ------------------------------------------------------------
  // RENDER PAGE
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header avec gradient Woppy */}
      <div className="bg-gradient-to-r from-[#6b4fd9] via-[#8a6bfe] to-[#7b5bef] text-white shadow-xl">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              Retour au tableau de bord
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Bell className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Notifications</h1>
                  <p className="text-purple-100 mt-1">
                    {unreadCount > 0 ? (
                      <>
                        <span className="font-semibold">{unreadCount}</span> non lue
                        {unreadCount > 1 ? 's' : ''}
                      </>
                    ) : (
                      'Tout est à jour'
                    )}
                  </p>
                </div>
              </div>

              {/* Badge count */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <span className="text-3xl font-bold">{unreadCount}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Actions bar */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Non lues ({unreadCount})
                </button>
              </div>

              {/* Actions */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  <CheckCheck className="w-4 h-4" />
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* EMPTY STATE */}
        {filteredNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              {filter === 'unread' ? (
                <CheckCircle className="w-10 h-10 text-white" />
              ) : (
                <Bell className="w-10 h-10 text-white" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'unread' ? 'Tout est lu !' : 'Aucune notification'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'Vous avez lu toutes vos notifications'
                : 'Vous n\'avez aucune notification pour le moment'}
            </p>
            {filter === 'unread' && notifications.length > 0 && (
              <button
                onClick={() => setFilter('all')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                Voir toutes les notifications
              </button>
            )}
          </motion.div>
        )}

        {/* LIST */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filteredNotifications.map((n, index) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className={`group relative bg-white rounded-2xl shadow-md hover:shadow-xl border transition-all cursor-pointer overflow-hidden ${
                  n.read ? 'border-gray-100' : 'border-[#8a6bfe] ring-2 ring-[#8a6bfe]/20'
                }`}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.annonceId) router.push(`/jobs/${n.annonceId}`);
                }}
              >
                {/* Barre latérale colorée */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getNotificationColor(n.type)}`} />

                <div className="p-5 pl-6">
                  <div className="flex items-start gap-4">
                    {/* Icône */}
                    <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${getNotificationColor(n.type)} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {getNotificationIcon(n.type)}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className={`text-gray-800 leading-relaxed ${n.read ? 'opacity-70' : 'font-medium'}`}>
                          {n.message}
                        </p>

                        {!n.read && (
                          <span className="flex-shrink-0 bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                            Nouveau
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {n.createdAt?.seconds && (
                            <>
                              {new Date(n.createdAt.seconds * 1000).toLocaleDateString('fr-BE', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}{' '}
                              à{' '}
                              {new Date(n.createdAt.seconds * 1000).toLocaleTimeString('fr-BE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </>
                          )}
                        </p>

                        {/* Actions au hover */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(n.id);
                              }}
                              className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                              title="Marquer comme lu"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => deleteNotification(n.id, e)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Info footer */}
        {filteredNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              💡 Cliquez sur une notification pour accéder au détail
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}