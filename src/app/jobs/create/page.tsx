'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Calendar, MapPin, Euro, FileText, CheckCircle, Type } from 'lucide-react';
import Link from 'next/link';

export default function NouvelleAnnoncePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    titre: '',              // ✅ nouveau champ
    description: '',
    date: '',
    duree: '',
    lieu: '',
    remuneration: '',
    statut: 'ouverte',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      await addDoc(collection(db, 'annonces'), {
        ...form,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setMessage('Annonce publiée avec succès 🎉');
      setTimeout(() => router.push('/jobs'), 1200);
    } catch (err) {
      console.error('Erreur publication :', err);
      setMessage("Une erreur est survenue lors de la publication.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff] text-gray-900 flex flex-col">
      <nav className="p-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-[#8a6bfe] font-semibold hover:underline">
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Publier une annonce</h1>
      </nav>

      <main className="flex-1 px-6 py-12 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6"
        >
          {/* ✅ Champ titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Type size={18} /> Titre de l&apos;annonce <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titre"
              value={form.titre}
              onChange={handleChange}
              placeholder="Ex : Aide au déménagement, Babysitting, Cours de maths..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Décris le service demandé ou proposé..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition resize-none"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={18} /> Date du service <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée estimée (en heures)
              </label>
              <input
                type="number"
                name="duree"
                min="0.5"
                step="0.5"
                value={form.duree}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                placeholder="Ex : 2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={18} /> Lieu du service <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lieu"
                value={form.lieu}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                placeholder="Ville ou adresse"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Euro size={18} /> Rémunération proposée (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="remuneration"
                min="0"
                step="0.5"
                value={form.remuneration}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
                placeholder="Ex : 25"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={18} /> Statut de l&apos;annonce
            </label>
            <select
              name="statut"
              value={form.statut}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent transition"
            >
              <option value="ouverte">Ouverte</option>
              <option value="en cours">En cours</option>
              <option value="termine">Terminée</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Publication...</span>
              </>
            ) : (
              'Publier mon annonce'
            )}
          </button>

          {message && (
            <p
              className={`text-sm text-center mt-3 ${
                message.includes('succès') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <CheckCircle className="inline-block w-4 h-4 mr-1" />
              {message}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
