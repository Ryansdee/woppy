'use client';

import { useEffect, useState, useRef, useCallback, ChangeEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, doc, getDoc, serverTimestamp, updateDoc, getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Loader2, Send, MessageSquare, ArrowLeft, Check, CheckCheck,
  Search, MoreVertical, Paperclip, Flag, TriangleAlert,
  Briefcase, X, Smile,
} from 'lucide-react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Menu, MenuItem, MenuButton } from '@headlessui/react';

/* ── types ── */
export interface Chat {
  id: string; participants: string[]; participantsData?: UserProfile[];
  lastMessage?: string; lastMessageTime?: any;
  typing?: { [uid: string]: boolean }; jobId?: string; unreadCount?: number;
}
export interface Message {
  id: string; senderId: string; text?: string;
  type?: 'text' | 'file' | 'system'; fileName?: string;
  fileUrl?: string; createdAt?: any; readBy?: string[];
}
export interface UserProfile {
  uid: string; displayName?: string; photoURL?: string;
  isOnline?: boolean; lastSeen?: any;
}
export interface Job {
  id: string; title?: string; participants?: string[];
  status?: string; completedBy?: string[];
}

/* ── utils ── */
const dedup = <T extends { id: string }>(items: T[]): T[] =>
  Array.from(new Map(items.map(i => [i.id, i])).values());

const fmtTime = (d: Date) =>
  d.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' });

const fmtDateLabel = (d: Date): string => {
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7)  return d.toLocaleDateString('fr-BE', { weekday: 'long' });
  return d.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long' });
};

const isImage = (n?: string) => !!n && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(n);

/* ── profile cache ── */
const cache = new Map<string, UserProfile>();
async function fetchProfile(uid: string): Promise<UserProfile> {
  if (cache.has(uid)) return cache.get(uid)!;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    const d: any = snap.exists() ? snap.data() : {};
    const p: UserProfile = {
      uid,
      displayName: d.displayName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Utilisateur',
      photoURL: d.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.firstName || 'U')}&background=7c5fe6&color=fff`,
      isOnline: !!d.isOnline,
      lastSeen: d.lastSeen,
    };
    cache.set(uid, p);
    return p;
  } catch {
    return { uid, displayName: 'Utilisateur', photoURL: `https://ui-avatars.com/api/?name=U&background=7c5fe6&color=fff` };
  }
}

/* ── read status ── */
function ReadStatus({ msg, uid }: { msg: Message; uid: string }) {
  if (msg.senderId !== uid) return null;
  return msg.readBy && msg.readBy.length > 1
    ? <CheckCheck size={12} className="text-violet-400" />
    : <Check size={12} className="text-slate-400" />;
}

/* ══════════════════════════════════════════════════════════ */
export default function MessagesPage() {
  const [user, setUser]               = useState<User | null>(null);
  const [chats, setChats]             = useState<Chat[]>([]);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [activeChat, setActiveChat]   = useState<Chat | null>(null);
  const [newMessage, setNewMessage]   = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [commonJobs, setCommonJobs]   = useState<Job[]>([]);
  const [showJobs, setShowJobs]       = useState(false);
  const [showSearch, setShowSearch]   = useState(false);

  const endRef       = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const typingTimer  = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storage      = getStorage();
  const router       = useRouter();
  const params       = useSearchParams();
  const chatId       = params.get('chatId');

  /* resize */
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    h(); window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  /* cleanup */
  useEffect(() => () => { typingTimer.current && clearTimeout(typingTimer.current); }, []);

  /* auth */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (!u) router.push('/auth/login'); else setUser(u); });
    return () => unsub();
  }, [router]);

  /* chats */
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), orderBy('lastMessageTime', 'desc')),
      async snap => {
        try {
          const list = await Promise.all(snap.docs.map(async d => {
            const data = d.data() as Chat;
            const uniq = [...new Set(data.participants)];
            const participantsData = await Promise.all(uniq.map(fetchProfile));
            return { ...data, id: d.id, participants: uniq, participantsData };
          }));
          const unique = dedup(list);
          setChats(unique);
          setLoading(false);
          if (chatId) setActiveChat(unique.find(c => c.id === chatId) ?? null);
        } catch { setLoading(false); }
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [user, chatId]);

  /* messages */
  useEffect(() => {
    if (!chatId || !user) return;
    const unsub = onSnapshot(
      query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc')),
      snap => setMessages(dedup(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)))),
    );
    return () => unsub();
  }, [chatId, user]);

  /* typing */
  useEffect(() => {
    if (!activeChat || !user) return;
    const other = activeChat.participants.find(p => p !== user.uid);
    setOtherTyping(!!activeChat.typing?.[other ?? '']);
  }, [activeChat, user]);

  const handleTyping = useCallback((val: string) => {
    setNewMessage(val);
    if (!chatId || !user) return;
    updateDoc(doc(db, 'chats', chatId), { [`typing.${user.uid}`]: true }).catch(() => {});
    typingTimer.current && clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      updateDoc(doc(db, 'chats', chatId), { [`typing.${user.uid}`]: false }).catch(() => {});
    }, 2800);
  }, [chatId, user]);

  /* common jobs */
  useEffect(() => {
    if (!user || !activeChat) return;
    const other = activeChat.participants.find(p => p !== user.uid);
    if (!other) return;
    const unsub = onSnapshot(
      query(collection(db, 'annonces'), where('participants', 'array-contains', user.uid)),
      snap => setCommonJobs(dedup(
        snap.docs.map(d => ({ id: d.id, ...d.data() as any }))
          .filter((j: any) => Array.isArray(j.participants) && j.participants.includes(other))
      )),
    );
    return () => unsub();
  }, [user, activeChat]);

  /* file upload */
  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !chatId || !user) return;
    const file = e.target.files[0];
    if (!file) return;
    try {
      const r = storageRef(storage, `attachments/${chatId}/${Date.now()}-${file.name}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid, type: 'file', fileName: file.name, fileUrl: url,
        createdAt: serverTimestamp(), readBy: [user.uid],
      });
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: `📎 ${file.name}`, lastMessageTime: serverTimestamp(),
        [`typing.${user.uid}`]: false,
      });
    } catch { alert('Erreur upload.'); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* send */
  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !chatId || !user) return;
    setSending(true);
    const text = newMessage.trim();
    setNewMessage('');
    inputRef.current?.focus();
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid, text, type: 'text',
        createdAt: serverTimestamp(), readBy: [user.uid],
      });
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text, lastMessageTime: serverTimestamp(),
        [`typing.${user.uid}`]: false,
      });
      const other = activeChat?.participants.find(p => p !== user.uid);
      if (other) await addDoc(collection(db, 'notifications'), {
        toUser: other, fromUser: user.uid, type: 'message',
        message: `Nouveau message`, messagePreview: text.slice(0, 100),
        chatId, read: false, createdAt: serverTimestamp(),
      });
    } catch { setNewMessage(text); }
    setSending(false);
  }, [newMessage, chatId, user, activeChat]);

  /* report */
  const report = async (msg: Message) => {
    if (!user || !chatId || !confirm('Signaler ce message ?')) return;
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: user.uid, senderId: msg.senderId, chatId,
        messageId: msg.id, text: msg.text || msg.fileName || '',
        createdAt: serverTimestamp(),
      });
    } catch {}
  };

  /* auto scroll */
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* group by date */
  const grouped = messages.reduce((acc, msg) => {
    if (!msg.createdAt) return acc;
    const key = new Date(msg.createdAt.toDate()).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  const other = activeChat?.participantsData?.find(p => p.uid !== user?.uid) ?? null;

  const filtered = chats.filter(c => {
    const o = c.participantsData?.find(p => p.uid !== user?.uid);
    return !searchQuery
      || o?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      || c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  /* ── loader ── */
  if (loading) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center animate-pulse">
          <MessageSquare size={18} className="text-white" />
        </div>
        <p className="text-sm text-slate-500">Chargement…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&display=swap');`}</style>

      <div className="h-[calc(100vh-64px)] flex bg-slate-50 overflow-hidden text-slate-900"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ══════════════════════════════
            SIDEBAR
        ══════════════════════════════ */}
        <aside className={`${isMobile && chatId ? 'hidden' : 'flex'} w-full md:w-[300px] lg:w-[320px] bg-white border-r border-slate-100 flex-col shrink-0`}>

          {/* Sidebar topbar */}
          <div className="h-14 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h1 className="font-bold text-sm text-slate-900" style={{ fontFamily: 'Sora, system-ui' }}>
              Messages
            </h1>
            <button onClick={() => setShowSearch(s => !s)}
              className={`p-1.5 rounded-lg transition-colors ${showSearch ? 'bg-violet-50 text-violet-600' : 'text-slate-400 hover:bg-slate-100'}`}>
              <Search size={15} />
            </button>
          </div>

          {/* Search */}
          {showSearch && (
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input autoFocus type="text" placeholder="Rechercher…" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/25 focus:border-violet-400 transition-all" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <MessageSquare size={18} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Aucune conversation</p>
                <p className="text-xs text-slate-400">Vos messages apparaîtront ici</p>
              </div>
            ) : (
              <div>
                {filtered.map(c => {
                  const o = c.participantsData?.find(p => p.uid !== user?.uid);
                  const isActive = c.id === chatId;
                  return (
                    <button key={c.id} onClick={() => router.push(`/messages?chatId=${c.id}`)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 ${isActive ? 'bg-violet-50 border-r-2 border-violet-500' : ''}`}>
                      <div className="relative shrink-0">
                        <img src={o?.photoURL} alt={o?.displayName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                        {o?.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <p className={`text-sm font-semibold truncate ${isActive ? 'text-violet-700' : 'text-slate-900'}`}>
                            {o?.displayName}
                          </p>
                          {c.lastMessageTime && (
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                              {fmtTime(new Date(c.lastMessageTime.toDate()))}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-400 truncate flex-1">{c.lastMessage}</p>
                          {c.unreadCount && c.unreadCount > 0 && (
                            <span className="shrink-0 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ══════════════════════════════
            MAIN CHAT AREA
        ══════════════════════════════ */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          {!chatId ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare size={22} className="text-slate-400" />
              </div>
              <h2 className="text-base font-bold text-slate-800 mb-1" style={{ fontFamily: 'Sora, system-ui' }}>
                Messagerie Woppy
              </h2>
              <p className="text-sm text-slate-400">Sélectionne une conversation pour commencer</p>
            </div>
          ) : (
            <>
              {/* ── Chat header ── */}
              <div className="h-14 px-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isMobile && (
                    <button onClick={() => router.push('/messages')}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors mr-1">
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  {other && (
                    <Link href={`/profile/${other.uid}`} className="flex items-center gap-3 min-w-0 flex-1 group">
                      <div className="relative shrink-0">
                        <img src={other.photoURL} alt={other.displayName}
                          className="w-8 h-8 rounded-xl object-cover border border-slate-100" />
                        {other.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-violet-700 transition-colors">
                          {other.displayName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {other.isOnline ? 'En ligne' : 'Hors ligne'}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {commonJobs.length > 0 && (
                    <button onClick={() => setShowJobs(s => !s)}
                      className={`relative p-2 rounded-lg transition-colors ${showJobs ? 'bg-violet-50 text-violet-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                      <Briefcase size={15} />
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-violet-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {commonJobs.length}
                      </span>
                    </button>
                  )}
                  <Menu as="div" className="relative">
                    <MenuButton className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                      <MoreVertical size={15} />
                    </MenuButton>
                    <Menu.Items className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-slate-100 shadow-lg py-1 z-10">
                      <MenuItem>
                        {({ active }: { active: boolean }) => (
                          <button onClick={() => router.push(`/support?chatId=${chatId}`)}
                            className={`${active ? 'bg-red-50' : ''} flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-red-600 font-medium`}>
                            <TriangleAlert size={13} /> Signaler la conversation
                          </button>
                        )}
                      </MenuItem>
                    </Menu.Items>
                  </Menu>
                </div>
              </div>

              {/* ── Jobs panel ── */}
              {showJobs && commonJobs.length > 0 && (
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Missions en commun
                    </p>
                    <button onClick={() => setShowJobs(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonJobs.map(job => (
                      <div key={job.id}
                        className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
                        <p className="text-xs font-medium text-slate-700">{job.title || 'Mission'}</p>
                        {job.status && (
                          <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">
                            {job.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-5 py-5 bg-slate-50">
                <div className="max-w-3xl mx-auto space-y-6">
                  {Object.entries(grouped).map(([dateKey, msgs]) => (
                    <div key={dateKey}>
                      {/* Date divider */}
                      <div className="flex justify-center mb-5">
                        <span className="bg-white border border-slate-100 px-3 py-1 rounded-full text-[11px] font-medium text-slate-500 shadow-sm">
                          {fmtDateLabel(new Date(dateKey))}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {msgs.map((msg, idx) => {
                          const isOwn     = msg.senderId === user?.uid;
                          const prev      = idx > 0 ? msgs[idx - 1] : null;
                          const next      = idx < msgs.length - 1 ? msgs[idx + 1] : null;
                          const showAv    = !next || next.senderId !== msg.senderId;
                          const isFirst   = !prev || prev.senderId !== msg.senderId;

                          if (msg.type === 'system') return (
                            <div key={msg.id} className="flex justify-center my-3">
                              <span className="bg-white border border-slate-100 px-3 py-1 rounded-full text-[11px] text-slate-500">
                                {msg.text}
                              </span>
                            </div>
                          );

                          return (
                            <div key={msg.id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isFirst ? 'mt-3' : 'mt-0.5'}`}>
                              <div className={`flex gap-2.5 max-w-[72%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

                                {/* Avatar */}
                                {!isOwn && (
                                  <div className="w-7 h-7 shrink-0 mt-auto">
                                    {showAv && (
                                      <img src={other?.photoURL} alt=""
                                        className="w-7 h-7 rounded-lg object-cover border border-slate-100" />
                                    )}
                                  </div>
                                )}

                                <div className="flex flex-col">
                                  <div className="group relative">
                                    {/* Image */}
                                    {msg.type === 'file' && isImage(msg.fileName) ? (
                                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                                        className="block rounded-2xl overflow-hidden border border-slate-200">
                                        <img src={msg.fileUrl} alt={msg.fileName}
                                          className="max-w-[220px] max-h-[200px] object-cover" />
                                      </a>
                                    ) : (
                                      /* Bubble */
                                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        isOwn
                                          ? 'bg-violet-600 text-white rounded-br-sm'
                                          : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-bl-sm'
                                      } ${isFirst && isOwn ? 'rounded-tr-2xl' : ''} ${isFirst && !isOwn ? 'rounded-tl-2xl' : ''}`}>
                                        {msg.type === 'file'
                                          ? <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                                              className={`flex items-center gap-2 hover:underline ${isOwn ? 'text-white' : 'text-violet-600'}`}>
                                              <Paperclip size={13} /> <span className="text-xs font-medium">{msg.fileName}</span>
                                            </a>
                                          : msg.text
                                        }
                                      </div>
                                    )}

                                    {/* Context menu */}
                                    <Menu as="div" className={`absolute ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                      <MenuButton className="p-1 bg-white border border-slate-200 rounded-lg shadow-sm mx-1.5">
                                        <MoreVertical size={12} className="text-slate-500" />
                                      </MenuButton>
                                      <Menu.Items className={`absolute ${isOwn ? 'right-0' : 'left-0'} mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-10`}>
                                        <MenuItem>
                                          {({ active }: { active: boolean }) => (
                                            <button onClick={() => report(msg)}
                                              className={`${active ? 'bg-red-50' : ''} flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 font-medium`}>
                                              <Flag size={12} /> Signaler
                                            </button>
                                          )}
                                        </MenuItem>
                                      </Menu.Items>
                                    </Menu>
                                  </div>

                                  {/* Time + read status */}
                                  {showAv && (
                                    <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                      <span className="text-[10px] text-slate-400">
                                        {msg.createdAt && fmtTime(new Date(msg.createdAt.toDate()))}
                                      </span>
                                      {isOwn && <ReadStatus msg={msg} uid={user?.uid ?? ''} />}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {otherTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2.5">
                        <img src={other?.photoURL} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-100 mt-auto" />
                        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1">
                            {[0, 0.2, 0.4].map((d, i) => (
                              <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${d}s` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={endRef} />
                </div>
              </div>

              {/* ── Input bar ── */}
              <div className="px-5 py-4 bg-white border-t border-slate-100 shrink-0">
                <div className="max-w-3xl mx-auto flex items-end gap-2">
                  <label className="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 cursor-pointer transition-colors">
                    <Paperclip size={16} />
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
                  </label>

                  <div className="flex-1 relative">
                    <input ref={inputRef} type="text"
                      placeholder="Écrire un message…"
                      value={newMessage}
                      onChange={e => handleTyping(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/25 focus:border-violet-400 focus:bg-white transition-all" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors">
                      <Smile size={15} />
                    </button>
                  </div>

                  <button onClick={() => sendMessage()}
                    disabled={sending || !newMessage.trim()}
                    className="p-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all shadow-sm shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}