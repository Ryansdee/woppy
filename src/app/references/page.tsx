'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ThumbsUp,
  TrendingUp,
  Award,
  Users,
  MessageCircle,
} from 'lucide-react';

// Firebase
import { db, auth } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';

interface User {
  id: string;
  name: string;
  type: 'student' | 'employer';
}

interface Reference {
  id: string;
  rating: number;
  comment: string;
  authorId: string;
  authorName: string;
  recipientId: string;
  recipientName: string;
  recipientType: 'student' | 'employer';
  jobTitle: string;
  date: any;
  helpful: number;
  verified: boolean;
}

export default function ReferencesPage() {
  const [user] = useAuthState(auth);

  // Firestore data
  const [references, setReferences] = useState<Reference[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // Form
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);

  // Filters
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'student' | 'employer'>('all');

  // Load all users
  useEffect(() => {
    async function loadUsers() {
      const snap = await getDocs(collection(db, 'users'));

      const list = snap.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          name: `${data.firstName} ${data.lastName}`,
          type: (data.hasStudentProfile ? 'student' : 'employer') as 'student' | 'employer',
        };
      });

      setUsersList(list);

    }

    loadUsers();
  }, []);

  // Load all references in realtime
  useEffect(() => {
    const q = query(collection(db, 'references'), orderBy('date', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Reference[];

      setReferences(list);
    });

    return () => unsub();
  }, []);

  // Add review
  async function handleAddReference() {
    if (!user) return alert('Vous devez être connecté.');
    if (!commentInput.trim()) return alert('Veuillez écrire un commentaire.');
    if (!recipientId) return alert('Sélectionnez un destinataire.');
    if (!jobTitleInput.trim()) return alert('Entrez un intitulé de mission.');

    setLoadingAdd(true);

    const recipient = usersList.find((u) => u.id === recipientId);

    if (!recipient) {
      alert('Destinataire introuvable.');
      setLoadingAdd(false);
      return;
    }

    try {
      await addDoc(collection(db, 'references'), {
        rating: ratingInput,
        comment: commentInput,
        authorId: user.uid,
        authorName: user.displayName || 'Utilisateur',
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientType: recipient.type,
        jobTitle: jobTitleInput,
        verified: true,
        helpful: 0,
        date: serverTimestamp(),
      });

      setRatingInput(5);
      setCommentInput('');
      setRecipientId('');
      setJobTitleInput('');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi.");
    }

    setLoadingAdd(false);
  }

  // LIKE / UTILE system
  async function handleLike(referenceId: string) {
    const ref = doc(db, 'references', referenceId);

    try {
      await updateDoc(ref, {
        helpful: increment(1),
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Filtered references
  const filteredReferences = references.filter((ref) => {
    const matchRating =
      filterRating === null ? true : ref.rating === filterRating;

    const matchType =
      filterType === 'all'
        ? true
        : filterType === 'student'
        ? ref.recipientType === 'student'
        : ref.recipientType === 'employer';

    return matchRating && matchType;
  });

  const totalReviews = references.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : (
          references.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        ).toFixed(1);
  const fiveStars = references.filter((r) => r.rating === 5).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] to-white">

      {/* HERO */}
      <section className="py-12 px-6 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Award size={32} />
            <h1 className="text-4xl font-bold">Références & avis</h1>
          </div>
          <p className="text-xl opacity-90 mb-8">
            Découvrez et partagez les expériences de la communauté.
          </p>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <MessageCircle size={32} className="mx-auto mb-3" />
              <p className="text-3xl font-bold">{totalReviews}</p>
              <p className="text-sm opacity-90">Avis</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <Star size={32} className="mx-auto mb-3 fill-yellow-400 text-yellow-400" />
              <p className="text-3xl font-bold">{averageRating}/5</p>
              <p className="text-sm opacity-90">Note moyenne</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <TrendingUp size={32} className="mx-auto mb-3" />
              <p className="text-3xl font-bold">{fiveStars}</p>
              <p className="text-sm opacity-90">Avis 5 étoiles</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <Users size={32} className="mx-auto mb-3" />
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm opacity-90">Vérifiés</p>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULAIRE AJOUT */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Laisser un avis</h2>

          {!user && (
            <p className="text-red-600 mb-6">
              Vous devez être connecté pour publier un avis.
            </p>
          )}

          <div className="grid gap-4">
            <label className="text-sm font-medium">Destinataire</label>
            <select
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="p-3 border rounded-xl"
            >
              <option value="">Choisir un utilisateur</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.type === 'student' ? 'Étudiant' : 'Employeur'})
                </option>
              ))}
            </select>

            <label className="text-sm font-medium">Intitulé de la mission</label>
            <input
              type="text"
              value={jobTitleInput}
              onChange={(e) => setJobTitleInput(e.target.value)}
              className="p-3 border rounded-xl"
              placeholder="Ex: Aide au déménagement"
            />

            <label className="text-sm font-medium">Note</label>
            <select
              value={ratingInput}
              onChange={(e) => setRatingInput(Number(e.target.value))}
              className="p-3 border rounded-xl"
            >
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} étoile(s)
                </option>
              ))}
            </select>

            <label className="text-sm font-medium">Commentaire</label>
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="p-3 border rounded-xl"
              rows={4}
              placeholder="Décrivez votre expérience"
            />

            <button
              onClick={handleAddReference}
              disabled={!user || loadingAdd}
              className="bg-[#8a6bfe] text-white py-3 rounded-xl font-medium hover:bg-[#7d61f5] transition"
            >
              {loadingAdd ? 'Publication...' : 'Publier l’avis'}
            </button>
          </div>
        </div>
      </section>

      {/* LISTE DES AVIS */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">

          <p className="text-gray-600 mb-6">
            <span className="font-semibold">{filteredReferences.length}</span> avis trouvé(s)
          </p>

          <div className="space-y-6">
            {filteredReferences.map((reference) => (
              <div key={reference.id} className="bg-white rounded-2xl shadow p-6">

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full flex items-center justify-center text-white font-bold">
                      {reference.authorName
                        ?.split(' ')
                        ?.map((n) => n[0])
                        ?.join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{reference.authorName}</p>
                      <p className="text-sm text-gray-600">
                        A évalué{' '}
                        <span className="font-semibold">{reference.recipientName}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{reference.jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < reference.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>

                    <span className="text-xs text-gray-500">
                      {reference.date?.toDate?.().toLocaleDateString?.()}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-4">{reference.comment}</p>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <button
                    onClick={() => handleLike(reference.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition text-sm"
                  >
                    <ThumbsUp size={16} />
                    <span>Utile ({reference.helpful})</span>
                  </button>

                  <Link
                    href={`/profile/${reference?.authorId}`}
                    className="text-[#8a6bfe] hover:underline text-sm font-medium"
                  >
                    Voir profil →
                  </Link>
                </div>

              </div>
            ))}

            {filteredReferences.length === 0 && (
              <p className="text-center text-gray-500 py-20">
                Aucun avis pour le moment.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
