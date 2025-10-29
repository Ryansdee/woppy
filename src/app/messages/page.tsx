'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  setDoc,
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
  Phone,
  Video,
  MoreVertical,
  Info,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';

// --- types ---
interface Chat {
  id: string;
  participants: string[];
  participantsData?: UserProfile[];
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: { [userId: string]: number };
}
interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any;
  readBy?: string[];
}
interface UserProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
  isOnline?: boolean;
}

// --- utilitaires ---
function timeAgoFrom(date: Date): string {
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34524, 'week'],
    [12, 'month'],
  ];
  let duration = diff;
  for (const [amt, unit] of units) {
    if (Math.abs(duration) < amt) return rtf.format(-Math.round(duration), unit);
    duration /= amt;
  }
  return rtf.format(-Math.round(duration), 'year');
}

// --- composants ---
const SearchBar = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
  <div className="relative mb-3 sm:mb-4">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input
      type="text"
      placeholder="Rechercher..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent outline-none"
    />
  </div>
);

const MessageStatus = ({ message, userId }: { message: Message; userId: string }) =>
  message.senderId !== userId ? null : message.readBy?.length && message.readBy.length > 1 ? (
    <CheckCheck className="w-3 h-3 text-blue-500" />
  ) : (
    <Check className="w-3 h-3 text-gray-400" />
  );

const ChatItem = ({
  chat,
  isActive,
  onClick,
  currentUserId,
}: {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  currentUserId: string;
}) => {
  const other = chat.participantsData?.find((p) => p.uid !== currentUserId);
  const unreadCount = chat.unreadCount?.[currentUserId] || 0;
  const timeAgo =
    chat.lastMessageTime?.toDate && timeAgoFrom(chat.lastMessageTime.toDate());
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 sm:p-4 rounded-xl mb-2 transition-all ${
        isActive
          ? 'bg-gradient-to-r from-[#8a6bfe]/10 to-[#b89fff]/10 border-l-4 border-[#8a6bfe]'
          : 'hover:bg-gray-50 border-l-4 border-transparent'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={
              other?.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                other?.displayName || 'U'
              )}&background=8a6bfe&color=fff`
            }
            alt={other?.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 flex items-center gap-1 sm:gap-2">
              {other?.displayName || 'Utilisateur'}
              {other?.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full" />}
            </p>
            <p className="text-sm text-gray-600 truncate max-w-[160px] sm:max-w-[200px]">
              {chat.lastMessage || '...'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {timeAgo && <span className="text-xs text-gray-400">{timeAgo}</span>}
          {unreadCount > 0 && (
            <span className="bg-[#8a6bfe] text-white text-xs rounded-full px-1.5 py-0.5 mt-1">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// --- composant principal ---
export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const chatId = params.get('chatId');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- auth ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // --- charger les chats ---
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );
    const unsub = onSnapshot(q, async (snap) => {
      const chatsList = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data() as Chat;
          const participantsData = await Promise.all(
            data.participants.map(async (pid) => {
              const userDoc = await getDoc(doc(db, 'users', pid));
              const udata = userDoc.exists() ? userDoc.data() : {};
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
                isOnline: udata.isOnline || false,
              };
            })
          );
          return { ...data, id: d.id, participantsData };
        })
      );
      setChats(chatsList);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // --- messages ---
  useEffect(() => {
    if (!chatId || !user) return;
    const unsubMsgs = onSnapshot(
      query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc')),
      (snap) => {
        const msgList: Message[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
        setMessages(msgList);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    );
    return () => unsubMsgs();
  }, [chatId, user]);

  // --- envoyer message ---
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user) return;
    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage('');
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: user.uid,
      text: msgText,
      createdAt: serverTimestamp(),
      readBy: [user.uid],
    });
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: msgText,
      lastMessageTime: serverTimestamp(),
    });
    setSending(false);
  };

  // --- filtrer ---
  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    return chats.filter((c) => {
      const other = c.participantsData?.find((p) => p.uid !== user?.uid);
      return (
        other?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [chats, searchQuery, user]);

  // --- render ---
  if (loading)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
        <Loader2 className="animate-spin w-8 h-8 text-[#8a6bfe]" />
      </div>
    );

  return (
    <div className="min-h-[100dvh] flex bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-0 md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ${
          chatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-900">
            <MessageSquare className="text-[#8a6bfe]" /> Conversations
          </h2>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-100px)] p-4 pb-20">
          {filteredChats.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Aucune conversation</p>
          ) : (
            filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === chatId}
                onClick={() => router.push(`/messages?chatId=${chat.id}`)}
                currentUserId={user?.uid || ''}
              />
            ))
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col bg-white/90 backdrop-blur-sm">
        {!chatId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 px-4 text-center">
            <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-base sm:text-lg font-medium">Bienvenue dans vos messages</p>
            <p className="text-sm">Sélectionnez une conversation pour commencer</p>
          </div>
        ) : (
          <>
            {/* header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/messages')}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#8a6bfe]"
                >
                  <ArrowLeft size={20} />
                </button>
                {activeChat?.participantsData
                  ?.filter((p) => p.uid !== user?.uid)
                  .map((p) => (
                    <Link key={p.uid} href={`/profile/${p.uid}`} className="flex items-center gap-3">
                      <img
                        src={p.photoURL}
                        alt={p.displayName}
                        className="w-10 h-10 rounded-full border border-gray-200"
                      />
                      <div className="hidden sm:block">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {p.displayName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.isOnline ? 'En ligne' : 'Hors ligne'}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#8a6bfe]"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

            {/* messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.senderId === user?.uid;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[80%] sm:max-w-[70%] break-words shadow-sm ${
                        isOwn
                          ? 'bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p>{msg.text}</p>
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
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* input */}
            <form
              onSubmit={sendMessage}
              className="p-3 sm:p-4 border-t border-gray-200 flex gap-2 sm:gap-3 bg-white"
            >
              <input
                type="text"
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-[#8a6bfe] outline-none text-gray-900 text-sm sm:text-base"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-5 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white rounded-xl flex items-center justify-center hover:shadow-md transition disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={18} />}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
