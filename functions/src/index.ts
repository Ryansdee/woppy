import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// Initialiser Firebase Admin
initializeApp();

const db = getFirestore();
const messaging = getMessaging();

// Trigger quand une notification est créée
export const sendPushNotification = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("Pas de données dans le snapshot");
      return null;
    }

    const notification = snapshot.data();
    const notificationId = event.params.notificationId;

    console.log(`Nouvelle notification créée: ${notificationId}`, notification);

    // Récupérer le token FCM de l'utilisateur destinataire
    const userDoc = await db.collection("users").doc(notification.toUser).get();

    if (!userDoc.exists) {
      console.log("Utilisateur non trouvé:", notification.toUser);
      return null;
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;

    if (!fcmToken) {
      console.log("Pas de token FCM pour cet utilisateur:", notification.toUser);
      return null;
    }

    // Vérifier si les notifications sont activées
    if (userData?.notificationsEnabled === false) {
      console.log("Notifications désactivées pour:", notification.toUser);
      return null;
    }

    // Construire le titre selon le type
    const getTitle = (type: string): string => {
      switch (type) {
        case "message":
          return "💬 Nouveau message";
        case "job":
          return "💼 Nouvelle annonce";
        case "application":
          return "👤 Nouvelle candidature";
        case "review":
          return "⭐ Nouvel avis";
        case "payment":
          return "💰 Paiement";
        case "alert":
          return "⚠️ Alerte";
        default:
          return "🔔 Notification Woppy";
      }
    };

    // Construire l'URL de redirection
    const getClickAction = (): string => {
      if (notification.chatId) {
        return `/messages?chatId=${notification.chatId}`;
      }
      if (notification.annonceId) {
        return `/jobs/${notification.annonceId}`;
      }
      return "/notifications";
    };

    // Construire le message FCM
    const message = {
      token: fcmToken,
      notification: {
        title: getTitle(notification.type || "system"),
        body: notification.message || "Vous avez une nouvelle notification",
      },
      data: {
        type: notification.type || "system",
        chatId: notification.chatId || "",
        annonceId: notification.annonceId || "",
        fromUser: notification.fromUser || "",
        notificationId: notificationId,
        click_action: getClickAction(),
      },
      webpush: {
        notification: {
          icon: "/icons/icon-192.png",
          badge: "/icons/badge-72.png",
          tag: notification.chatId || notification.annonceId || notificationId,
          renotify: true,
        },
        fcmOptions: {
          link: getClickAction(),
        },
      },
      android: {
        notification: {
          icon: "ic_notification",
          color: "#8a6bfe",
          clickAction: getClickAction(),
          channelId: notification.type === "message" ? "messages" : "default",
        },
        priority: "high" as const,
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: "default",
            category: notification.type || "default",
          },
        },
      },
    };

    try {
      const response = await messaging.send(message);
      console.log("Push envoyé avec succès:", response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error("Erreur envoi push:", error);

      // Si le token est invalide, le supprimer
      if (
        error instanceof Error &&
        (error.message.includes("not registered") ||
          error.message.includes("invalid-registration-token"))
      ) {
        console.log("Token invalide, suppression...");
        await db.collection("users").doc(notification.toUser).update({
          fcmToken: null,
          notificationsEnabled: false,
        });
      }

      return { success: false, error: String(error) };
    }
  }
);

// Optionnel: Fonction pour envoyer des notifications groupées
export const sendBulkNotifications = onDocumentCreated(
  "bulkNotifications/{batchId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;

    const batch = snapshot.data();
    const userIds: string[] = batch.userIds || [];
    const notificationData = batch.notification;

    console.log(`Envoi groupé à ${userIds.length} utilisateurs`);

    const results = await Promise.allSettled(
      userIds.map(async (userId: string) => {
        const userDoc = await db.collection("users").doc(userId).get();
        const fcmToken = userDoc.data()?.fcmToken;

        if (!fcmToken) return { userId, success: false, reason: "no_token" };

        try {
          await messaging.send({
            token: fcmToken,
            notification: {
              title: notificationData.title,
              body: notificationData.body,
            },
            data: notificationData.data || {},
          });
          return { userId, success: true };
        } catch (error) {
          return { userId, success: false, reason: String(error) };
        }
      })
    );

    console.log("Résultats envoi groupé:", results);
    return { processed: userIds.length, results };
  }
);