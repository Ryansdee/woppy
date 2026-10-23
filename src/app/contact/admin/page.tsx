'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  collection, getDocs, updateDoc, doc,
  orderBy, query, serverTimestamp, arrayUnion, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ArrowLeft, ExternalLink, Inbox, Loader2, Mail, RefreshCw,
  Search, Send, ShieldCheck, Tag, User, X,
} from 'lucide-react';
import StaffShell from '@/components/staff/StaffShell';

/* ─── Types ─── */
type ReplyEntry = { author: 'user' | 'support'; name: string; message: string; createdAt: string };
type Status = 'open' | 'in_progress' | 'resolved' | 'closed';
type Contact = {
  id: string; ticketId: string; name: string; email: string;
  subject?: string; category?: string; message: string;
  status: Status; answered: boolean; replies: ReplyEntry[];
  createdAt?: Timestamp; updatedAt?: Timestamp;
};
type Filter = 'all' | 'open' | 'in_progress' | 'resolved';

/* ─── Constantes ─── */
const CAT: Record<string, string> = {
  question: 'Question', bug: 'Bug', account: 'Compte',
  payment: 'Paiement', mission: 'Mission', other: 'Autre',
};

const STATUS_META: Record<Status, { label: string; pill: string; dot: string }> = {
  open: { label: 'Ouvert', pill: 'border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  in_progress: { label: 'En cours', pill: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  resolved: { label: 'Résolu', pill: 'border-green-200 bg-green-50 text-green-700', dot: 'bg-green-500' },
  closed: { label: 'Fermé', pill: 'border-line bg-paper-2 text-muted', dot: 'bg-muted' },
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'open', label: 'Ouverts' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'resolved', label: 'Résolus' },
];

const SUPPORT_NAME = 'Woppy Support';
const REFRESH_INTERVAL = 60_000;

/* ─── Helpers ─── */
function timeAgo(ts?: Timestamp) {
  if (!ts) return '—';
  const m = Math.floor((Date.now() - ts.toDate().getTime()) / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return 'à l’instant';
  if (m < 60) return `il y a ${m} min`;
  if (h < 24) return `il y a ${h} h`;
  if (d < 7) return `il y a ${d} j`;
  return ts.toDate().toLocaleDateString('fr-BE', { day: '2-digit', month: 'short' });
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('fr-BE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/* Les anciens tickets n'ont pas toujours tous les champs : on garantit des valeurs sûres */
const isTimestamp = (v: unknown): v is Timestamp =>
  typeof v === 'object' && v !== null && typeof (v as Timestamp).toDate === 'function';

function normalizeContact(id: string, data: Record<string, unknown>): Contact {
  const status = typeof data.status === 'string' && data.status in STATUS_META ? (data.status as Status) : 'open';
  return {
    ...(data as Omit<Contact, 'id'>),
    id,
    ticketId: typeof data.ticketId === 'string' ? data.ticketId : '',
    name: typeof data.name === 'string' && data.name ? data.name : typeof data.email === 'string' ? data.email : 'Utilisateur',
    email: typeof data.email === 'string' ? data.email : '',
    message: typeof data.message === 'string' ? data.message : '',
    status,
    answered: Boolean(data.answered),
    replies: Array.isArray(data.replies) ? (data.replies as ReplyEntry[]) : [],
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : undefined,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : undefined,
  };
}

/* ─── Page ─── */
export default function ContactAdminPage() {
  return (
    <StaffShell title="Support" description="Tickets envoyés depuis la page contact.">
      {() => <Tickets />}
    </StaffShell>
  );
}

function Tickets() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState<string | null>(null);

  const fetchContacts = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const snap = await getDocs(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')));
      setContacts(snap.docs.map((d) => normalizeContact(d.id, d.data())));
      setLastRefresh(new Date());
      setError('');
    } catch {
      setError('Impossible de charger les tickets.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* Chargement initial puis actualisation automatique */
  useEffect(() => {
    const first = setTimeout(() => fetchContacts(), 0);
    const every = setInterval(() => fetchContacts(true), REFRESH_INTERVAL);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, [fetchContacts]);

  async function changeStatus(id: string, status: Status) {
    setStatusSaving(id);
    try {
      const answered = status === 'resolved' || status === 'closed';
      await updateDoc(doc(db, 'contacts', id), { status, answered, updatedAt: serverTimestamp() });
      setContacts((p) => p.map((c) => (c.id === id ? { ...c, status, answered } : c)));
    } catch {
      setError('Le statut n’a pas pu être enregistré.');
    } finally {
      setStatusSaving(null);
    }
  }

  async function sendReply(contact: Contact) {
    const text = answers[contact.id]?.trim();
    if (!text) return;
    setSending(contact.id);
    try {
      const reply: ReplyEntry = { author: 'support', name: SUPPORT_NAME, message: text, createdAt: new Date().toISOString() };
      await updateDoc(doc(db, 'contacts', contact.id), {
        replies: arrayUnion(reply), answered: true, status: 'in_progress', updatedAt: serverTimestamp(),
      });
      setAnswers((p) => {
        const next = { ...p };
        delete next[contact.id];
        return next;
      });
      setContacts((p) => p.map((c) => (c.id === contact.id ? { ...c, replies: [...c.replies, reply], answered: true, status: 'in_progress' } : c)));
    } catch {
      setError('La réponse n’a pas pu être envoyée.');
    } finally {
      setSending(null);
    }
  }

  const q = search.toLowerCase();
  const filtered = contacts.filter((c) => {
    const matchSearch = !q || [c.name, c.email, c.message, c.subject ?? '', c.ticketId].some((s) => s.toLowerCase().includes(q));
    const matchFilter =
      filter === 'all' || c.status === filter || (filter === 'resolved' && c.status === 'closed');
    return matchSearch && matchFilter;
  });

  const count = (f: Filter) =>
    f === 'all' ? contacts.length : contacts.filter((c) => c.status === f || (f === 'resolved' && c.status === 'closed')).length;

  const current = selected ? contacts.find((c) => c.id === selected) ?? null : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`btn ${filter === f.key ? 'btn-primary' : 'btn-outline'}`}
            >
              {f.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${filter === f.key ? 'bg-paper/15' : 'bg-paper-2'}`}>{count(f.key)}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          {lastRefresh && <span>Mis à jour à {lastRefresh.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}</span>}
          <button onClick={() => fetchContacts(true)} disabled={refreshing} className="btn btn-outline">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* ── Liste (masquée sur mobile quand un ticket est ouvert) ── */}
        <div className={`flex flex-col gap-3 ${current ? 'hidden lg:flex' : ''}`}>
          <label className="relative block">
            <span className="sr-only">Rechercher un ticket</span>
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, email, n° de ticket…"
              className="input pl-10 pr-10"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                <X size={15} />
              </button>
            )}
          </label>

          <div className="card max-h-[70vh] divide-y divide-line overflow-y-auto">
            {loading && (
              <p className="flex items-center gap-2 p-6 text-sm text-muted">
                <Loader2 size={16} className="animate-spin" /> Chargement…
              </p>
            )}
            {!loading && filtered.length === 0 && <p className="p-6 text-center text-sm text-muted">Aucun ticket.</p>}
            {filtered.map((c) => {
              const meta = STATUS_META[c.status];
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`block w-full p-4 text-left transition-colors hover:bg-paper ${selected === c.id ? 'bg-brand-soft/60' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                      <span className="truncate font-semibold">{c.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{timeAgo(c.createdAt)}</span>
                  </div>
                  {c.subject && <p className="mt-1 truncate text-sm text-ink-2">{c.subject}</p>}
                  <p className="mt-0.5 truncate text-xs text-muted">{c.message}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className={`rounded-full border px-2 py-0.5 font-medium ${meta.pill}`}>{meta.label}</span>
                    {c.ticketId && <span className="font-mono text-muted">{c.ticketId}</span>}
                    {c.replies.length > 0 && <span className="text-muted">{c.replies.length} réponse{c.replies.length > 1 ? 's' : ''}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Détail ── */}
        <div className={`card flex min-h-[60vh] flex-col overflow-hidden ${current ? '' : 'hidden lg:flex'}`}>
          {!current ? (
            <div className="grid flex-1 place-items-center p-10 text-center text-muted">
              <div>
                <Inbox size={28} className="mx-auto" />
                <p className="mt-3 text-sm">Sélectionnez un ticket.</p>
              </div>
            </div>
          ) : (
            <>
              <header className="border-b border-line p-5">
                <button onClick={() => setSelected(null)} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink lg:hidden">
                  <ArrowLeft size={14} /> Tous les tickets
                </button>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="sr-only" htmlFor="ticket-status">Statut</label>
                      <select
                        id="ticket-status"
                        value={current.status}
                        onChange={(e) => changeStatus(current.id, e.target.value as Status)}
                        disabled={statusSaving === current.id}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_META[current.status].pill}`}
                      >
                        {(Object.keys(STATUS_META) as Status[]).map((s) => (
                          <option key={s} value={s}>{STATUS_META[s].label}</option>
                        ))}
                      </select>
                      {current.category && (
                        <span className="chip"><Tag size={11} /> {CAT[current.category] ?? current.category}</span>
                      )}
                      {current.ticketId && <span className="font-mono text-xs text-muted">#{current.ticketId}</span>}
                    </div>
                    <h2 className="mt-3 font-display text-xl font-semibold leading-snug">
                      {current.subject || `${current.message.slice(0, 70)}${current.message.length > 70 ? '…' : ''}`}
                    </h2>
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                      <span className="inline-flex items-center gap-1.5"><User size={13} /> {current.name}</span>
                      {current.email && (
                        <a href={`mailto:${current.email}`} className="inline-flex items-center gap-1.5 hover:text-ink">
                          <Mail size={13} /> {current.email}
                        </a>
                      )}
                      <span>{timeAgo(current.createdAt)}</span>
                    </p>
                  </div>
                  <Link
                    href={`/contact/support/${current.id}`}
                    target="_blank"
                    title="Voir comme l’utilisateur"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted hover:border-ink hover:text-ink"
                  >
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <Bubble author={current.name} date={timeAgo(current.createdAt)} text={current.message} />
                {current.replies.map((r, i) => (
                  <Bubble
                    key={i}
                    support={r.author === 'support'}
                    author={r.author === 'support' ? SUPPORT_NAME : r.name}
                    date={fmtDateTime(r.createdAt)}
                    text={r.message}
                  />
                ))}
              </div>

              <footer className="border-t border-line p-5">
                <label htmlFor="reply" className="label">Répondre en tant que {SUPPORT_NAME}</label>
                <textarea
                  id="reply"
                  value={answers[current.id] ?? ''}
                  onChange={(e) => setAnswers((p) => ({ ...p, [current.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply(current);
                  }}
                  rows={3}
                  placeholder="Votre réponse…"
                  className="input resize-none"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted">Ctrl + Entrée pour envoyer · le ticket passe « En cours »</span>
                  <button
                    onClick={() => sendReply(current)}
                    disabled={!answers[current.id]?.trim() || sending === current.id}
                    className="btn btn-primary"
                  >
                    {sending === current.id ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Envoyer
                  </button>
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Bubble({ author, date, text, support }: { author: string; date: string; text: string; support?: boolean }) {
  return (
    <div className={`flex gap-3 ${support ? 'flex-row-reverse' : ''}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${support ? 'bg-ink text-paper' : 'bg-paper-2 text-muted'}`}>
        {support ? <ShieldCheck size={14} /> : <User size={14} />}
      </span>
      <div className={`flex max-w-[80%] flex-col gap-1 ${support ? 'items-end' : 'items-start'}`}>
        <p className="text-xs text-muted">
          <span className="font-semibold text-ink-2">{author}</span> · {date}
        </p>
        <p
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            support ? 'rounded-tr-sm bg-ink text-paper' : 'rounded-tl-sm bg-paper-2 text-ink-2'
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
