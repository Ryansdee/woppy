import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, updateDoc, doc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixOldChats() {
  const snap = await getDocs(collection(db, "chats"));

  for (const c of snap.docs) {
    const data = c.data();

    // 1. Fix participants
    let participants = data.participants;
    if (!Array.isArray(participants)) {
      participants = Object.keys(participants || {});
    }

    // 2. Fix lastMessageTime
    const lastMessageTime =
      data.lastMessageTime || data.createdAt || serverTimestamp();

    // 3. Fix lastMessage
    const lastMessage = data.lastMessage || "";

    await updateDoc(doc(db, "chats", c.id), {
      participants,
      lastMessageTime,
      lastMessage
    });

    console.log("Chat corrigé:", c.id);
  }

  console.log("Tous les chats ont été corrigés !");
}

fixOldChats();
