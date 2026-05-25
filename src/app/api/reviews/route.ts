import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = admin.firestore();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, rating, comment, annonceId } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide.' }, { status: 400 });
    }
    if (!comment?.trim()) {
      return NextResponse.json({ error: 'Commentaire manquant.' }, { status: 400 });
    }
    if (!annonceId) {
      return NextResponse.json({ error: 'Mission manquante.' }, { status: 400 });
    }

    if (type === 'user') {
      // Authenticated review targeting a specific user
      const token = req.headers.get('authorization')?.split('Bearer ')[1];
      if (!token) {
        return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
      }
      const decoded = await admin.auth().verifyIdToken(token);
      const { reviewedId, annonceTitre, annonceLieu } = body;
      if (!reviewedId) {
        return NextResponse.json({ error: 'Utilisateur cible manquant.' }, { status: 400 });
      }
      await adminDb.collection('reviews').add({
        annonceId,
        annonceTitre: annonceTitre || '',
        annonceLieu: annonceLieu || '',
        reviewerId: decoded.uid,
        reviewedId,
        rating,
        comment: comment.trim(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Public review (no auth required)
      const { firstName, lastName, annonceTitre, annonceLieu } = body;
      if (!firstName?.trim() || !lastName?.trim()) {
        return NextResponse.json({ error: 'Prénom et nom requis.' }, { status: 400 });
      }
      await adminDb.collection('reviews').add({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        annonceId,
        annonceTitre: annonceTitre || '',
        annonceLieu: annonceLieu || '',
        rating,
        comment: comment.trim(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Reviews API error:', err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? 'Erreur serveur' }, { status: 500 });
  }
}
