/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDiCO3SxXHrHvhylwhfTC-waLQkwbChYic",
  authDomain: "woppy-app.firebaseapp.com",
  projectId: "woppy-app",
  messagingSenderId: "258579849595",
  appId: "1:258579849595:web:84a09e53c16244f00dddde",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icons/icon-192.png",
  });
});
