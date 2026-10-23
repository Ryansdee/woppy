import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/* Renvoie la conversation existante entre deux utilisateurs, ou en crée une */
export async function openChat(me: string, other: string, annonceId?: string): Promise<string> {
  const mine = await getDocs(query(collection(db, 'chats'), where('participants', 'array-contains', me)));
  const existing = mine.docs.find((d) => (d.data().participants as string[]).includes(other));
  if (existing) return existing.id;
  const created = await addDoc(collection(db, 'chats'), {
    participants: [me, other],
    ...(annonceId ? { annonceId } : {}),
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
    typing: {},
  });
  return created.id;
}
