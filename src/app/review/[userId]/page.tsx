'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import Link from 'next/link';
import { ArrowLeft, Star, Loader2, CheckCircle } from 'lucide-react';

export default function ReviewPage() {
  const { userId } = useParams();
  const searchParams = useSearchParams();
  const annonceId = searchParams.get('annonceId'); // ✅ récupère l’annonce liée
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Authentification
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // Charger le profil de l’étudiant évalué
  useEffect(() => {
    async function fetchUser() {
      if (!userId) return;
      try {
        const ref = doc(db, 'users', userId as string);
        const snap = await getDoc(ref);
        if (snap.exists()) setTarget(snap.data());
      } catch (err) {
        console.error('Erreur chargement utilisateur :', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  // ✅ Soumission de la review
  async function handleSubmit() {
    if (!rating || !comment.trim() || !user || !annonceId) {
      alert("Veuillez noter et écrire un commentaire avant d'envoyer.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        annonceId,              // requis par les règles Firestore
        reviewerId: user.uid,   // auteur de l'annonce
        reviewedId: userId,     // étudiant évalué
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      setTimeout(() => router.push('/jobs'), 2000);
    } catch (err) {
      console.error('Erreur lors de l’envoi de la review :', err);
      alert("Impossible d'envoyer l'évaluation. Vérifie tes permissions.");
    } finally {
      setSubmitting(false);
    }
  }

  // État : chargement
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-[#8a6bfe]" /> Chargement...
      </div>
    );

  // État : utilisateur introuvable
  if (!target)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-700">
        <p>Utilisateur introuvable.</p>
        <Link href="/jobs" className="mt-4 text-[#8a6bfe] hover:underline">
          Retour
        </Link>
      </div>
    );

  // État : review envoyée
  if (submitted)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#f9f5ff] to-[#e8d5ff] text-gray-800">
        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
        <h2 className="text-xl font-semibold">Évaluation envoyée !</h2>
        <p className="text-sm text-gray-600 mt-2">Merci d’avoir laissé votre avis 🙌</p>
      </div>
    );

  // === Page principale ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-gray-900">
      <div className="max-w-lg mx-auto px-4 py-10">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] mb-8"
        >
          <ArrowLeft size={18} /> Retour
        </Link>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-center">
          <h1 className="text-2xl font-bold mb-3 text-[#8a6bfe]">
            Laisser une évaluation
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Pour{' '}
            <span className="font-medium text-[#8a6bfe]">
              {target.firstName} {target.lastName}
            </span>
          </p>

          {/* ⭐ Note */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={30}
                onClick={() => setRating(n)}
                className={`cursor-pointer transition ${
                  n <= rating
                    ? 'fill-[#8a6bfe] text-[#8a6bfe]'
                    : 'text-gray-300 hover:text-[#8a6bfe]/60'
                }`}
              />
            ))}
          </div>

          {/* 💬 Commentaire */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-[#8a6bfe] focus:ring-2 focus:ring-[#8a6bfe]/30 transition mb-6"
            rows={5}
          />

          <button
            onClick={handleSubmit}
            disabled={submitting || !rating || !comment.trim()}
            className="w-full bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Envoi...
              </span>
            ) : (
              'Envoyer mon avis'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
