import * as admin from 'firebase-admin';

/* Init à la première utilisation : le build n'a pas besoin des clés serveur */
function getAdminApp() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin.app();
}

export const getAdminDb   = () => getAdminApp().firestore();
export const getAdminAuth = () => getAdminApp().auth();
