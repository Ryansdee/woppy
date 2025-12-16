/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDiCO3SxXHrHvhylwhfTC-waLQkwbChYic",
  authDomain: "woppy-app.firebaseapp.com",
  projectId: "woppy-app",
  storageBucket: "woppy-app.appspot.com",
  messagingSenderId: "258579849595",
  appId: "1:258579849595:web:84a09e53c16244f00dddde",
});

const messaging = firebase.messaging();

// Gestion des notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Message reçu en arrière-plan:", payload);

  // Extraire les données
  const notificationData = payload.notification || {};
  const data = payload.data || {};

  const title = notificationData.title || "Nouvelle notification Woppy";
  const body = notificationData.body || data.message || "";
  const icon = notificationData.icon || "/icons/icon-192.png";

  const options = {
    body,
    icon,
    badge: "/icons/badge-72.png",
    tag: data.chatId || data.annonceId || "woppy-notification",
    renotify: true,
    requireInteraction: data.type === "message",
    vibrate: [200, 100, 200],
    data: {
      type: data.type || "system",
      chatId: data.chatId || null,
      annonceId: data.annonceId || null,
      url: data.click_action || "/notifications",
    },
    actions: getNotificationActions(data.type),
  };

  self.registration.showNotification(title, options);
});

// Actions selon le type de notification
function getNotificationActions(type) {
  switch (type) {
    case "message":
      return [
        { action: "open", title: "Ouvrir", icon: "/icons/open.png" },
        { action: "dismiss", title: "Ignorer", icon: "/icons/close.png" },
      ];
    case "job":
    case "application":
      return [
        { action: "open", title: "Voir l'annonce", icon: "/icons/open.png" },
        { action: "dismiss", title: "Plus tard", icon: "/icons/close.png" },
      ];
    default:
      return [];
  }
}

// Gestion du clic sur la notification
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Clic sur notification:", event);

  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = "/notifications";

  // Déterminer l'URL selon le type
  if (event.action === "dismiss") {
    return;
  }

  if (data.chatId) {
    targetUrl = `/messages?chatId=${data.chatId}`;
  } else if (data.annonceId) {
    targetUrl = `/jobs/${data.annonceId}`;
  } else if (data.url) {
    targetUrl = data.url;
  }

  // Ouvrir ou focus la fenêtre
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Chercher si une fenêtre Woppy est déjà ouverte
        for (const client of clientList) {
          if (client.url.includes("woppy") && "focus" in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Gestion de la fermeture de notification
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification fermée:", event.notification.tag);
});

// Gestion de l'installation du service worker
self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker installé");
  self.skipWaiting();
});

// Gestion de l'activation
self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activé");
  event.waitUntil(clients.claim());
});