'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt?: any;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
});

export const useNotifications = () => useContext(NotificationsContext);

export default function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    const q = query(collection(db, 'notifications'), where('toUser', '==', userId));
    const unsub = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Notification[];
      setNotifications(notifs);
    });

    return () => unsub();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}
