// functions/index.js
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

exports.sendPushFromNotification = onDocumentCreated(
  "notifications/{notifId}",
  async (event) => {
    const notif = event.data.data();
    const userId = notif.toUser;

    if (!userId) return;

    const userSnap = await db.doc(`users/${userId}`).get();
    const token = userSnap.data()?.fcmToken;

    if (!token) {
      console.log("⚠️ Aucun token FCM pour", userId);
      return;
    }

    await messaging.send({
      token,
      notification: {
        title: notif.title || "Woppy",
        body: notif.message || "Nouvelle notification",
      },
      data: {
        type: notif.type || "generic",
        id: event.params.notifId,
      },
      webpush: {
        fcmOptions: {
          link: notif.link || "/dashboard",
        },
      },
    });

    console.log("🎉 Notification push envoyée à", userId);
  }
);
