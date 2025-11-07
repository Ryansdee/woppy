'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Loader2,
  Send,
  MessageSquare,
  ArrowLeft,
  Clock,
  Check,
  CheckCheck,
  Search,
  MoreVertical,
  Paperclip,
  Flag,
} from 'lucide-react';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { Menu, MenuItem, MenuButton } from '@headlessui/react';

// ---------------- Types ----------------
interface Chat {
  id: string;
  participants: string[];
  participantsData?: UserProfile[];
  lastMessage?: string;
  lastMessageTime?: any;
  typing?: { [userId: string]: boolean };
}

interface Message {
  id: string;
  senderId: string;
  text?: string;
  type?: 'text' | 'file';
  fileName?: string;
  fileUrl?: string;
  createdAt?: any;
  readBy?: string[];
}

interface UserProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: any;
}

// ---------------- Utils ----------------
const timeAgoFrom = (date: Date): string => {
  const now = new Date();
  const diffSec = (now.getTime() - date.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  if (diffSec < 60) return rtf.format(-Math.round(diffSec), 'second');
  if (diffSec < 3600) return rtf.format(-Math.round(diffSec / 60), 'minute');
  if (diffSec < 86400) return rtf.format(-Math.round(diffSec / 3600), 'hour');
  if (diffSec < 604800) return rtf.format(-Math.round(diffSec / 86400), 'day');
  return new Date(date).toLocaleDateString('fr-BE');
};

const MessageStatus = ({ message, userId }: { message: Message; userId: string }) =>
  message.senderId !== userId ? null : message.readBy?.length && message.readBy.length > 1 ? (
    <CheckCheck className="w-3 h-3 text-blue-500" />
  ) : (
    <Check className="w-3 h-3 text-gray-400" />
  );

// ---------------- Component ----------------
export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const chatId = params.get('chatId');
  const storage = getStorage();

  // ---------- Handle viewport ----------
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------- Auth ----------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/auth/login');
        return;
      }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  // ---------- Fetch chats ----------
  useEffect(() => {
    if (!user) return;
    const qChats = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );
    const unsub = onSnapshot(qChats, async (snap) => {
      const list = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data() as Chat;
          const participantsData = await Promise.all(
            data.participants.map(async (pid) => {
              const usnap = await getDoc(doc(db, 'users', pid));
              const udata: any = usnap.exists() ? usnap.data() : {};
              return {
                uid: pid,
                displayName:
                  udata.displayName ||
                  `${udata.firstName || ''} ${udata.lastName || ''}`.trim() ||
                  'Utilisateur',
                photoURL:
                  udata.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    udata.firstName || 'U'
                  )}&background=8a6bfe&color=fff`,
                isOnline: !!udata.isOnline,
                lastSeen: udata.lastSeen,
              } as UserProfile;
            })
          );
          return { ...data, id: d.id, participantsData };
        })
      );
      setChats(list);
      setLoading(false);
      if (chatId) {
        const current = list.find((c) => c.id === chatId) || null;
        setActiveChat(current);
      }
    });
    return () => unsub();
  }, [user, chatId]);

  // ---------- Fetch messages ----------
  useEffect(() => {
    if (!chatId || !user) return;
    const unsub = onSnapshot(
      query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc')),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
        setMessages(list);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    );
    return () => unsub();
  }, [chatId, user]);

  // ---------- Typing indicator ----------
  useEffect(() => {
    if (!activeChat || !user) return;
    const typing = activeChat.typing || {};
    const otherId = activeChat.participants.find((p) => p !== user.uid);
    setOtherTyping(!!typing?.[otherId || '']);
  }, [activeChat, user]);

  const handleTyping = (val: string) => {
    setNewMessage(val);
    if (!chatId || !user) return;

    updateDoc(doc(db, 'chats', chatId), { [`typing.${user.uid}`]: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateDoc(doc(db, 'chats', chatId), { [`typing.${user.uid}`]: false });
    }, 3000);
  };

  // ---------- Send message ----------
  const sendMessage = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!newMessage.trim() || !chatId || !user) return;
      setSending(true);
      const msgText = newMessage.trim();
      setNewMessage('');
      inputRef.current?.focus();

      const chatRef = doc(db, 'chats', chatId);
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        type: 'text',
        text: msgText,
        createdAt: serverTimestamp(),
        readBy: [user.uid],
      });
      await updateDoc(chatRef, {
        lastMessage: msgText,
        lastMessageTime: serverTimestamp(),
        [`typing.${user.uid}`]: false,
      });
      setSending(false);
    },
    [newMessage, chatId, user]
  );

  // ---------- File upload ----------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId || !user) return;
    const ref = storageRef(storage, `attachments/${chatId}/${Date.now()}_${file.name}`);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    const chatRef = doc(db, 'chats', chatId);
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: user.uid,
      type: 'file',
      fileName: file.name,
      fileUrl: url,
      createdAt: serverTimestamp(),
      readBy: [user.uid],
    });
    await updateDoc(chatRef, {
      lastMessage: `📎 ${file.name}`,
      lastMessageTime: serverTimestamp(),
    });
  };

  // ---------- Report message ----------
  const reportMessage = async (msg: Message) => {
    if (!user || !chatId) return;
    if (!confirm('Signaler ce message ?')) return;
    await addDoc(collection(db, 'reports'), {
      reporterId: user.uid,
      senderId: msg.senderId,
      chatId,
      messageId: msg.id,
      text: msg.text || msg.fileName || '(fichier)',
      createdAt: serverTimestamp(),
    });
    alert('✅ Message signalé. Notre équipe vérifiera ce contenu.');
  };

  // ---------- Render ----------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e5ff] to-[#ddc2ff]">
        <Loader2 className="animate-spin w-8 h-8 text-[#8a6bfe]" />
      </div>
    );

  const other =
    activeChat?.participantsData?.find((p) => p.uid !== user?.uid) || null;

  const filteredChats = chats.filter((c) => {
    const other = c.participantsData?.find((p) => p.uid !== user?.uid);
    return (
      !searchQuery ||
      other?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]/80 text-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          isMobile && chatId ? 'hidden' : 'block'
        } md:w-1/3 lg:w-1/4 bg-white/80 backdrop-blur-md border-r border-[#ddc2ff] transition-all`}
      >
        <div className="p-4 border-b border-[#ddc2ff]/70 sticky top-0 bg-white/70 backdrop-blur-sm z-10">
          <h2 className="text-lg font-bold flex items-center gap-2 text-[#8a6bfe]">
            <MessageSquare /> Conversations
          </h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#ddc2ff] rounded-xl focus:ring-2 focus:ring-[#8a6bfe] outline-none bg-[#f5e5ff]/40"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-100px)] p-3 sm:p-4">
          {filteredChats.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Aucune conversation</p>
          ) : (
            filteredChats.map((c) => {
              const other = c.participantsData?.find((p) => p.uid !== user?.uid);
              return (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  key={c.id}
                  onClick={() => router.push(`/messages?chatId=${c.id}`)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all ${
                    c.id === chatId
                      ? 'bg-gradient-to-r from-[#8a6bfe]/10 to-[#b89fff]/10 border-l-4 border-[#8a6bfe]'
                      : 'hover:bg-[#f5e5ff]/60 border-l-4 border-transparent'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={other?.photoURL}
                      alt={other?.displayName}
                      className="w-10 h-10 rounded-full border border-[#ddc2ff]"
                    />
                    {other?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-gray-900 truncate">
                      {other?.displayName}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {c.lastMessage || 'Aucun message'}
                    </p>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat */}
      <AnimatePresence mode="wait">
        <motion.main
          key={chatId || 'empty'}
          initial={{ opacity: 0, x: isMobile ? 100 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isMobile ? -100 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col bg-white/90 backdrop-blur-sm"
        >
          {!chatId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 px-6">
              <MessageSquare className="w-16 h-16 mb-4 text-[#ddc2ff]" />
              <p className="text-lg font-semibold">Bienvenue dans vos messages 💬</p>
              <p className="text-sm text-gray-600">Sélectionnez une conversation.</p>
            </div>
          ) : (
            <>
              <header className="sticky top-0 z-10 bg-white/90 border-b border-[#ddc2ff] p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/messages')}
                    className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-[#f5e5ff] hover:text-[#8a6bfe]"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  {other && (
                    <Link href={`/profile/${other.uid}`} className="flex items-center gap-3">
                      <img
                        src={other.photoURL}
                        alt={other.displayName}
                        className="w-9 h-9 rounded-full border border-[#ddc2ff]"
                      />
                      <div className="hidden sm:flex flex-col">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {other.displayName}
                        </p>
                        {otherTyping ? (
                          <span className="text-xs text-[#8a6bfe]/80">...écrit</span>
                        ) : other.isOnline ? (
                          <span className="text-xs text-green-500">En ligne</span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            vu {timeAgoFrom(new Date(other.lastSeen?.toDate?.() || other.lastSeen))}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}
                </div>
                <label className="p-2 rounded-lg hover:bg-[#f5e5ff] text-gray-600 hover:text-[#8a6bfe] cursor-pointer">
                  <Paperclip size={20} />
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </header>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.senderId === user?.uid;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`relative px-4 py-2 rounded-2xl max-w-[80%] sm:max-w-[70%] shadow-sm ${
                          isOwn
                            ? 'bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white'
                            : 'bg-[#f5e5ff]/80 text-gray-800'
                        }`}
                      >
                        {msg.type === 'file' ? (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            className={`${isOwn ? 'text-white underline' : 'text-[#8a6bfe] underline'}`}
                          >
                            📎 {msg.fileName}
                          </a>
                        ) : (
                          <p>{msg.text}</p>
                        )}

                        <Menu as="div" className="absolute right-1 top-1 text-right">
                          <MenuButton className="p-1 text-gray-400 hover:text-[#8a6bfe]">
                            <MoreVertical className="w-4 h-4" />
                          </MenuButton>
                          <Menu.Items className="absolute right-0 mt-1 w-36 rounded-lg bg-white border border-[#ddc2ff]/50 shadow-lg">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => reportMessage(msg)}
                                  className={`${
                                    active ? 'bg-[#f5e5ff]/50 text-[#8a6bfe]' : 'text-gray-700'
                                  } flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md`}
                                >
                                  <Flag className="w-4 h-4" /> Signaler
                                </button>
                              )}
                            </MenuItem>
                          </Menu.Items>
                        </Menu>

                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                            isOwn ? 'text-white/70' : 'text-gray-500'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {msg.createdAt &&
                            new Date(msg.createdAt.toDate()).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          <MessageStatus message={msg} userId={user?.uid || ''} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={(e) => sendMessage(e)}
                className="p-3 sm:p-4 border-t border-[#ddc2ff]/70 flex items-center gap-3 bg-white/90"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Écrire un message…"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  className="flex-1 border border-[#ddc2ff] rounded-2xl px-4 py-2 sm:py-3 focus:ring-2 focus:ring-[#8a6bfe] outline-none bg-[#f5e5ff]/40"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 sm:px-6 rounded-2xl bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white hover:shadow-md active:scale-95 transition disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={18} />}
                </button>
              </form>
            </>
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
