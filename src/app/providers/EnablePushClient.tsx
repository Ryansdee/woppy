// app/providers/EnablePushClient.tsx
'use client';

import { useEffect } from "react";
import { messaging, db, auth } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { updateDoc, doc } from "firebase/firestore";

export default function EnablePushClient() {
  useEffect(() => {
    async function enablePush() {
      if (!messaging) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        fcmToken: token,
      });
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) enablePush();
    });

    return () => unsubscribe();
  }, []);

  return null;
}
