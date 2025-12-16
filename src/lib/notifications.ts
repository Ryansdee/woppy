// lib/notifications.ts
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function requestNotificationPermission(userId: string) {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Permission refusée');
      return null;
    }

    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: 'TA_CLE_VAPID_ICI' // Depuis Firebase Console
    });

    // Sauvegarder le token dans Firestore
    await updateDoc(doc(db, 'users', userId), {
      fcmToken: token,
      notificationsEnabled: true
    });

    return token;
  } catch (error) {
    console.error('Erreur notification permission:', error);
    return null;
  }
}

// Écouter les messages en foreground
export function onForegroundMessage(callback: (payload: any) => void) {
  const messaging = getMessaging();
  return onMessage(messaging, callback);
}