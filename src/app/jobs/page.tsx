'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Euro,
  Clock,
  Calendar,
  Filter,
  Briefcase,
  Plus,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Annonce {
  id: string;
  description: string;
  date: string;
  duree: string;
  lieu: string;
  remuneration: number;
  statut: string;
  userId: string;
  createdAt?: any;
}

const categories = [
  'Tous',
  'Déménagement',
  'Baby-sitting',
  'Cours particuliers',
  'Jardinage',
  'Événementiel',
  'Ménage',
  'Autre',
];

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterMaxRate, setFilterMaxRate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Vérifie si l'utilisateur est connecté
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/auth/login');
    });
    return () => unsub();
  }, [router]);

  // Récupère les annonces Firestore
  useEffect(() => {
    async function fetchAnnonces() {
      try {
        const q = query(collection(db, 'annonces'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Annonce[];
        setAnnonces(data);
      } catch (err) {
        console.error('Erreur Firestore :', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnonces();
  }, []);

  const filtered = annonces.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchDesc = a.description?.toLowerCase().includes(q);
    const matchCity = !filterCity || a.lieu?.toLowerCase().includes(filterCity.toLowerCase());
    const matchRate = !filterMaxRate || Number(a.remuneration) <= parseFloat(filterMaxRate);
    return matchDesc && matchCity && matchRate;
  });

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-[#8a6bfe]" />
        Chargement des annonces...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] to-white text-gray-900">
      {/* Hero Section */}
      <section className="py-12 px-6 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase size={32} />
            <h1 className="text-4xl font-bold">Toutes les annonces</h1>
          </div>
          <p className="text-lg opacity-90 mb-8">
            Découvre les dernières opportunités publiées sur Woppy
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une annonce..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 justify-center"
            >
              <Filter size={20} />
              Filtres
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ville</label>
                  <input
                    type="text"
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    placeholder="Ex: Louvain-la-Neuve"
                    className="w-full px-4 py-2 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rémunération max (€)</label>
                  <input
                    type="number"
                    value={filterMaxRate}
                    onChange={(e) => setFilterMaxRate(e.target.value)}
                    placeholder="Ex: 20"
                    className="w-full px-4 py-2 rounded-lg text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Liste des annonces */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filtered.length}</span> annonce(s)
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={16} />
              <span>Trié par plus récentes</span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-xl text-gray-500">Aucune annonce trouvée</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCity('');
                  setFilterMaxRate('');
                }}
                className="mt-4 text-[#8a6bfe] hover:underline font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <Link
                  key={a.id}
                  href={`/jobs/${a.id}`}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#8a6bfe] transition block"
                >
                  <div className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-[#8a6bfe]">
                          {a.description.slice(0, 60)}...
                        </h3>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            a.statut === 'ouverte'
                              ? 'bg-green-100 text-green-700'
                              : a.statut === 'en cours'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {a.statut}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {a.description}
                      </p>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                        <span className="flex items-center gap-1">
                          <MapPin size={16} className="text-[#8a6bfe]" />
                          {a.lieu}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={16} className="text-[#8a6bfe]" />
                          {a.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} className="text-[#8a6bfe]" />
                          {a.duree}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1 text-[#8a6bfe] font-semibold">
                        <Euro size={16} />
                        {a.remuneration} €/h
                      </span>
                      <span className="text-sm text-gray-500">Voir l’annonce →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Tu veux publier une annonce ?</h2>
          <p className="text-lg opacity-90 mb-8">
            Mets ton offre en ligne et trouve un étudiant motivé près de chez toi.
          </p>
          <Link
            href="/annonces/nouvelle"
            className="bg-white text-[#8a6bfe] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition inline-flex items-center gap-2"
          >
            <Plus size={22} />
            Publier une annonce
          </Link>
        </div>
      </section>
    </div>
  );
}
