import * as admin from 'firebase-admin';

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0]!;

  const privateKey = process.env['FIREBASE_ADMIN_PRIVATE_KEY'];
  if (!privateKey) throw new Error('FIREBASE_ADMIN_PRIVATE_KEY is not set');

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env['FIREBASE_ADMIN_PROJECT_ID']!,
      clientEmail: process.env['FIREBASE_ADMIN_CLIENT_EMAIL']!,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminDb = getAdminApp().firestore();