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
  limit,
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

// =======================
// 🔷 Types
// =======================
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

// =======================
// 🔍 Barre de recherche
// =======================
const SearchBar = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
  <div className="relative mb-4">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input
      type="text"
      placeholder="Rechercher une conversation..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent outline-none transition-all"
    />
  </div>
);

// =======================
// ✉️ Statut du message
// =======================
const MessageStatus = ({ message, userId }: { message: Message; userId: string }) => {
  if (message.senderId !== userId) return null;
  const isRead = message.readBy?.length && message.readBy.length > 1;
  return isRead ? (
    <CheckCheck className="w-3 h-3 text-blue-500" />
  ) : (
    <Check className="w-3 h-3 text-gray-400" />
  );
};


function timeAgoFrom(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

  const divisions = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ] as const;

  let duration = diffInSeconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(-Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return ''; // par sécurité
}

// =======================
// 💬 ChatItem (sidebar)
// =======================
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
    let timeAgo = '';

    try {
      if (chat.lastMessageTime?.toDate) {
        timeAgo = timeAgoFrom(chat.lastMessageTime.toDate());
      }
    } catch {
      timeAgo = '';
    }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl mb-2 transition-all hover:shadow-md ${
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
              `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.displayName || 'U')}&background=8a6bfe&color=fff`
            }
            alt={other?.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 flex items-center gap-2">
              {other?.displayName || 'Utilisateur'}
              {other?.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full" />}
            </p>
            <p className="text-sm text-gray-600 truncate max-w-[200px]">{chat.lastMessage || '...'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {timeAgo && <span className="text-xs text-gray-400">{timeAgo}</span>}
          {unreadCount > 0 && (
            <span className="bg-[#8a6bfe] text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
          )}
        </div>
      </div>
    </button>
  );
};

// =======================
// 🧠 Page principale
// =======================
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const chatId = params.get('chatId');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // -----------------------------
  // 🔐 Authentification
  // -----------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // -----------------------------
  // 💬 Charger les chats
  // -----------------------------
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
                  udata.displayName || `${udata.firstName || ''} ${udata.lastName || ''}`.trim() || 'Utilisateur',
                photoURL:
                  udata.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    udata.displayName || udata.firstName || 'U'
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

  // -----------------------------
  // 📨 Chat actif et messages
  // -----------------------------
  useEffect(() => {
    if (!chatId || !user) return;
    const found = chats.find((c) => c.id === chatId);
    setActiveChat(found || null);

    const unsubChat = onSnapshot(doc(db, 'chats', chatId), (d) => {
      if (d.exists()) setActiveChat({ id: d.id, ...d.data() } as Chat);
    });

    const unsubMsgs = onSnapshot(
      query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc')),
      (snap) => {
        const msgList: Message[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
        setMessages(msgList);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    );

    const unsubTyping = onSnapshot(collection(db, 'chats', chatId, 'typing'), (snap) => {
      const typingNow: string[] = [];
      snap.forEach((d) => {
        const t = d.data();
        if (t.isTyping && t.userId !== user.uid) typingNow.push(t.userName || "Quelqu'un");
      });
      setTypingUsers(typingNow);
    });

    return () => {
      unsubChat();
      unsubMsgs();
      unsubTyping();
    };
  }, [chatId, user]);

  // -----------------------------
  // 📤 Envoyer un message
  // -----------------------------
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

  // -----------------------------
  // ⌨️ Frappe en temps réel
  // -----------------------------
  const handleTyping = useCallback(async () => {
    if (!user || !chatId) return;
    const typingDoc = doc(db, 'chats', chatId, 'typing', user.uid);
    await setDoc(typingDoc, { userId: user.uid, userName: user.displayName || "Quelqu'un", isTyping: true }, { merge: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await setDoc(typingDoc, { isTyping: false }, { merge: true });
    }, 1500);
  }, [chatId, user]);

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

  // -----------------------------
  // 🧭 Render
  // -----------------------------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
        <Loader2 className="animate-spin w-10 h-10 text-[#8a6bfe]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <MessageSquare className="text-[#8a6bfe]" /> Conversations
            </h2>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="overflow-y-auto h-full p-4">
            {filteredChats.length === 0 ? (
              <div className="text-center text-gray-500 pt-10">Aucune conversation</div>
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

        {/* Zone principale */}
        <main className="flex-1 flex flex-col bg-white/80">
          {chatId ? (
            activeChat ? (
              <>
                {/* HEADER AMÉLIORÉ */}
                <header className="sticky top-0 z-20 border-b border-gray-200/50 bg-white/80 backdrop-blur-md shadow-sm">
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-center">
                      {/* Partie gauche avec infos utilisateur */}
                      <div className="flex items-center gap-3">
                        {/* Bouton retour mobile */}
                        <button 
                          onClick={() => router.push('/messages')} 
                          className="md:hidden text-gray-600 hover:text-[#8a6bfe] transition-colors p-2 rounded-lg hover:bg-gray-100"
                        >
                          <ArrowLeft size={20} />
                        </button>

                        {/* Infos utilisateur */}
                        {activeChat.participantsData
                          ?.filter((p) => p.uid !== user?.uid)
                          .map((p) => (
                            <Link
                              key={p.uid}
                              href={`/profile/${p.uid}`}
                              className="flex items-center gap-3 hover:bg-gray-50/80 rounded-xl px-3 py-2 transition-all group"
                            >
                              {/* Avatar avec statut */}
                              <div className="relative">
                                <img
                                  src={p.photoURL}
                                  alt={p.displayName}
                                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm group-hover:shadow-md transition-shadow"
                                />
                                {p.isOnline && (
                                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                                )}
                              </div>

                              {/* Nom et statut */}
                              <div className="hidden sm:block">
                                <p className="font-semibold text-gray-900 text-base">
                                  {p.displayName}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  {p.isOnline ? (
                                    <>
                                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                      En ligne
                                    </>
                                  ) : (
                                    'Hors ligne'
                                  )}
                                </p>
                              </div>
                            </Link>
                          ))}
                      </div>

                      {/* Actions à droite */}
                      <div className="flex items-center gap-1">
                        {/* Appel audio */}
                        <button 
                          className="p-2.5 text-gray-600 hover:text-[#8a6bfe] hover:bg-[#8a6bfe]/10 rounded-xl transition-all group"
                          title="Appel audio"
                          onClick={() => alert('Appel audio - Fonctionnalité à venir')}
                        >
                          <Phone size={20} className="group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Appel vidéo */}
                        <button 
                          className="p-2.5 text-gray-600 hover:text-[#8a6bfe] hover:bg-[#8a6bfe]/10 rounded-xl transition-all group"
                          title="Appel vidéo"
                          onClick={() => alert('Appel vidéo - Fonctionnalité à venir')}
                        >
                          <Video size={20} className="group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Infos conversation */}
                        <button 
                          className="p-2.5 text-gray-600 hover:text-[#8a6bfe] hover:bg-[#8a6bfe]/10 rounded-xl transition-all group hidden sm:block"
                          title="Informations"
                          onClick={() => alert('Détails de la conversation - Fonctionnalité à venir')}
                        >
                          <Info size={20} className="group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Menu plus d'options */}
                        <div className="relative">
                          <button 
                            className="p-2.5 text-gray-600 hover:text-[#8a6bfe] hover:bg-[#8a6bfe]/10 rounded-xl transition-all group"
                            title="Plus d'options"
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                          >
                            <MoreVertical size={20} className="group-hover:scale-110 transition-transform" />
                          </button>

                          {/* Dropdown menu */}
                          {showMoreMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                              <Link 
                                href={`/profile/${activeChat.participantsData?.find(p => p.uid !== user?.uid)?.uid}`}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                              >
                                <UserCircle size={18} className="text-gray-500" />
                                <span className="text-sm text-gray-700">Voir le profil</span>
                              </Link>
                              <button 
                                onClick={() => {
                                  alert('Recherche dans la conversation - Fonctionnalité à venir');
                                  setShowMoreMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                              >
                                <Search size={18} className="text-gray-500" />
                                <span className="text-sm text-gray-700">Rechercher</span>
                              </button>
                              <button 
                                onClick={() => {
                                  alert('Informations de la conversation - Fonctionnalité à venir');
                                  setShowMoreMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors sm:hidden"
                              >
                                <Info size={18} className="text-gray-500" />
                                <span className="text-sm text-gray-700">Informations</span>
                              </button>
                              <hr className="my-2 border-gray-100" />
                              <button 
                                onClick={() => {
                                  if (confirm('Voulez-vous vraiment supprimer cette conversation ?')) {
                                    alert('Suppression - Fonctionnalité à venir');
                                  }
                                  setShowMoreMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
                              >
                                <span className="text-sm">Supprimer la conversation</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Indicateur de frappe */}
                    {typingUsers.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-[#8a6bfe]">
                        <div className="flex space-x-1">
                          <span className="w-2 h-2 bg-[#8a6bfe] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-[#8a6bfe] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-[#8a6bfe] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span>{typingUsers.join(', ')} est en train d'écrire</span>
                      </div>
                    )}
                  </div>
                </header>

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} transition-all animate-in fade-in slide-in-from-bottom-1`}>
                        <div
                          className={`px-4 py-2 rounded-2xl max-w-[70%] break-words shadow-sm ${
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

                {/* INPUT */}
                <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white flex gap-3">
                  <input
                    type="text"
                    placeholder="Écrire un message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    disabled={sending}
                    className="flex-1 border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white rounded-xl px-6 flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={18} />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="animate-spin w-8 h-8 mb-2 text-[#8a6bfe]" />
                <p>Chargement du chat...</p>
              </div>
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare className="w-20 h-20 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Bienvenue dans vos messages</p>
              <p className="text-sm">Sélectionnez une conversation pour commencer</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}