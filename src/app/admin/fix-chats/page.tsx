'use client';

import { useEffect } from "react";
import { getDocs, collection, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FixChatsPage() {

  useEffect(() => {
    async function fixOldChats() {
      const snap = await getDocs(collection(db, "chats"));
      snap.forEach(async chat => {
        const data = chat.data();

        if (!data.lastMessageTime) {
          await updateDoc(doc(db, "chats", chat.id), {
            lastMessageTime: data.createdAt || serverTimestamp(),
            lastMessage: data.lastMessage || "",
          });
        }
      });
      alert("Correction terminée !");
    }

    fixOldChats();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Fix Chats</h1>
      <p>Cette page corrige les anciens chats. Une fois fini, supprime-la.</p>
    </div>
  );
}
