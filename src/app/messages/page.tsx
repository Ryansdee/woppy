'use client';

import { useEffect, useState, useRef, useCallback, ChangeEvent } from 'react';
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
  getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Loader2,
  Send,
  MessageSquare,
  ArrowLeft,
  Check,
  CheckCheck,
  Search,
  MoreVertical,
  Paperclip,
  Flag,
  TriangleAlert,
  Briefcase,
  X,
  Smile,
  Image as ImageIcon,
} from 'lucide-react';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { Menu, MenuItem, MenuButton } from '@headlessui/react';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface Chat {
  id: string;
  participants: string[];
  participantsData?: UserProfile[];
  lastMessage?: string;
  lastMessageTime?: any;
  typing?: { [userId: string]: boolean };
  jobId?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  type?: 'text' | 'file' | 'system';
  fileName?: string;
  fileUrl?: string;
  createdAt?: any;
  readBy?: string[];
}

export interface UserProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: any;
}

export interface Job {
  id: string;
  title?: string;
  participants?: string[];
  status?: string;
  completedBy?: string[];
  reviewMessageSentForChat?: any;
}

// -----------------------------------------------------------------------------
// UTILS
// -----------------------------------------------------------------------------

const timeAgoFrom = (date: Date): string => {
  const now = new Date();
  const diffSec = (now.getTime() - date.getTime()) / 1000;
  if (diffSec < 60) return "à l'instant";
  if (diffSec < 3600) return `il y a ${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `il y a ${Math.floor(diffSec / 3600)}h`;
  return `il y a ${Math.floor(diffSec / 86400)}j`;
};

const formatMessageDate = (date: Date): string => {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
};

// Helper pour dédupliquer par ID
const deduplicateById = <T extends { id: string }>(items: T[]): T[] => {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
};

const MessageStatus = ({
  message,
  userId,
}: {
  message: Message;
  userId: string;
}) =>
  message.senderId !== userId ? null : message.readBy?.length &&
    message.readBy.length > 1 ? (
    <CheckCheck className="w-4 h-4 text-blue-400" />
  ) : (
    <Check className="w-4 h-4 text-gray-400" />
  );

// -----------------------------------------------------------------------------
// CACHE pour les profils utilisateurs (évite les requêtes répétées)
// -----------------------------------------------------------------------------

const userProfileCache = new Map<string, UserProfile>();

const fetchUserProfile = async (uid: string): Promise<UserProfile> => {
  // Vérifier le cache d'abord
  if (userProfileCache.has(uid)) {
    return userProfileCache.get(uid)!;
  }

  try {
    const usnap = await getDoc(doc(db, 'users', uid));
    const udata: any = usnap.exists() ? usnap.data() : {};
    
    const profile: UserProfile = {
      uid,
      displayName:
        udata.displayName ||
        `${udata.firstName || ''} ${udata.lastName || ''}`.trim() ||
        'Utilisateur',
      photoURL:
        udata.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          udata.firstName || 'U'
        )}&background=3b82f6&color=fff`,
      isOnline: !!udata.isOnline,
      lastSeen: udata.lastSeen,
    };

    // Mettre en cache
    userProfileCache.set(uid, profile);
    return profile;
  } catch (error) {
    console.error(`Erreur lors du fetch du profil ${uid}:`, error);
    return {
      uid,
      displayName: 'Utilisateur',
      photoURL: `https://ui-avatars.com/api/?name=U&background=3b82f6&color=fff`,
      isOnline: false,
    };
  }
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export default function MessagesPage() {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
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
  const [commonJobs, setCommonJobs] = useState<Job[]>([]);
  const [showCommonJobs, setShowCommonJobs] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // ---------------------------------------------------------------------------
  // REFS
  // ---------------------------------------------------------------------------
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storage = getStorage();
  const router = useRouter();
  const params = useSearchParams();
  const chatId = params.get('chatId');

  // ---------------------------------------------------------------------------
  // WINDOW SIZE (Mobile detection)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------------------------------------------------------------------------
  // Cleanup typing timeout on unmount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // AUTH — detect logged user
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // FETCH CHATS (avec déduplication et cache des profils)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const qChats = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsub = onSnapshot(
      qChats,
      async (snap) => {
        try {
          const list = await Promise.all(
            snap.docs.map(async (d) => {
              const data = d.data() as Chat;

              // Dédupliquer les participants (au cas où)
              const uniqueParticipants = [...new Set(data.participants)];

              const participantsData = await Promise.all(
                uniqueParticipants.map((pid) => fetchUserProfile(pid))
              );

              return {
                ...data,
                id: d.id,
                participants: uniqueParticipants,
                participantsData,
              };
            })
          );

          // Dédupliquer les chats par ID
          const uniqueChats = deduplicateById(list);
          setChats(uniqueChats);
          setLoading(false);

          if (chatId) {
            const current = uniqueChats.find((c) => c.id === chatId) || null;
            setActiveChat(current);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des chats:', error);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Erreur onSnapshot chats:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, chatId]);

  // ---------------------------------------------------------------------------
  // FETCH MESSAGES (avec déduplication)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!chatId || !user) return;

    const unsub = onSnapshot(
      query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      ),
      (snap) => {
        const list = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Message)
        );
        // Dédupliquer les messages par ID
        const uniqueMessages = deduplicateById(list);
        setMessages(uniqueMessages);
      },
      (error) => {
        console.error('Erreur onSnapshot messages:', error);
      }
    );

    return () => unsub();
  }, [chatId, user]);

  // ---------------------------------------------------------------------------
  // TYPING INDICATOR
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!activeChat || !user) return;
    const typing = activeChat.typing || {};
    const otherId = activeChat.participants.find((p) => p !== user.uid);
    setOtherTyping(!!typing?.[otherId || '']);
  }, [activeChat, user]);

  const handleTyping = useCallback(
    (value: string) => {
      setNewMessage(value);
      if (!chatId || !user) return;

      updateDoc(doc(db, 'chats', chatId), {
        [`typing.${user.uid}`]: true,
      }).catch((err) => console.error('Erreur update typing:', err));

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        updateDoc(doc(db, 'chats', chatId), {
          [`typing.${user.uid}`]: false,
        }).catch((err) => console.error('Erreur reset typing:', err));
      }, 2800);
    },
    [chatId, user]
  );

  // ---------------------------------------------------------------------------
  // FETCH COMMON JOBS (avec déduplication)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!user || !activeChat) return;

    const otherId = activeChat.participants.find((p) => p !== user.uid);
    if (!otherId) return;

    const qJobs = query(
      collection(db, 'annonces'),
      where('participants', 'array-contains', user.uid)
    );

    const unsub = onSnapshot(
      qJobs,
      (snap) => {
        const list: Job[] = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter(
            (job) =>
              Array.isArray(job.participants) &&
              job.participants.includes(otherId)
          );

        // Dédupliquer les jobs par ID
        const uniqueJobs = deduplicateById(list);
        setCommonJobs(uniqueJobs);
      },
      (error) => {
        console.error('Erreur onSnapshot jobs:', error);
      }
    );

    return () => unsub();
  }, [user, activeChat]);

  // ---------------------------------------------------------------------------
  // FILE UPLOAD (avec gestion d'erreur)
  // ---------------------------------------------------------------------------
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !chatId || !user) return;

    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileRef = storageRef(
        storage,
        `attachments/${chatId}/${Date.now()}-${file.name}`
      );
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        type: 'file',
        fileName: file.name,
        fileUrl: url,
        createdAt: serverTimestamp(),
        readBy: [user.uid],
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: `📎 ${file.name}`,
        lastMessageTime: serverTimestamp(),
        [`typing.${user.uid}`]: false,
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      alert('Erreur lors de l\'envoi du fichier. Veuillez réessayer.');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ---------------------------------------------------------------------------
  // Helper image in chat
  // ---------------------------------------------------------------------------

  const isImageFile = (fileName?: string) => {
    if (!fileName) return false;
    return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName);
  };


  // ---------------------------------------------------------------------------
  // SEND MESSAGE (avec gestion d'erreur)
  // ---------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!newMessage.trim() || !chatId || !user) return;

      setSending(true);
      const msgText = newMessage.trim();
      setNewMessage('');
      inputRef.current?.focus();

      try {
        // Envoi du message
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          senderId: user.uid,
          text: msgText,
          type: 'text',
          createdAt: serverTimestamp(),
          readBy: [user.uid],
        });

        // Mise à jour du chat
        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: msgText,
          lastMessageTime: serverTimestamp(),
          [`typing.${user.uid}`]: false,
        });

        // ✅ CRÉER UNE NOTIFICATION pour l'autre utilisateur
        const otherUserId = activeChat?.participants.find((p) => p !== user.uid);
        
        if (otherUserId) {
          await addDoc(collection(db, 'notifications'), {
            toUser: otherUserId,
            fromUser: user.uid,
            type: 'message',
            message: `Nouveau message de ${user.displayName || 'un utilisateur'}`,
            messagePreview: msgText.length > 100 ? msgText.substring(0, 100) + '...' : msgText,
            chatId: chatId,
            read: false,
            createdAt: serverTimestamp(),
          });
        }

      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        setNewMessage(msgText);
        alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
      }

      setSending(false);
    },
    [newMessage, chatId, user, activeChat]
  );

  // ---------------------------------------------------------------------------
  // REPORT MESSAGE (avec gestion d'erreur)
  // ---------------------------------------------------------------------------
  const reportMessage = async (msg: Message) => {
    if (!user || !chatId) return;
    if (!confirm('Signaler ce message ?')) return;

    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: user.uid,
        senderId: msg.senderId,
        chatId,
        messageId: msg.id,
        text: msg.text || msg.fileName || '(fichier)',
        createdAt: serverTimestamp(),
      });
      alert('Message signalé.');
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      alert('Erreur lors du signalement. Veuillez réessayer.');
    }
  };

  // ---------------------------------------------------------------------------
  // Auto-scroll to bottom when new messages arrive
  // ---------------------------------------------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------------------------------------------------------------------------
  // Group messages by date
  // ---------------------------------------------------------------------------
  const groupedMessages = messages.reduce((acc, msg) => {
    if (!msg.createdAt) return acc;
    const date = new Date(msg.createdAt.toDate());
    const dateKey = date.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  // ---------------------------------------------------------------------------
  // Computed
  // ---------------------------------------------------------------------------
  const other =
    activeChat?.participantsData?.find((p) => p.uid !== user?.uid) || null;

  const filteredChats = chats.filter((c) => {
    const o = c.participantsData?.find((p) => p.uid !== user?.uid);
    return (
      !searchQuery ||
      o?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden">
      {/* SIDEBAR - Style WhatsApp */}
      <aside
        className={`${
          isMobile && chatId ? 'hidden' : 'flex'
        } w-full md:w-[380px] bg-white flex-col shadow-xl border-r border-gray-100`}
      >
        {/* Header avec gradient Woppy */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
              <Menu as="div" className="relative">
                <MenuButton className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-white" />
                </MenuButton>
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-10 border border-gray-100">
                  <MenuItem>
                    {({ active }: { active: boolean }) => (
                      <button
                        className={`${
                          active ? 'bg-blue-50' : ''
                        } flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700`}
                      >
                        <MessageSquare size={16} />
                        Nouvelle conversation
                      </button>
                    )}
                  </MenuItem>
                </Menu.Items>
              </Menu>
            </div>
          </div>

          <AnimatePresence>
            {showSearchBar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 rounded-full focus:ring-2 focus:ring-white/50 focus:bg-white/30 outline-none transition-all"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6 py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-12 h-12 text-blue-600" />
              </div>
              <p className="text-base font-medium text-gray-700 mb-1">
                Aucune conversation
              </p>
              <p className="text-sm text-gray-500 text-center">
                Vos messages apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChats.map((c) => {
                const otherUser = c.participantsData?.find(
                  (p) => p.uid !== user?.uid
                );
                const isActive = c.id === chatId;

                return (
                  <motion.button
                    key={c.id}
                    onClick={() => router.push(`/messages?chatId=${c.id}`)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-all ${
                      isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={otherUser?.photoURL}
                        alt={otherUser?.displayName}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      {otherUser?.isOnline && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-3 border-white rounded-full shadow-sm" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-baseline justify-between mb-1">
                        <p className="font-semibold text-gray-900 truncate text-base">
                          {otherUser?.displayName}
                        </p>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {c.lastMessageTime &&
                            new Date(
                              c.lastMessageTime.toDate()
                            ).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {c.lastMessage}
                        </p>
                        {c.unreadCount && c.unreadCount > 0 && (
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ZONE DE CHAT - Style Messenger */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {!chatId ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <MessageSquare className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Messagerie Woppy
            </h2>
            <p className="text-gray-600">
              Sélectionnez une conversation pour commencer
            </p>
          </div>
        ) : (
          <>
            {/* Header - Style moderne avec gradient */}
            <header className="h-[72px] px-5 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {isMobile && (
                  <button
                    onClick={() => router.push('/messages')}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ArrowLeft size={20} className="text-white" />
                  </button>
                )}
                {other && (
                  <Link
                    href={`/profile/${other.uid}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={other.photoURL}
                        alt={other.displayName}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white/50"
                      />
                      {other.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate text-base">
                        {other.displayName}
                      </p>
                    </div>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-1">
                {commonJobs.length > 0 && (
                  <button
                    onClick={() => setShowCommonJobs(!showCommonJobs)}
                    className="p-2.5 hover:bg-white/20 rounded-full transition-colors relative"
                    title={`${commonJobs.length} projet(s) en commun`}
                  >
                    <Briefcase size={20} className="text-white" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {commonJobs.length}
                    </span>
                  </button>
                )}
                <Menu as="div" className="relative">
                  <MenuButton className="p-2.5 hover:bg-white/20 rounded-full transition-colors">
                    <MoreVertical size={20} className="text-white" />
                  </MenuButton>
                  <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-10 border border-gray-100">
                    <MenuItem>
                      {({ active }: { active: boolean }) => (
                        <button
                          onClick={() =>
                            router.push(`/support?chatId=${chatId}`)
                          }
                          className={`${
                            active ? 'bg-red-50' : ''
                          } flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600`}
                        >
                          <TriangleAlert size={18} />
                          Signaler la conversation
                        </button>
                      )}
                    </MenuItem>
                  </Menu.Items>
                </Menu>
              </div>
            </header>

            {/* Panel projets - Design amélioré */}
            <AnimatePresence>
              {showCommonJobs && commonJobs.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100"
                >
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Briefcase size={18} className="text-blue-600" />
                        {commonJobs.length} projet
                        {commonJobs.length > 1 ? 's' : ''} en commun
                      </p>
                      <button
                        onClick={() => setShowCommonJobs(false)}
                        className="p-1 hover:bg-white/50 rounded-full transition-colors"
                      >
                        <X size={16} className="text-gray-600" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {commonJobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {job.title || 'Sans titre'}
                            </p>
                            {job.status && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {job.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages - Style WhatsApp avec fond personnalisé */}
            <div
              className="flex-1 overflow-y-auto px-5 py-4"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#f8fafc',
              }}
            >
              <div className="max-w-4xl mx-auto space-y-6">
                {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                  <div key={dateKey}>
                    {/* Date separator */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-100">
                        {formatMessageDate(new Date(dateKey))}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-2">
                      {msgs.map((msg, idx) => {
                        const isOwn = msg.senderId === user?.uid;
                        const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                        const nextMsg =
                          idx < msgs.length - 1 ? msgs[idx + 1] : null;
                        const showAvatar =
                          !nextMsg || nextMsg.senderId !== msg.senderId;
                        const isFirstInGroup =
                          !prevMsg || prevMsg.senderId !== msg.senderId;
                        const isLastInGroup = showAvatar;

                        if (msg.type === 'system') {
                          return (
                            <div
                              key={msg.id}
                              className="flex justify-center my-4"
                            >
                              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-gray-600 shadow-sm border border-gray-100 max-w-md text-center">
                                {msg.text}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${
                              isOwn ? 'justify-end' : 'justify-start'
                            } ${isFirstInGroup ? 'mt-2' : 'mt-0.5'}`}
                          >
                            <div
                              className={`flex gap-2 max-w-[75%] ${
                                isOwn ? 'flex-row-reverse' : 'flex-row'
                              }`}
                            >
                              {/* Avatar (seulement sur dernier message du groupe) */}
                              {!isOwn && (
                                <div className="w-8 h-8 flex-shrink-0">
                                  {showAvatar && (
                                    <img
                                      src={other?.photoURL}
                                      alt={other?.displayName}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  )}
                                </div>
                              )}

                              <div className="flex flex-col">
                                <div className="group relative">
                                  {/* ✅ AFFICHAGE DES IMAGES avec fond gris */}
                                  {msg.type === 'file' && isImageFile(msg.fileName) ? (
                                    <a
                                      href={msg.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block p-1.5 bg-gray-200 rounded-2xl hover:bg-gray-300 transition-colors"
                                      style={{
                                        borderTopRightRadius:
                                          isOwn && isFirstInGroup ? '16px' : isOwn ? '4px' : '16px',
                                        borderTopLeftRadius:
                                          !isOwn && isFirstInGroup ? '16px' : !isOwn ? '4px' : '16px',
                                        borderBottomRightRadius:
                                          isOwn && isLastInGroup ? '16px' : isOwn ? '4px' : '16px',
                                        borderBottomLeftRadius:
                                          !isOwn && isLastInGroup ? '16px' : !isOwn ? '4px' : '16px',
                                      }}
                                    >
                                      <img
                                        src={msg.fileUrl}
                                        alt={msg.fileName}
                                        className="max-w-[260px] md:max-w-xs rounded-xl shadow-md object-cover"
                                      />
                                    </a>
                                  ) : (
                                    <div
                                      className={`px-4 py-2 ${
                                        isOwn
                                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm shadow-md'
                                          : 'bg-white text-gray-900 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100'
                                      }`}
                                      style={{
                                        borderTopRightRadius:
                                          isOwn && isFirstInGroup ? '16px' : isOwn ? '4px' : '16px',
                                        borderTopLeftRadius:
                                          !isOwn && isFirstInGroup ? '16px' : !isOwn ? '4px' : '16px',
                                        borderBottomRightRadius:
                                          isOwn && isLastInGroup ? '16px' : isOwn ? '4px' : '16px',
                                        borderBottomLeftRadius:
                                          !isOwn && isLastInGroup ? '16px' : !isOwn ? '4px' : '16px',
                                      }}
                                    >
                                      {msg.type === 'file' ? (
                                        <a
                                          href={msg.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2 text-sm hover:underline ${
                                            isOwn ? 'text-white' : 'text-blue-600'
                                          }`}
                                        >
                                          <Paperclip size={16} />
                                          <span className="font-medium">{msg.fileName}</span>
                                        </a>
                                      ) : (
                                        <p className="text-[15px] leading-relaxed break-words">
                                          {msg.text}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {/* Menu contextuel */}
                                  <Menu
                                    as="div"
                                    className={`absolute ${
                                      isOwn
                                        ? 'left-0 -translate-x-full'
                                        : 'right-0 translate-x-full'
                                    } top-0 opacity-0 group-hover:opacity-100 transition-opacity`}
                                  >
                                    <MenuButton className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 mx-2">
                                      <MoreVertical className="w-4 h-4 text-gray-600" />
                                    </MenuButton>
                                    <Menu.Items
                                      className={`absolute ${
                                        isOwn ? 'right-0' : 'left-0'
                                      } mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-10`}
                                    >
                                      <MenuItem>
                                        {({ active }: { active: boolean }) => (
                                          <button
                                            onClick={() => reportMessage(msg)}
                                            className={`${
                                              active ? 'bg-red-50' : ''
                                            } flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600`}
                                          >
                                            <Flag size={14} />
                                            Signaler
                                          </button>
                                        )}
                                      </MenuItem>
                                    </Menu.Items>
                                  </Menu>
                                </div>

                                {/* Heure et statut */}
                                {showAvatar && (
                                  <div
                                    className={`flex items-center gap-1 mt-1 px-1 text-xs text-gray-500 ${
                                      isOwn ? 'justify-end' : 'justify-start'
                                    }`}
                                  >
                                    <span>
                                      {msg.createdAt &&
                                        new Date(
                                          msg.createdAt.toDate()
                                        ).toLocaleTimeString('fr-FR', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                    </span>
                                    {isOwn && (
                                      <MessageStatus
                                        message={msg}
                                        userId={user?.uid || ''}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Indicateur de saisie */}
                <AnimatePresence>
                  {otherTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-2">
                        <img
                          src={other?.photoURL}
                          alt={other?.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm border border-gray-100">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            />
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.4s' }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Zone de saisie - Style Messenger moderne */}
            <div className="px-5 py-4 bg-white border-t border-gray-100">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end gap-2">
                  <div className="flex gap-1">
                    <label className="p-2.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
                      <Paperclip size={22} className="text-blue-600" />
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Écrivez un message..."
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="w-full px-5 py-3 text-[15px] text-gray-600 bg-gray-100 border border-transparent rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                      <Smile size={20} className="text-gray-600" />
                    </button>
                  </div>

                  <button
                    onClick={() => sendMessage()}
                    disabled={sending || !newMessage.trim()}
                    className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}