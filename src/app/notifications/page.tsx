'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection, query, where, orderBy, onSnapshot,
  updateDoc, doc, writeBatch, getDoc, Timestamp,
} from 'firebase/firestore';
import {
  AlertCircle, Bell, Briefcase, CheckCheck, Euro, MessageSquare, Star, Trash2,
  type LucideIcon,
} from 'lucide-react';
import { Avatar, Badge, EmptyState, Loading, Page, PageHeader, Tabs } from '@/components/ui';

interface Sender { name: string; photoURL?: string }
interface Notification {
  id: string; message: string; annonceId?: string; chatId?: string;
  fromUser?: string; sender?: Sender; createdAt?: Timestamp;
  read: boolean; type?: string; messagePreview?: string; deleted?: boolean;
}

/* Profils des expéditeurs, partagés entre les rendus */
const senders = new Map<string, Sender | null>();
async function fetchSender(uid: string): Promise<Sender | null> {
  if (senders.has(uid)) return senders.get(uid)!;
  try {
    const d = (await getDoc(doc(db, 'users', uid))).data();
    const s = d ? { name: d.displayName || [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Utilisateur', photoURL: d.photoURL } : null;
    senders.set(uid, s);
    return s;
  } catch {
    return null;
  }
}

/* Types réellement écrits dans la base, regroupés par catégorie */
type Category = 'message' | 'mission' | 'review' | 'payment' | 'alert' | 'other';
const CATEGORY_OF: Record<string, Category> = {
  message: 'message',
  job: 'mission',
  application: 'mission',
  nouvelle_candidature: 'mission',
  acceptation: 'mission',
  review: 'review',
  payment: 'payment',
  alert: 'alert',
};
const CATEGORY: Record<Category, { label: string; icon: LucideIcon; tone: 'brand' | 'info' | 'warning' | 'success' | 'danger' | 'neutral' }> = {
  message: { label: 'Message', icon: MessageSquare, tone: 'brand' },
  mission: { label: 'Mission', icon: Briefcase, tone: 'info' },
  review: { label: 'Avis', icon: Star, tone: 'warning' },
  payment: { label: 'Paiement', icon: Euro, tone: 'success' },
  alert: { label: 'Alerte', icon: AlertCircle, tone: 'danger' },
  other: { label: 'Notification', icon: Bell, tone: 'neutral' },
};
const categoryOf = (n: Notification): Category => CATEGORY_OF[n.type ?? ''] ?? 'other';

function timeAgo(ts?: Timestamp): string {
  if (!ts?.seconds) return '';
  const diff = Date.now() / 1000 - ts.seconds;
  if (diff < 60) return 'à l’instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return new Date(ts.seconds * 1000).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' });
}

type Filter = 'all' | 'unread' | 'message' | 'mission';

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notifs, setNotifs] = useState<Notification[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => onAuthStateChanged(auth, (u) => (u ? setUser(u) : router.push('/auth/login'))), [router]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(collection(db, 'notifications'), where('toUser', '==', user.uid), orderBy('createdAt', 'desc')),
      async (snap) => {
        const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Notification).filter((n) => !n.deleted);
        const withSender = await Promise.all(
          raw.map(async (n) => (n.fromUser ? { ...n, sender: (await fetchSender(n.fromUser)) ?? undefined } : n))
        );
        setNotifs(withSender);
      },
      () => setNotifs([])
    );
  }, [user]);

  const markRead = (id: string) => updateDoc(doc(db, 'notifications', id), { read: true }).catch(() => {});
  const remove = (id: string) => updateDoc(doc(db, 'notifications', id), { deleted: true }).catch(() => {});
  const markAllRead = async () => {
    const batch = writeBatch(db);
    (notifs ?? []).filter((n) => !n.read).forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
    await batch.commit().catch(() => {});
  };

  const open = (n: Notification) => {
    markRead(n.id);
    if (n.chatId) router.push(`/messages?chatId=${n.chatId}`);
    else if (n.annonceId) router.push(`/jobs/${n.annonceId}`);
    else if (n.type === 'review' && n.fromUser) router.push(`/profile/${n.fromUser}`);
  };

  if (!notifs) return <Loading full />;

  const unread = notifs.filter((n) => !n.read).length;
  const count = (f: Filter) =>
    f === 'all' ? notifs.length : f === 'unread' ? unread : notifs.filter((n) => categoryOf(n) === f).length;
  const shown = notifs.filter((n) => (filter === 'all' ? true : filter === 'unread' ? !n.read : categoryOf(n) === filter));

  return (
    <Page narrow>
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est lu.'}
        actions={
          unread > 0 && (
            <button onClick={markAllRead} className="btn btn-outline">
              <CheckCheck size={15} /> Tout marquer comme lu
            </button>
          )
        }
      />

      <Tabs
        value={filter}
        onChange={setFilter}
        items={[
          { value: 'all', label: 'Toutes', count: count('all') },
          { value: 'unread', label: 'Non lues', count: count('unread') },
          { value: 'message', label: 'Messages', count: count('message') },
          { value: 'mission', label: 'Missions', count: count('mission') },
        ]}
      />

      <div className="card mt-6 divide-y divide-line overflow-hidden">
        {shown.length === 0 ? (
          <EmptyState icon={Bell} title="Aucune notification" description="Vous serez prévenu ici des messages et des candidatures." />
        ) : (
          shown.map((n) => {
            const cat = CATEGORY[categoryOf(n)];
            const Icon = cat.icon;
            return (
              <div key={n.id} className={`group flex gap-3 px-4 py-4 sm:px-5 ${n.read ? '' : 'bg-brand-soft/40'}`}>
                {n.sender ? (
                  <Avatar name={n.sender.name} src={n.sender.photoURL} size={36} />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper-2 text-muted">
                    <Icon size={16} />
                  </span>
                )}
                <button onClick={() => open(n)} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={cat.tone}>{cat.label}</Badge>
                    <span className="text-xs text-muted">{timeAgo(n.createdAt)}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-brand" aria-label="Non lue" />}
                  </div>
                  <p className={`mt-1.5 text-sm ${n.read ? 'text-ink-2' : 'font-medium'}`}>
                    {n.sender && <span className="font-medium">{n.sender.name} · </span>}
                    {n.message}
                  </p>
                  {n.messagePreview && <p className="mt-1 truncate text-sm text-muted">« {n.messagePreview} »</p>}
                </button>
                <button
                  onClick={() => remove(n.id)}
                  aria-label="Supprimer la notification"
                  className="btn btn-ghost btn-sm self-start opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </Page>
  );
}
