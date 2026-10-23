import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';

/* ── Serialize (Timestamp → ms) ── */
function serialize(snap: admin.firestore.QuerySnapshot) {
  return snap.docs.map((d) => {
    const out: Record<string, any> = { id: d.id };
    for (const [k, v] of Object.entries(d.data())) {
      out[k] = v instanceof admin.firestore.Timestamp ? v.toMillis() : v;
    }
    return out;
  });
}

/* ── GET /api/admin/analytics ── */
export async function GET(req: NextRequest) {
  const adminDb = getAdminDb();
  /* 1. Vérif token */
  const token = req.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    /* 2. Vérifie que c'est bien un admin/collaborator */
    const decoded  = await getAdminAuth().verifyIdToken(token);
    const userSnap = await adminDb.collection('users').doc(decoded.uid).get();
    const role     = userSnap.data()?.role;

    if (role !== 'admin' && role !== 'collaborator') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    /* 3. Fetch toutes les collections */
    const [
      usersSnap,
      annoncesSnap,
      candidaturesSnap,
      reportsSnap,
      resolvedSnap,
      reviewsSnap,
    ] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('annonces').orderBy('createdAt', 'desc').get(),
      adminDb.collection('candidatures').get(),
      adminDb.collection('reports').get(),
      adminDb.collection('reportsResolved').orderBy('resolvedAt', 'desc').get(),
      adminDb.collection('reviews').get(),
    ]);

    return NextResponse.json({
      users:        serialize(usersSnap),
      annonces:     serialize(annoncesSnap),
      candidatures: serialize(candidaturesSnap),
      reports:      serialize(reportsSnap),
      resolved:     serialize(resolvedSnap),
      reviews:      serialize(reviewsSnap),
    });

  } catch (err: any) {
    console.error('Analytics API error:', err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? 'Erreur serveur' }, { status: 500 });
  }
}