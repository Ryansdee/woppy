'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  getDoc,
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
  Star,
  UserPlus,
  DollarSign,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ------------------------------------------------------------
// TypeScript types
// ------------------------------------------------------------
interface UserProfile {
  uid: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

interface Notification {
  id: string;
  message: string;
  annonceId?: string;
  chatId?: string;
  fromUser?: string;
  fromUserData?: UserProfile;
  createdAt?: any;
  read: boolean;
  type?: 'job' | 'message' | 'system' | 'alert' | 'review' | 'application' | 'payment';
  // Champs supplémentaires pour les messages
  messagePreview?: string;
  // Champs supplémentaires pour les jobs
  jobTitle?: string;
  // Champs supplémentaires pour les reviews
  rating?: number;
}

// ------------------------------------------------------------
// Cache pour les profils utilisateurs
// ------------------------------------------------------------
const userProfileCache = new Map<string, UserProfile>();

async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;

  // Vérifier le cache
  if (userProfileCache.has(uid)) {
    return userProfileCache.get(uid)!;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const profile: UserProfile = {
        uid,
        displayName:
          data.displayName ||
          `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
          'Utilisateur',
        firstName: data.firstName,
        lastName: data.lastName,
        photoURL:
          data.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            data.firstName || 'U'
          )}&background=8a6bfe&color=fff`,
      };
      userProfileCache.set(uid, profile);
      return profile;
    }
  } catch (err) {
    console.error('Erreur fetch profil:', err);
  }

  return null;
}

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------
export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'messages' | 'jobs'>('all');
  const router = useRouter();

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // LOAD NOTIFICATIONS avec données utilisateur
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('toUser', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, async (snap) => {
      const rawList: Notification[] = snap.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        .filter((n: any) => !n.deleted) as Notification[];

      // Enrichir avec les données utilisateur pour les notifications de message
      const enrichedList = await Promise.all(
        rawList.map(async (n) => {
          if (n.fromUser) {
            const userData = await fetchUserProfile(n.fromUser);
            return { ...n, fromUserData: userData || undefined };
          }
          return n;
        })
      );

      // Dédupliquer par ID
      const uniqueNotifications = Array.from(
        new Map(enrichedList.map((n) => [n.id, n])).values()
      );

      setNotifications(uniqueNotifications);
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
      const unreadNotifs = notifications.filter((n) => !n.read);

      unreadNotifs.forEach((n) => {
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

  // Handle notification click
  function handleNotificationClick(n: Notification) {
    markAsRead(n.id);

    // Rediriger selon le type
    if (n.type === 'message' && n.chatId) {
      router.push(`/messages?chatId=${n.chatId}`);
    } else if (n.annonceId) {
      router.push(`/jobs/${n.annonceId}`);
    } else if (n.type === 'review' && n.fromUser) {
      router.push(`/profile/${n.fromUser}`);
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
      case 'review':
        return <Star className="w-5 h-5" />;
      case 'application':
        return <UserPlus className="w-5 h-5" />;
      case 'payment':
        return <DollarSign className="w-5 h-5" />;
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
      case 'review':
        return 'from-yellow-500 to-orange-500';
      case 'application':
        return 'from-green-500 to-emerald-500';
      case 'payment':
        return 'from-emerald-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  }

  // Get type label
  function getTypeLabel(type?: string) {
    switch (type) {
      case 'job':
        return 'Annonce';
      case 'message':
        return 'Message';
      case 'alert':
        return 'Alerte';
      case 'review':
        return 'Avis';
      case 'application':
        return 'Candidature';
      case 'payment':
        return 'Paiement';
      default:
        return 'Notification';
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    switch (filter) {
      case 'unread':
        return !n.read;
      case 'messages':
        return n.type === 'message';
      case 'jobs':
        return n.type === 'job' || n.type === 'application';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const messageCount = notifications.filter((n) => n.type === 'message').length;
  const jobCount = notifications.filter(
    (n) => n.type === 'job' || n.type === 'application'
  ).length;

  // Format time ago
  function formatTimeAgo(timestamp: any): string {
    if (!timestamp?.seconds) return '';

    const now = new Date();
    const date = new Date(timestamp.seconds * 1000);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin}min`;
    if (diffHour < 24) return `Il y a ${diffHour}h`;
    if (diffDay < 7) return `Il y a ${diffDay}j`;

    return date.toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'short',
    });
  }

  // ------------------------------------------------------------
  // LOADING
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <Loader2 className="animate-spin w-12 h-12 mb-4 text-[#8a6bfe]" />
        <p className="text-gray-600 font-medium">
          Chargement des notifications...
        </p>
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
                        <span className="font-semibold">{unreadCount}</span> non
                        lue
                        {unreadCount > 1 ? 's' : ''}
                      </>
                    ) : (
                      'Tout est à jour'
                    )}
                  </p>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="hidden md:flex items-center gap-3">
                {messageCount > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">{messageCount}</span>
                  </div>
                )}
                {jobCount > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">{jobCount}</span>
                  </div>
                )}
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                  >
                    <span className="text-2xl font-bold">{unreadCount}</span>
                  </motion.div>
                )}
              </div>
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
              <div className="flex flex-wrap gap-2">
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
                <button
                  onClick={() => setFilter('messages')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'messages'
                      ? 'bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages ({messageCount})
                </button>
                <button
                  onClick={() => setFilter('jobs')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'jobs'
                      ? 'bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Annonces ({jobCount})
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
              ) : filter === 'messages' ? (
                <MessageSquare className="w-10 h-10 text-white" />
              ) : filter === 'jobs' ? (
                <Briefcase className="w-10 h-10 text-white" />
              ) : (
                <Bell className="w-10 h-10 text-white" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'unread'
                ? 'Tout est lu !'
                : filter === 'messages'
                ? 'Aucun message'
                : filter === 'jobs'
                ? 'Aucune notification d\'annonce'
                : 'Aucune notification'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'Vous avez lu toutes vos notifications'
                : filter === 'messages'
                ? 'Vous n\'avez pas de notification de message'
                : filter === 'jobs'
                ? 'Vous n\'avez pas de notification d\'annonce'
                : 'Vous n\'avez aucune notification pour le moment'}
            </p>
            {filter !== 'all' && notifications.length > 0 && (
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
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className={`group relative bg-white rounded-2xl shadow-md hover:shadow-xl border transition-all cursor-pointer overflow-hidden ${
                  n.read
                    ? 'border-gray-100'
                    : 'border-[#8a6bfe] ring-2 ring-[#8a6bfe]/20'
                }`}
                onClick={() => handleNotificationClick(n)}
              >
                {/* Barre latérale colorée */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getNotificationColor(
                    n.type
                  )}`}
                />

                <div className="p-5 pl-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar ou Icône */}
                    {n.type === 'message' && n.fromUserData ? (
                      <div className="relative flex-shrink-0">
                        <Image
                          src={n.fromUserData.photoURL || ''}
                          alt={n.fromUserData.displayName || 'User'}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#8a6bfe]/30"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${getNotificationColor(
                            n.type
                          )} rounded-lg flex items-center justify-center text-white shadow-md`}
                        >
                          <MessageSquare className="w-3 h-3" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${getNotificationColor(
                          n.type
                        )} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        {getNotificationIcon(n.type)}
                      </div>
                    )}

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        {/* Type badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${getNotificationColor(
                            n.type
                          )} text-white`}
                        >
                          {getNotificationIcon(n.type)}
                          {getTypeLabel(n.type)}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Temps */}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(n.createdAt)}
                          </span>

                          {!n.read && (
                            <span className="flex-shrink-0 bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
                              Nouveau
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message principal */}
                      <p
                        className={`text-gray-800 leading-relaxed mb-2 ${
                          n.read ? 'opacity-70' : 'font-medium'
                        }`}
                      >
                        {n.message}
                      </p>

                      {/* Détails supplémentaires pour les messages */}
                      {n.type === 'message' && (
                        <div className="bg-gray-50 rounded-xl p-3 mt-2">
                          {n.fromUserData && (
                            <p className="text-sm text-gray-700 font-medium mb-1">
                              De : {n.fromUserData.displayName}
                            </p>
                          )}
                          {n.messagePreview && (
                            <p className="text-sm text-gray-600 italic line-clamp-2">
                              "{n.messagePreview}"
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-[#8a6bfe] text-sm font-medium">
                            <ExternalLink className="w-4 h-4" />
                            Ouvrir la conversation
                          </div>
                        </div>
                      )}

                      {/* Détails supplémentaires pour les jobs */}
                      {(n.type === 'job' || n.type === 'application') &&
                        n.jobTitle && (
                          <div className="bg-blue-50 rounded-xl p-3 mt-2">
                            <p className="text-sm text-blue-700 font-medium">
                              📋 {n.jobTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-blue-600 text-sm font-medium">
                              <ExternalLink className="w-4 h-4" />
                              Voir l'annonce
                            </div>
                          </div>
                        )}

                      {/* Détails supplémentaires pour les reviews */}
                      {n.type === 'review' && n.rating && (
                        <div className="bg-yellow-50 rounded-xl p-3 mt-2">
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= n.rating!
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-yellow-700 font-medium ml-2">
                              {n.rating}/5
                            </span>
                          </div>
                          {n.fromUserData && (
                            <p className="text-sm text-yellow-700">
                              Par {n.fromUserData.displayName}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Date complète + Actions */}
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          {n.createdAt?.seconds && (
                            <>
                              {new Date(
                                n.createdAt.seconds * 1000
                              ).toLocaleDateString('fr-BE', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}{' '}
                              à{' '}
                              {new Date(
                                n.createdAt.seconds * 1000
                              ).toLocaleTimeString('fr-BE', {
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