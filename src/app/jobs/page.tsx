'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Grid3x3,
  Map,
  X,
  ChevronRight,
  Sparkles,
  Users,
  Star,
  AlertCircle,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import dynamic from 'next/dynamic';

// ✅ Import dynamique (empêche l'erreur window is not defined)
const AnnoncesMap = dynamic(() => import('@/components/AnnoncesMap'), { ssr: false });

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

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterMaxRate, setFilterMaxRate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'recent' | 'price-high' | 'price-low'>('recent');
  const router = useRouter();

  // 🔒 Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/auth/login');
    });
    return () => unsub();
  }, [router]);

  // 🔄 Charger les annonces Firestore
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

  // Filtrage et tri optimisés avec useMemo
  const filteredAndSorted = useMemo(() => {
    let result = annonces.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchDesc = a.description?.toLowerCase().includes(q);
      const matchCity = !filterCity || a.lieu?.toLowerCase().includes(filterCity.toLowerCase());
      const matchRate = !filterMaxRate || Number(a.remuneration) <= parseFloat(filterMaxRate);
      const matchStatus = filterStatus === 'all' || a.statut === filterStatus;
      return matchDesc && matchCity && matchRate && matchStatus;
    });

    // Tri
    switch (sortBy) {
      case 'price-high':
        result.sort((a, b) => Number(b.remuneration) - Number(a.remuneration));
        break;
      case 'price-low':
        result.sort((a, b) => Number(a.remuneration) - Number(b.remuneration));
        break;
      default:
        // Tri par défaut : plus récent
        break;
    }

    return result;
  }, [annonces, searchQuery, filterCity, filterMaxRate, filterStatus, sortBy]);

  // Compter les filtres actifs
  const activeFiltersCount = [filterCity, filterMaxRate, filterStatus !== 'all'].filter(Boolean).length;

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setFilterCity('');
    setFilterMaxRate('');
    setFilterStatus('all');
    setSortBy('recent');
  };

  // Stats pour le header
  const stats = useMemo(() => ({
    total: annonces.length,
    open: annonces.filter(a => a.statut === 'ouverte').length,
    avgRate: annonces.length ? (annonces.reduce((sum, a) => sum + Number(a.remuneration), 0) / annonces.length).toFixed(1) : 0,
  }), [annonces]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f5e5ff] to-white">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="animate-spin w-12 h-12 mb-4 text-[#8a6bfe] mx-auto" />
            <div className="absolute inset-0 blur-xl bg-[#8a6bfe]/20 animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">Chargement des annonces...</p>
          <p className="text-sm text-gray-400 mt-2">Recherche des meilleures opportunités</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] via-white to-gray-50 text-gray-900">
      {/* HEADER avec stats */}
      <section className="relative py-16 px-6 bg-gradient-to-br from-[#8a6bfe] via-[#9b7ffe] to-[#b89fff] text-white overflow-hidden">
        {/* Motif décoratif */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          {/* Titre et stats */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Briefcase size={28} />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold">Annonces</h1>
              </div>
              <p className="text-lg lg:text-xl opacity-90">
                Trouve ton job étudiant idéal près de chez toi
              </p>
            </div>

            {/* Stats cards */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[100px]">
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm opacity-80">Annonces</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[100px]">
                <p className="text-3xl font-bold">{stats.open}</p>
                <p className="text-sm opacity-80">Ouvertes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[120px]">
                <p className="text-3xl font-bold">{stats.avgRate}€</p>
                <p className="text-sm opacity-80">Moy. /heure</p>
              </div>
            </div>
          </div>

          {/* Barre de recherche améliorée */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8a6bfe] transition-colors"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par mots-clés, ville, description..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-400 shadow-lg focus:ring-4 focus:ring-white/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 justify-center shadow-lg ${
                showFilters ? 'ring-4 ring-white/30' : ''
              }`}
            >
              <Filter size={20} />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Panneau de filtres amélioré */}
          {showFilters && (
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 animate-in slide-in-from-top duration-300">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-90">📍 Ville</label>
                  <input
                    type="text"
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    placeholder="Ex: Bruxelles"
                    className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8a6bfe]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-90">💰 Rémunération max</label>
                  <input
                    type="number"
                    value={filterMaxRate}
                    onChange={(e) => setFilterMaxRate(e.target.value)}
                    placeholder="Ex: 25"
                    className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8a6bfe]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-90">📊 Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#8a6bfe]"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="ouverte">Ouvertes</option>
                    <option value="en cours">En cours</option>
                    <option value="fermée">Fermées</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-90">🔀 Trier par</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#8a6bfe]"
                  >
                    <option value="recent">Plus récentes</option>
                    <option value="price-high">Prix décroissant</option>
                    <option value="price-low">Prix croissant</option>
                  </select>
                </div>
              </div>
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-4 text-sm font-medium hover:underline flex items-center gap-1"
                >
                  <X size={16} />
                  Réinitialiser tous les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* LISTE / CARTE */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                <span className="font-bold text-2xl text-gray-900">{filteredAndSorted.length}</span>
                <span className="ml-2">annonce{filteredAndSorted.length > 1 ? 's' : ''} trouvée{filteredAndSorted.length > 1 ? 's' : ''}</span>
              </p>
              {filteredAndSorted.length > 0 && filteredAndSorted.length < annonces.length && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Filtré
                </span>
              )}
            </div>

            {/* Toggle vue avec animation */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-white text-[#8a6bfe] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3x3 size={18} />
                <span className="hidden sm:inline">Liste</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'bg-white text-[#8a6bfe] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map size={18} />
                <span className="hidden sm:inline">Carte</span>
              </button>
            </div>
          </div>

          {/* Vue dynamique */}
          {viewMode === 'list' ? (
            filteredAndSorted.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="relative inline-block">
                  <AlertCircle className="mx-auto text-gray-300 mb-4" size={80} />
                  <Sparkles className="absolute top-0 right-0 text-[#8a6bfe] animate-pulse" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Aucune annonce trouvée</h3>
                <p className="text-gray-500 mb-6">
                  Essaie d'ajuster tes filtres ou reviens plus tard pour de nouvelles opportunités
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-[#8a6bfe] text-white rounded-xl font-semibold hover:bg-[#7a5bee] transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                  <Link
                    href="/annonces/nouvelle"
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Publier une annonce
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSorted.map((a, index) => (
                  <Link
                    key={a.id}
                    href={`/jobs/${a.id}`}
                    className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-2xl hover:border-[#8a6bfe]/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'fadeInUp 0.5s ease-out forwards',
                      opacity: 0,
                    }}
                  >
                    {/* Badge nouveau si créé récemment */}
                    {a.createdAt && new Date().getTime() - new Date(a.createdAt.toDate()).getTime() < 86400000 && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">
                        <Sparkles size={12} />
                        Nouveau
                      </div>
                    )}
                    
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8a6bfe]/0 to-[#8a6bfe]/0 group-hover:from-[#8a6bfe]/5 group-hover:to-[#b89fff]/5 transition-all duration-300 pointer-events-none"></div>
                    
                    <div className="relative p-6 flex flex-col justify-between h-full">
                      <div>
                        {/* Header avec statut */}
                        <div className="flex justify-between items-start mb-3">
                          <span
                            className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${
                              a.statut === 'ouverte'
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                                : a.statut === 'en cours'
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {a.statut === 'ouverte' && '🟢'} {a.statut.charAt(0).toUpperCase() + a.statut.slice(1)}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="text-[#8a6bfe]" size={20} />
                          </div>
                        </div>

                        {/* Titre et description */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8a6bfe] transition-colors">
                          {a.description.slice(0, 60)}{a.description.length > 60 && '...'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {a.description}
                        </p>

                        {/* Infos avec icônes */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="p-1.5 bg-[#8a6bfe]/10 rounded-lg">
                              <MapPin size={14} className="text-[#8a6bfe]" />
                            </div>
                            <span className="font-medium">{a.lieu}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="p-1.5 bg-[#8a6bfe]/10 rounded-lg">
                              <Calendar size={14} className="text-[#8a6bfe]" />
                            </div>
                            <span>{a.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="p-1.5 bg-[#8a6bfe]/10 rounded-lg">
                              <Clock size={14} className="text-[#8a6bfe]" />
                            </div>
                            <span>{a.duree}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer avec prix */}
                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-lg text-white">
                            <Euro size={16} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{a.remuneration}</p>
                            <p className="text-xs text-gray-500">€/heure</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400 group-hover:text-[#8a6bfe] transition-colors">
                          <span>Voir détails</span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
              <AnnoncesMap annonces={filteredAndSorted} />
            </div>
          )}
        </div>
      </section>

      {/* CTA Section améliorée */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8a6bfe] via-[#9b7ffe] to-[#b89fff]"></div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Users size={16} />
            Plus de 1000 étudiants nous font confiance
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
            Prêt à publier ton annonce ?
          </h2>
          <p className="text-xl opacity-90 mb-8 text-white max-w-2xl mx-auto">
            Trouve l'étudiant parfait pour ton job en quelques clics. C'est simple, rapide et efficace !
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/annonces/nouvelle"
              className="group bg-white text-[#8a6bfe] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl inline-flex items-center gap-3 justify-center"
            >
              <div className="p-2 bg-[#8a6bfe]/10 rounded-lg group-hover:bg-[#8a6bfe]/20 transition-colors">
                <Plus size={20} />
              </div>
              Publier maintenant
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/how-it-works"
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all inline-flex items-center gap-2 justify-center"
            >
              Comment ça marche ?
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-400" size={18} />
              <span>Note moyenne 4.8/5</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>Réponse en moins de 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>Partout en Belgique</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Ajout des animations CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}