'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  collection, getDocs, updateDoc, doc,
  orderBy, query, serverTimestamp, arrayUnion, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, User, MessageSquare, CheckCircle2, Search, X,
  Send, AlertCircle, ShieldCheck, Tag, ExternalLink,
  ChevronDown, RefreshCw, Circle, Inbox, BarChart2, Zap,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Fonts ──────────────────────────────────────────────── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
`;

/* ─── Types ──────────────────────────────────────────────── */
type ReplyEntry = {
  author: 'user' | 'support';
  name: string;
  message: string;
  createdAt: string;
};
type Status = 'open' | 'in_progress' | 'resolved' | 'closed';
type Contact = {
  id: string; ticketId: string; name: string; email: string;
  subject?: string; category?: string; message: string;
  status: Status; priority: 'low' | 'normal' | 'high' | 'urgent';
  answered: boolean; replies: ReplyEntry[];
  createdAt?: Timestamp; updatedAt?: Timestamp;
};
type Filter = 'all' | 'open' | 'in_progress' | 'resolved';

/* ─── Constantes ─────────────────────────────────────────── */
const CAT: Record<string, string> = {
  question: 'Question', bug: 'Bug', account: 'Compte',
  payment: 'Paiement', mission: 'Mission', other: 'Autre',
};

const STATUS_META: Record<string, {
  label: string;
  dot: string;
  pill: string;
  selectColor: string;
}> = {
  open:        { label: 'Ouvert',   dot: '#3b82f6', pill: 'bg-blue-50 text-blue-700 border-blue-200',     selectColor: '#1d4ed8' },
  in_progress: { label: 'En cours', dot: '#f59e0b', pill: 'bg-amber-50 text-amber-700 border-amber-200',   selectColor: '#b45309' },
  resolved:    { label: 'Résolu',   dot: '#10b981', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', selectColor: '#047857' },
  closed:      { label: 'Fermé',    dot: '#9ca3af', pill: 'bg-slate-100 text-slate-500 border-slate-200',  selectColor: '#6b7280' },
};

const SUPPORT_NAME = 'Woppy Support';
const REFRESH_INTERVAL = 60_000;

/* ─── Helpers ────────────────────────────────────────────── */
function timeAgo(ts?: Timestamp) {
  if (!ts) return '—';
  const diff = Date.now() - ts.toDate().getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d < 7)  return `${d}j`;
  return ts.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

/* ─── Page ───────────────────────────────────────────────── */
export default function ContactAdminPage() {
  const [contacts, setContacts]         = useState<Contact[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastRefresh, setLastRefresh]   = useState<Date | null>(null);
  const [countdown, setCountdown]       = useState(REFRESH_INTERVAL / 1000);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState<Filter>('all');
  const [selected, setSelected]         = useState<string | null>(null);
  const [answers, setAnswers]           = useState<Record<string, string>>({});
  const [sending, setSending]           = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState<string | null>(null);
  const intervalRef                     = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef                    = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Fetch ── */
  const fetchContacts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setContacts(snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Contact, 'id'>),
        replies: (d.data().replies as ReplyEntry[]) ?? [],
      })));
      setLastRefresh(new Date());
      setCountdown(REFRESH_INTERVAL / 1000);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchContacts();
    intervalRef.current  = setInterval(() => fetchContacts(true), REFRESH_INTERVAL);
    countdownRef.current = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : REFRESH_INTERVAL / 1000)), 1000);
    return () => {
      if (intervalRef.current)  clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchContacts]);

  /* ── Status ── */
  async function changeStatus(id: string, status: string) {
    setStatusSaving(id);
    try {
      await updateDoc(doc(db, 'contacts', id), {
        status,
        answered: status === 'resolved' || status === 'closed',
        updatedAt: serverTimestamp(),
      });
      setContacts(p => p.map(c => c.id === id
        ? { ...c, status: status as Status, answered: status === 'resolved' || status === 'closed' }
        : c));
    } finally { setStatusSaving(null); }
  }

  /* ── Reply ── */
  async function sendReply(contact: Contact) {
    const text = answers[contact.id]?.trim();
    if (!text) return;
    setSending(contact.id);
    try {
      const reply: ReplyEntry = {
        author: 'support', name: SUPPORT_NAME,
        message: text, createdAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, 'contacts', contact.id), {
        replies: arrayUnion(reply), answered: true,
        status: 'in_progress', updatedAt: serverTimestamp(),
      });
      setAnswers(p => { const c = { ...p }; delete c[contact.id]; return c; });
      setContacts(p => p.map(c => c.id === contact.id
        ? { ...c, replies: [...c.replies, reply], answered: true, status: 'in_progress' }
        : c));
    } finally { setSending(null); }
  }

  /* ── Derived ── */
  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchS = !q || [c.name, c.email, c.message, c.subject ?? '', c.ticketId ?? '']
      .some(s => s.toLowerCase().includes(q));
    const matchF = filter === 'all' || c.status === filter;
    return matchS && matchF;
  });

  const stats = {
    total:       contacts.length,
    open:        contacts.filter(c => c.status === 'open').length,
    in_progress: contacts.filter(c => c.status === 'in_progress').length,
    resolved:    contacts.filter(c => c.status === 'resolved' || c.status === 'closed').length,
  };

  const selectedContact = selected ? contacts.find(c => c.id === selected) ?? null : null;

  /* ── Render ── */
  return (
    <>
      <style>{FONTS}</style>
      <style>{`
        * { font-family: 'DM Sans', system-ui, sans-serif; box-sizing: border-box; }
        .mono { font-family: 'DM Mono', monospace !important; }
        body { background: #f5f4f1 !important; margin: 0; }
        .ticket-row { transition: background 0.12s; }
        .ticket-row:hover { background: #f8f8f6 !important; }
        .pulse-blue { animation: pb 2.2s ease-in-out infinite; }
        @keyframes pb { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.85)} }
        .ring { transition: stroke-dashoffset 1s linear; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e0db; border-radius: 4px; }
        .status-select option { background: white; color: #1e293b; }
        input::placeholder, textarea::placeholder { color: #b0aea8; }
      `}</style>

      <div style={{ background: '#f5f4f1', minHeight: '100vh', color: '#1e1e26' }}>

        {/* ── Topbar ── */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e8e6e1', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Inbox style={{ width: 14, height: 14, color: 'white' }} />
              </div>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#1e1e26' }}>Support · Tickets</span>
              {stats.open > 0 && (
                <span className="mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                  {stats.open} ouvert{stats.open > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Ring countdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="10" cy="10" r="8" fill="none" stroke="#e8e6e1" strokeWidth="2" />
                  <circle cx="10" cy="10" r="8" fill="none" stroke="#6366f1" strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 8}`}
                    strokeDashoffset={`${2 * Math.PI * 8 * (1 - countdown / (REFRESH_INTERVAL / 1000))}`}
                    strokeLinecap="round" className="ring" />
                </svg>
                <span className="mono" style={{ fontSize: 11 }}>{countdown}s</span>
              </div>

              <button
                onClick={() => { fetchContacts(true); setCountdown(REFRESH_INTERVAL / 1000); }}
                disabled={refreshing}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#f5f4f1', border: '1px solid #e2e0db', fontSize: 12, fontWeight: 500, color: refreshing ? '#c0bdb8' : '#4b4b58', cursor: refreshing ? 'not-allowed' : 'pointer' }}>
                <RefreshCw style={{ width: 13, height: 13 }} className={refreshing ? 'animate-spin' : ''} />
                Actualiser
              </button>

              {lastRefresh && (
                <span className="mono" style={{ fontSize: 11, color: '#b0aea8' }}>
                  Sync {lastRefresh.toLocaleTimeString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px 24px' }}>

          {/* ── Stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total',    value: stats.total,       color: '#6366f1', bg: '#eef2ff', icon: <BarChart2 style={{ width: 15, height: 15 }} /> },
              { label: 'Ouverts',  value: stats.open,        color: '#2563eb', bg: '#eff6ff', icon: <Circle style={{ width: 15, height: 15 }} /> },
              { label: 'En cours', value: stats.in_progress, color: '#d97706', bg: '#fffbeb', icon: <Zap style={{ width: 15, height: 15 }} /> },
              { label: 'Résolus',  value: stats.resolved,    color: '#059669', bg: '#ecfdf5', icon: <CheckCircle2 style={{ width: 15, height: 15 }} /> },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ background: '#ffffff', border: '1px solid #e8e6e1', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <p className="mono" style={{ fontSize: '1.5rem', lineHeight: 1, fontWeight: 500, color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3, color: '#9ca3af' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Main layout ── */}
          <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 210px)' }}>

            {/* LEFT – list */}
            <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Search + filter */}
              <div style={{ background: '#ffffff', border: '1px solid #e8e6e1', borderRadius: 12, padding: 12 }}>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#b0aea8' }} />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Nom, email, ticket…"
                    style={{ width: '100%', paddingLeft: 32, paddingRight: 32, paddingTop: 7, paddingBottom: 7, background: '#f9f8f6', border: '1px solid #e8e6e1', borderRadius: 8, fontSize: 13, color: '#1e1e26', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e8e6e1'}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#b0aea8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <X style={{ width: 13, height: 13 }} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['all', 'open', 'in_progress', 'resolved'] as Filter[]).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      style={{
                        flex: 1, padding: '5px 2px', borderRadius: 7, fontSize: 10, fontWeight: 500,
                        background: filter === f ? '#6366f1' : '#f5f4f1',
                        color: filter === f ? '#ffffff' : '#9ca3af',
                        border: `1px solid ${filter === f ? '#6366f1' : '#e8e6e1'}`,
                        cursor: 'pointer', transition: 'all 0.12s',
                      }}>
                      {f === 'all' ? 'Tous' : f === 'open' ? 'Ouverts' : f === 'in_progress' ? 'En cours' : 'Résolus'}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mono" style={{ fontSize: 10, color: '#b0aea8', paddingLeft: 2 }}>
                {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
              </p>

              {/* Ticket list */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <div style={{ width: 28, height: 28, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#c0bdb8' }}>
                    <AlertCircle style={{ width: 24, height: 24, margin: '0 auto 10px', opacity: 0.5 }} />
                    <p style={{ fontSize: 13 }}>Aucun ticket</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <AnimatePresence>
                      {filtered.map((c, i) => {
                        const meta = STATUS_META[c.status] ?? STATUS_META.open;
                        const isActive = selected === c.id;
                        return (
                          <motion.button key={c.id} onClick={() => setSelected(c.id)}
                            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="ticket-row"
                            style={{
                              width: '100%', textAlign: 'left', borderRadius: 10, padding: '11px 12px',
                              background: isActive ? '#ffffff' : '#ffffff',
                              border: `1px solid ${isActive ? '#6366f1' : '#e8e6e1'}`,
                              boxShadow: isActive ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
                              cursor: 'pointer',
                            }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <span style={{
                                marginTop: 5, width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                                background: meta.dot,
                                ...(c.status === 'open' ? { animation: 'pb 2.2s ease-in-out infinite' } : {}),
                              }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1e1e26', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                                  <span className="mono" style={{ fontSize: 10, color: '#b0aea8', flexShrink: 0 }}>{timeAgo(c.createdAt)}</span>
                                </div>
                                {c.subject && (
                                  <p style={{ fontSize: 12, color: '#6b6b7a', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</p>
                                )}
                                <p style={{ fontSize: 11, color: '#b0aea8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{c.message}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span className={`mono`} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, border: '1px solid', fontWeight: 500 }}
                                    data-status={c.status}>
                                    {/* Inline pill style matching meta */}
                                    {meta.label}
                                  </span>
                                  {c.ticketId && (
                                    <span className="mono" style={{ fontSize: 9, color: '#000000' }}>{c.ticketId}</span>
                                  )}
                                  {c.replies.length > 0 && (
                                    <span style={{ fontSize: 10, color: '#c0bdb8', display: 'flex', alignItems: 'center', gap: 3 }}>
                                      <MessageSquare style={{ width: 10, height: 10 }} />{c.replies.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT – detail */}
            <div style={{ flex: 1, minWidth: 0, borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff', border: '1px solid #e8e6e1' }}>

              {!selectedContact ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#d1cfc9' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f9f8f6', border: '1px solid #e8e6e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Inbox style={{ width: 22, height: 22, color: '#c8c5bf' }} />
                  </div>
                  <p style={{ fontWeight: 500, fontSize: 13, color: '#b0aea8' }}>Sélectionnez un ticket</p>
                  <p className="mono" style={{ fontSize: 11, color: '#d1cfc9' }}>{filtered.length} disponible{filtered.length !== 1 ? 's' : ''}</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ede8', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          {/* Status select */}
                          <div style={{ position: 'relative' }}>
                            <select
                              value={selectedContact.status}
                              onChange={e => changeStatus(selectedContact.id, e.target.value)}
                              disabled={statusSaving === selectedContact.id}
                              className="status-select mono"
                              style={{
                                fontSize: 10, padding: '3px 20px 3px 8px', borderRadius: 6,
                                border: '1px solid', cursor: 'pointer', outline: 'none', appearance: 'none',
                                fontWeight: 600, background: 'transparent',
                                ...((() => {
                                  const m = STATUS_META[selectedContact.status];
                                  return { color: m.selectColor, borderColor: m.selectColor + '40' };
                                })()),
                              }}>
                              <option value="open">Ouvert</option>
                              <option value="in_progress">En cours</option>
                              <option value="resolved">Résolu</option>
                              <option value="closed">Fermé</option>
                            </select>
                            <ChevronDown style={{ width: 10, height: 10, position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                          </div>

                          {selectedContact.category && (
                            <span className="mono" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: '#f5f4f1', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Tag style={{ width: 10, height: 10 }} />{CAT[selectedContact.category] ?? selectedContact.category}
                            </span>
                          )}
                          {selectedContact.ticketId && (
                            <span className="mono" style={{ fontSize: 10, color: '#c0bdb8' }}>#{selectedContact.ticketId}</span>
                          )}
                        </div>

                        <h2 style={{ fontWeight: 600, fontSize: 15, color: '#1e1e26', lineHeight: 1.3, marginBottom: 8 }}>
                          {selectedContact.subject || selectedContact.message.slice(0, 70) + '…'}
                        </h2>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 20px' }}>
                          <span style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <User style={{ width: 11, height: 11 }} />{selectedContact.name}
                          </span>
                          <a href={`mailto:${selectedContact.email}`} className="mono"
                            style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#6366f1')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>
                            <Mail style={{ width: 11, height: 11 }} />{selectedContact.email}
                          </a>
                          <span className="mono" style={{ fontSize: 11, color: '#c0bdb8' }}>{timeAgo(selectedContact.createdAt)}</span>
                        </div>
                      </div>

                      <Link href={`/contact/support/${selectedContact.id}`} target="_blank"
                        style={{ padding: 7, borderRadius: 8, background: '#f5f4f1', border: '1px solid #e8e6e1', color: '#b0aea8', textDecoration: 'none', flexShrink: 0 }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#6366f1')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#b0aea8')}
                        title="Vue utilisateur">
                        <ExternalLink style={{ width: 13, height: 13 }} />
                      </Link>
                    </div>
                  </div>

                  {/* Messages — overflow scroll, NO auto-scroll */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Message initial */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: '#f5f4f1', border: '1px solid #e8e6e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User style={{ width: 13, height: 13, color: '#9ca3af' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 12, color: '#4b4b58' }}>{selectedContact.name}</span>
                          <span className="mono" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#f5f4f1', color: '#b0aea8' }}>initial</span>
                          <span className="mono" style={{ fontSize: 10, color: '#c0bdb8' }}>{timeAgo(selectedContact.createdAt)}</span>
                        </div>
                        <div style={{ borderRadius: '10px 10px 10px 2px', padding: '10px 14px', background: '#f9f8f6', border: '1px solid #ece9e4', fontSize: 13, color: '#4b4b58', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {selectedContact.message}
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {selectedContact.replies.map((r, i) => {
                      const isSupport = r.author === 'support';
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          style={{ display: 'flex', gap: 10, flexDirection: isSupport ? 'row-reverse' : 'row' }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isSupport ? '#6366f1' : '#f5f4f1',
                            border: isSupport ? 'none' : '1px solid #e8e6e1',
                          }}>
                            {isSupport
                              ? <ShieldCheck style={{ width: 13, height: 13, color: 'white' }} />
                              : <User style={{ width: 13, height: 13, color: '#9ca3af' }} />}
                          </div>
                          <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 5, alignItems: isSupport ? 'flex-end' : 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isSupport ? 'row-reverse' : 'row' }}>
                              <span style={{ fontWeight: 600, fontSize: 12, color: isSupport ? '#6366f1' : '#4b4b58' }}>
                                {isSupport ? SUPPORT_NAME : r.name}
                              </span>
                              <span className="mono" style={{ fontSize: 10, color: '#c0bdb8' }}>{fmtDateTime(r.createdAt)}</span>
                            </div>
                            <div style={{
                              padding: '10px 14px', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                              borderRadius: isSupport ? '10px 2px 10px 10px' : '2px 10px 10px 10px',
                              background: isSupport ? '#6366f1' : '#f9f8f6',
                              color: isSupport ? '#ffffff' : '#4b4b58',
                              border: isSupport ? 'none' : '1px solid #ece9e4',
                            }}>
                              {r.message}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Reply box */}
                  <div style={{ padding: '14px 20px', borderTop: '1px solid #f0ede8', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck style={{ width: 11, height: 11, color: 'white' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1' }}>{SUPPORT_NAME}</span>
                      <span className="mono" style={{ fontSize: 10, color: '#c0bdb8', marginLeft: 'auto' }}>
                        {(answers[selectedContact.id] ?? '').length} car. · ⌘↵ envoyer
                      </span>
                    </div>
                    <textarea
                      value={answers[selectedContact.id] ?? ''}
                      onChange={e => setAnswers(p => ({ ...p, [selectedContact.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply(selectedContact); }}
                      rows={3}
                      placeholder="Rédigez votre réponse…"
                      style={{ width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 13, background: '#f9f8f6', border: '1px solid #e8e6e1', color: '#1e1e26', outline: 'none', resize: 'none', lineHeight: 1.5 }}
                      onFocus={e => (e.target.style.borderColor = '#6366f1')}
                      onBlur={e => (e.target.style.borderColor = '#e8e6e1')}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 10 }}>
                      <a href={`mailto:${selectedContact.email}`}
                        style={{ fontSize: 12, color: '#b0aea8', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#6366f1')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#b0aea8')}>
                        <Mail style={{ width: 13, height: 13 }} /> Email direct
                      </a>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => sendReply(selectedContact)}
                        disabled={!answers[selectedContact.id]?.trim() || sending === selectedContact.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10,
                          fontSize: 13, fontWeight: 600, border: 'none', cursor: answers[selectedContact.id]?.trim() ? 'pointer' : 'not-allowed',
                          background: answers[selectedContact.id]?.trim() ? '#6366f1' : '#f0ede8',
                          color: answers[selectedContact.id]?.trim() ? '#ffffff' : '#c0bdb8',
                          transition: 'all 0.12s',
                        }}>
                        {sending === selectedContact.id
                          ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} className="animate-spin" /> Envoi…</>
                          : <><Send style={{ width: 13, height: 13 }} /> Répondre · {SUPPORT_NAME}</>
                        }
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}