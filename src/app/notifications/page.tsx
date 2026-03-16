'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection, query, where, orderBy, onSnapshot,
  updateDoc, doc, writeBatch, getDoc,
} from 'firebase/firestore';
import {
  Bell, Loader2, ArrowLeft, CheckCircle, Briefcase,
  MessageSquare, AlertCircle, CheckCheck, Trash2,
  Star, UserPlus, Euro, ChevronRight,
} from 'lucide-react';

/* ── types ── */
interface UserProfile {
  uid: string; displayName?: string;
  firstName?: string; lastName?: string; photoURL?: string;
}
interface Notification {
  id: string; message: string; annonceId?: string; chatId?: string;
  fromUser?: string; fromUserData?: UserProfile; createdAt?: any;
  read: boolean; type?: string; messagePreview?: string;
  jobTitle?: string; rating?: number;
}

/* ── profile cache ── */
const cache = new Map<string, UserProfile>();
async function fetchProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  if (cache.has(uid)) return cache.get(uid)!;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    const p: UserProfile = {
      uid,
      displayName: d.displayName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Utilisateur',
      firstName: d.firstName, lastName: d.lastName,
      photoURL: d.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.firstName || 'U')}&background=7c5fe6&color=fff`,
    };
    cache.set(uid, p);
    return p;
  } catch { return null; }
}

/* ── type config ── */
const TYPE_CFG: Record<string, { label: string; icon: React.ReactNode; dot: string; color: string; bg: string; border: string }> = {
  message:     { label: 'Message',     icon: <MessageSquare size={13} />, dot: '#7c5fe6', color: '#5b21b6', bg: '#f5f3ff', border: '#ddd6fe' },
  job:         { label: 'Annonce',     icon: <Briefcase size={13} />,     dot: '#3b82f6', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  application: { label: 'Candidature', icon: <UserPlus size={13} />,      dot: '#22c55e', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  review:      { label: 'Avis',        icon: <Star size={13} />,          dot: '#f59e0b', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  payment:     { label: 'Paiement',    icon: <Euro size={13} />,          dot: '#10b981', color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0' },
  alert:       { label: 'Alerte',      icon: <AlertCircle size={13} />,   dot: '#ef4444', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  default:     { label: 'Notification',icon: <Bell size={13} />,          dot: '#94a3b8', color: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
};

function getCfg(type?: string) { return TYPE_CFG[type ?? ''] ?? TYPE_CFG.default; }

function fmtAgo(ts: any): string {
  if (!ts?.seconds) return '';
  const diff = (Date.now() - ts.seconds * 1000) / 1000;
  if (diff < 60)   return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400)return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800)return `Il y a ${Math.floor(diff / 86400)}j`;
  return new Date(ts.seconds * 1000).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' });
}

/* ══════════════════════════════════════════════════════════ */
export default function NotificationsPage() {
  const [user, setUser]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [notifs, setNotifs]       = useState<Notification[]>([]);
  const [filter, setFilter]       = useState<'all' | 'unread' | 'messages' | 'jobs'>('all');
  const router = useRouter();

  /* auth */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (!u) router.push('/auth/login'); else setUser(u); });
    return () => unsub();
  }, [router]);

  /* load */
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      query(collection(db, 'notifications'), where('toUser', '==', user.uid), orderBy('createdAt', 'desc')),
      async snap => {
        const raw = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((n: any) => !n.deleted) as Notification[];
        const enriched = await Promise.all(raw.map(async n => {
          if (n.fromUser) {
            const ud = await fetchProfile(n.fromUser);
            return { ...n, fromUserData: ud ?? undefined };
          }
          return n;
        }));
        setNotifs(Array.from(new Map(enriched.map(n => [n.id, n])).values()));
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const markRead  = (id: string) => updateDoc(doc(db, 'notifications', id), { read: true }).catch(() => {});
  const del = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateDoc(doc(db, 'notifications', id), { deleted: true }).catch(() => {});
  };
  const markAllRead = async () => {
    const batch = writeBatch(db);
    notifs.filter(n => !n.read).forEach(n => batch.update(doc(db, 'notifications', n.id), { read: true }));
    await batch.commit().catch(() => {});
  };

  const onClick = (n: Notification) => {
    markRead(n.id);
    if (n.type === 'message' && n.chatId) router.push(`/messages?chatId=${n.chatId}`);
    else if (n.annonceId) router.push(`/jobs/${n.annonceId}`);
    else if (n.type === 'review' && n.fromUser) router.push(`/profile/${n.fromUser}`);
  };

  const filtered = notifs.filter(n => {
    if (filter === 'unread')   return !n.read;
    if (filter === 'messages') return n.type === 'message';
    if (filter === 'jobs')     return n.type === 'job' || n.type === 'application';
    return true;
  });

  const unreadCount  = notifs.filter(n => !n.read).length;
  const msgCount     = notifs.filter(n => n.type === 'message').length;
  const jobCount     = notifs.filter(n => n.type === 'job' || n.type === 'application').length;

  /* loader */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center animate-pulse">
          <Bell size={18} className="text-white" />
        </div>
        <p className="text-sm text-slate-500">Chargement…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&display=swap');`}</style>

      <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ArrowLeft size={16} />
              </Link>
              <div className="w-px h-4 bg-slate-200" />
              <h1 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Sora, system-ui' }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors">
                <CheckCheck size={14} /> Tout marquer lu
              </button>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">

          {/* ── Filters ── */}
          {notifs.length > 0 && (
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-6 w-fit flex-wrap">
              {([
                ['all',      `Toutes (${notifs.length})`],
                ['unread',   `Non lues (${unreadCount})`],
                ['messages', `Messages (${msgCount})`],
                ['jobs',     `Annonces (${jobCount})`],
              ] as const).map(([key, label]) => (
                <button key={key} onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filter === key ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* ── Empty ── */}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                {filter === 'unread' ? <CheckCircle size={20} className="text-slate-400" />
                  : filter === 'messages' ? <MessageSquare size={20} className="text-slate-400" />
                  : filter === 'jobs'     ? <Briefcase size={20} className="text-slate-400" />
                  : <Bell size={20} className="text-slate-400" />}
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {filter === 'unread' ? 'Tout est à jour' : 'Aucune notification'}
              </p>
              <p className="text-xs text-slate-400">
                {filter === 'unread' ? 'Vous avez lu toutes vos notifications.' : 'Aucune notification dans cette catégorie.'}
              </p>
              {filter !== 'all' && notifs.length > 0 && (
                <button onClick={() => setFilter('all')}
                  className="mt-4 text-xs text-violet-600 hover:underline font-semibold">
                  Voir toutes les notifications
                </button>
              )}
            </div>
          )}

          {/* ── List ── */}
          <div className="space-y-2">
            {filtered.map(n => {
              const cfg = getCfg(n.type);
              return (
                <div key={n.id}
                  onClick={() => onClick(n)}
                  className={`group relative bg-white rounded-2xl border transition-all cursor-pointer
                    hover:border-violet-200 hover:shadow-[0_4px_20px_rgba(124,95,230,0.08)]
                    ${!n.read ? 'border-violet-200' : 'border-slate-100'}`}>

                  {/* Unread dot */}
                  {!n.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-500" />
                  )}

                  <div className="flex items-start gap-4 p-4 pr-8">

                    {/* Avatar / Icon */}
                    {n.type === 'message' && n.fromUserData?.photoURL ? (
                      <div className="relative shrink-0">
                        <Image src={n.fromUserData.photoURL} alt={n.fromUserData.displayName ?? ''}
                          width={40} height={40}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center text-violet-600 bg-violet-50 border border-violet-200">
                          <MessageSquare size={9} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                        {cfg.icon}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                        <span className="text-[11px] text-slate-400">{fmtAgo(n.createdAt)}</span>
                      </div>

                      <p className={`text-sm leading-relaxed ${n.read ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>
                        {n.message}
                      </p>

                      {/* Message preview */}
                      {n.type === 'message' && (n.messagePreview || n.fromUserData) && (
                        <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                          {n.fromUserData && (
                            <p className="text-xs font-semibold text-slate-700 mb-0.5">{n.fromUserData.displayName}</p>
                          )}
                          {n.messagePreview && (
                            <p className="text-xs text-slate-500 italic line-clamp-2">"{n.messagePreview}"</p>
                          )}
                          <p className="text-xs text-violet-600 font-semibold mt-1.5 flex items-center gap-1">
                            Ouvrir la conversation <ChevronRight size={10} />
                          </p>
                        </div>
                      )}

                      {/* Job title */}
                      {(n.type === 'job' || n.type === 'application') && n.jobTitle && (
                        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-blue-700">{n.jobTitle}</p>
                          <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
                            Voir l'annonce <ChevronRight size={10} />
                          </p>
                        </div>
                      )}

                      {/* Review stars */}
                      {n.type === 'review' && n.rating && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={12}
                                className={s <= n.rating! ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">{n.rating}/5</span>
                          {n.fromUserData && (
                            <span className="text-xs text-slate-400">· par {n.fromUserData.displayName}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button onClick={e => { e.stopPropagation(); markRead(n.id); }}
                        className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors" title="Marquer comme lu">
                        <CheckCircle size={13} />
                      </button>
                    )}
                    <button onClick={e => del(n.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length > 0 && (
            <p className="text-center text-xs text-slate-400 mt-8">
              Cliquez sur une notification pour accéder au détail.
            </p>
          )}
        </div>
      </div>
    </>
  );
}