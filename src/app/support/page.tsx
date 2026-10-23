'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, AlertTriangle, Send } from 'lucide-react';

function SupportContent() {
  const router = useRouter();
  const params = useSearchParams();
  const chatId = params.get('chatId');

  const [user, setUser] = useState<any>(null);
  const [chatData, setChatData] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, []);

  // Fetch chat + other participant
  useEffect(() => {
    if (!chatId || !user) return;

    (async () => {
      const snap = await getDoc(doc(db, 'chats', chatId));
      if (!snap.exists()) return;

      const data = snap.data();
      setChatData(data);

      const otherId = data.participants.find((p: string) => p !== user.uid);
      if (otherId) {
        const otherSnap = await getDoc(doc(db, 'users', otherId));
        setOtherUser(otherSnap.exists() ? otherSnap.data() : null);
      }
    })();
  }, [chatId, user]);

  async function sendReport(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setSending(true);

    await addDoc(collection(db, 'reports'), {
      reporterId: user.uid,
      chatId,
      otherUser: otherUser?.uid || null,
      category: 'support',
      text: message.trim(),
      createdAt: serverTimestamp(),
    });

    setSending(false);
    router.push('/messages');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbfaf7] via-white to-[#e8d5ff]/70 py-10 px-4 sm:px-6 text-ink">

      <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xl shadow-xl border border-[#e5d5ff] rounded-3xl p-6 sm:p-8">

        <button
          onClick={() => router.push(`/messages?chatId=${chatId}`)}
          className="flex items-center gap-2 text-[#7357f6] hover:text-[#6f52d9] mb-4"
        >
          <ArrowLeft size={20} /> Retour
        </button>

        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="text-[#b3261e]" size={28} />
          <h1 className="text-2xl font-bold text-ink">Signaler un problème</h1>
        </div>

        {/* Chat Summary */}
        {chatData && otherUser && (
          <div className="mb-6 bg-[#fbfaf7]/40 border border-[#e5d5ff] rounded-2xl p-4">
            <h2 className="font-semibold text-ink text-lg mb-3 flex items-center gap-2">
              <MessageSquare size={18} /> Conversation concernée
            </h2>

            <div className="flex items-center gap-3">
              <img
                src={
                  otherUser.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    otherUser?.firstName || 'U'
                  )}&background=8a6bfe&color=fff`
                }
                alt="User"
                className="w-12 h-12 rounded-full border border-[#ddc2ff]"
              />
              <div>
                <p className="font-semibold text-ink">
                  {otherUser?.displayName ||
                    `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim()}
                </p>
                <p className="text-sm text-ink-2">
                  Dernier message : {chatData.lastMessage || '…'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={sendReport} className="space-y-4">
          <div>
            <label className="font-medium text-ink">Décris ton problème *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Ex : comportement inapproprié, spam, problème sur le job, etc."
              className="mt-2 w-full border border-[#ddc2ff] bg-[#fbfaf7]/30 rounded-2xl p-4 focus:ring-2 focus:ring-[#7357f6] outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7357f6] to-[#a996fa] text-white font-medium py-3 rounded-2xl shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {sending ? (
              <Send className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send size={18} /> Envoyer le signalement
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-2">
          Notre équipe examine chaque signalement dans les plus brefs délais.
        </p>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement…</div>}>
      <SupportContent />
    </Suspense>
  );
}
