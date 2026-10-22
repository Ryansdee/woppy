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

/* ── Limites ── */
const MAX_NAME    = 50;
const MAX_COMMENT = 1000;
const MIN_COMMENT = 10;

const isAlreadyExists = (e: unknown) =>
  typeof e === 'object' && e !== null && (e as { code?: number }).code === 6;

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

/* ── POST /api/reviews ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
    }

    /* Honeypot anti-bot : champ invisible, doit rester vide */
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ success: true });
    }

    const rating    = Number(body.rating);
    const comment   = clean(body.comment, MAX_COMMENT);
    const annonceId = clean(body.annonceId, 128);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide.' }, { status: 400 });
    }
    if (comment.length < MIN_COMMENT) {
      return NextResponse.json({ error: `Commentaire trop court (${MIN_COMMENT} caractères minimum).` }, { status: 400 });
    }
    if (!annonceId) {
      return NextResponse.json({ error: 'Mission manquante.' }, { status: 400 });
    }

    /* La mission doit exister et être terminée */
    const annonceSnap = await adminDb.collection('annonces').doc(annonceId).get();
    if (!annonceSnap.exists) {
      return NextResponse.json({ error: 'Mission introuvable.' }, { status: 404 });
    }
    const annonce = annonceSnap.data()!;
    if (annonce.statut !== 'fini') {
      return NextResponse.json({ error: 'Seules les missions terminées peuvent être évaluées.' }, { status: 400 });
    }

    /* Titre et lieu toujours lus en base, jamais depuis le client */
    const annonceTitre = typeof annonce.titre === 'string' ? annonce.titre : '';
    const annonceLieu  = typeof annonce.lieu  === 'string' ? annonce.lieu  : '';

    /* ── Avis authentifié (étudiant ↔ demandeur) ── */
    if (body.type === 'user') {
      const token = req.headers.get('authorization')?.split('Bearer ')[1];
      if (!token) {
        return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
      }
      const decoded    = await admin.auth().verifyIdToken(token);
      const reviewedId = clean(body.reviewedId, 128);

      if (!reviewedId || reviewedId === decoded.uid) {
        return NextResponse.json({ error: 'Utilisateur cible invalide.' }, { status: 400 });
      }

      /* Seuls les deux participants de la mission peuvent s'évaluer entre eux */
      const participants = [annonce.userId, annonce.acceptedUserId];
      if (!participants.includes(decoded.uid) || !participants.includes(reviewedId)) {
        return NextResponse.json({ error: 'Vous ne pouvez pas évaluer cette mission.' }, { status: 403 });
      }

      /* Un seul avis par personne et par mission (ID déterministe) */
      try {
        await adminDb.collection('reviews').doc(`${annonceId}_${decoded.uid}`).create({
          source: 'user',
          status: 'approved',
          annonceId,
          annonceTitre,
          annonceLieu,
          reviewerId: decoded.uid,
          reviewedId,
          rating,
          comment,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (e) {
        if (isAlreadyExists(e)) {
          return NextResponse.json({ error: 'Vous avez déjà évalué cette mission.' }, { status: 409 });
        }
        throw e;
      }

      return NextResponse.json({ success: true });
    }

    /* ── Avis public (sans compte) → en attente de modération ── */
    const firstName = clean(body.firstName, MAX_NAME);
    const lastName  = clean(body.lastName, MAX_NAME);
    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Prénom et nom requis.' }, { status: 400 });
    }

    /* Un seul avis public par mission (ID déterministe) */
    try {
      await adminDb.collection('reviews').doc(`public_${annonceId}`).create({
        source: 'public',
        status: 'pending',
        firstName,
        lastName,
        annonceId,
        annonceTitre,
        annonceLieu,
        rating,
        comment,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      if (isAlreadyExists(e)) {
        return NextResponse.json({ error: 'Un avis a déjà été déposé pour cette mission.' }, { status: 409 });
      }
      throw e;
    }

    return NextResponse.json({ success: true, pending: true });
  } catch (err) {
    console.error('Reviews API error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}