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
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import dynamic from 'next/dynamic';

// ✅ Import dynamique (empêche l'erreur "window is not defined" pour la map)
const AnnoncesMap = dynamic(() => import('@/components/AnnoncesMap'), { ssr: false });

interface Annonce {
  id: string;
  description: string;
  titre: string;
  date: string;
  duree: string;
  lieu: string;
  remuneration: number;
  statut: 'ouverte' | 'en cours' | 'fermée' | string;
  userId: string;
  createdAt?: any; // Firestore Timestamp
}

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterMaxRate, setFilterMaxRate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ouverte' | 'en cours' | 'fermée'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'recent' | 'price-high' | 'price-low'>('recent');

  const router = useRouter();

  // 🔒 Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/auth/login');
    });
    return () => unsub();
  }, [router]);

  // 🔄 Live updates Firestore
  useEffect(() => {
    const qRef = query(collection(db, 'annonces'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Annonce[];
        setAnnonces(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur Firestore :', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Filtres + Tri (optimisé)
  const filteredAndSorted = useMemo(() => {
    let result = annonces.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchDesc = a.description?.toLowerCase().includes(q);
      const matchCity = !filterCity || a.lieu?.toLowerCase().includes(filterCity.toLowerCase());
      const matchRate = !filterMaxRate || Number(a.remuneration) <= parseFloat(filterMaxRate);
      const matchStatus = filterStatus === 'all' || a.statut === filterStatus;
      return matchDesc && matchCity && matchRate && matchStatus;
    });

    switch (sortBy) {
      case 'price-high':
        result.sort((a, b) => Number(b.remuneration) - Number(a.remuneration));
        break;
      case 'price-low':
        result.sort((a, b) => Number(a.remuneration) - Number(b.remuneration));
        break;
      default:
        // 'recent' : déjà trié côté Firestore par createdAt desc
        break;
    }

    return result;
  }, [annonces, searchQuery, filterCity, filterMaxRate, filterStatus, sortBy]);

  // Filtres actifs
  const activeFiltersCount = [filterCity, filterMaxRate, filterStatus !== 'all'].filter(Boolean).length;

  // Reset
  const resetFilters = () => {
    setSearchQuery('');
    setFilterCity('');
    setFilterMaxRate('');
    setFilterStatus('all');
    setSortBy('recent');
  };

  // Stats header
  const stats = useMemo(
    () => ({
      total: annonces.length,
      open: annonces.filter((a) => a.statut === 'ouverte').length,
      avgRate: annonces.length
        ? (annonces.reduce((sum, a) => sum + Number(a.remuneration), 0) / annonces.length).toFixed(1)
        : 0,
    }),
    [annonces]
  );

  // --- UI ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] via-white to-gray-50">
        <HeaderSkeleton />
        <div className="max-w-7xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] via-white to-gray-50 text-gray-900">
      {/* HEADER */}
<section className="relative px-6 py-10 sm:py-14 bg-gradient-to-b from-white via-[#f5e5ff] to-[#ddc2ff] text-gray-900 overflow-hidden border-b border-[#ddc2ff]">
  {/* Bandeau mauve en haut */}
  <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] rounded-b-[40px] shadow-lg"></div>

  <div className="max-w-7xl mx-auto relative z-10">
    {/* Titre + Stats */}
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-[#8a6bfe] text-white rounded-xl shadow-md">
            <Briefcase size={26} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white drop-shadow-sm">
            Annonces
          </h1>
        </div>
        <p className="text-base sm:text-lg lg:text-xl/relaxed text-white max-w-xl">
          Trouve ton job étudiant idéal près de chez toi
        </p>
      </div>

      {/* Stats visibles et colorées */}
      <div className="flex gap-4 w-full lg:w-auto overflow-x-auto no-scrollbar snap-x">
        <div className="snap-start bg-[#8a6bfe] text-white rounded-2xl p-4 min-w-[120px]">
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm opacity-90">Annonces</p>
        </div>
        <div className="snap-start bg-[#ddc2ff] text-[#4b3c6e] rounded-2xl p-4 min-w-[120px]">
          <p className="text-3xl font-bold">{stats.open}</p>
          <p className="text-sm opacity-90">Ouvertes</p>
        </div>
        <div className="snap-start bg-[#f5e5ff] text-[#4b3c6e] rounded-2xl p-4 min-w-[130px]">
          <p className="text-3xl font-bold">{stats.avgRate}€</p>
          <p className="text-sm opacity-90">Moy. /heure</p>
        </div>
      </div>
    </div>

    {/* Barre de recherche + bouton filtres */}
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
      <div className="flex-1 relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a6bfe] group-focus-within:text-[#6a4ff6] transition-colors"
          size={20}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par mots-clés, ville, description..."
          className="w-full pl-12 pr-10 py-4 rounded-xl border border-[#ddc2ff] bg-white shadow-md text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-[#8a6bfe]/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Effacer la recherche"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <button
        onClick={() => setShowFilters(true)}
        className="relative bg-[#8a6bfe] hover:bg-[#7a5bee] text-white px-6 py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 justify-center"
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

    {/* Drawer Filtres (fond opaque blanc/mauve) */}
    {showFilters && (
      <div className="fixed inset-0 z-40 lg:static">
        {/* Overlay mobile */}
        <button
          onClick={() => setShowFilters(false)}
          className="lg:hidden absolute inset-0 bg-black/40"
          aria-label="Fermer les filtres"
        />
        <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] lg:static lg:mt-6 lg:w-full bg-white text-gray-900 rounded-t-3xl lg:rounded-2xl p-6 shadow-2xl animate-drawer">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-[#8a6bfe]">Filtres</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-800 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">📍 Ville</label>
              <input
                type="text"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="Ex: Bruxelles"
                className="w-full px-4 py-3 rounded-lg border border-[#ddc2ff] bg-[#f5e5ff] text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#8a6bfe]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">💰 Rémunération max</label>
              <input
                type="number"
                value={filterMaxRate}
                onChange={(e) => setFilterMaxRate(e.target.value)}
                placeholder="Ex: 25"
                className="w-full px-4 py-3 rounded-lg border border-[#ddc2ff] bg-[#f5e5ff] text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#8a6bfe]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">📊 Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-3 rounded-lg border border-[#ddc2ff] bg-[#f5e5ff] text-gray-900 focus:ring-2 focus:ring-[#8a6bfe]"
              >
                <option value="all">Tous les statuts</option>
                <option value="ouverte">Ouvertes</option>
                <option value="en cours">En cours</option>
                <option value="fermée">Fermées</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">🔀 Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 rounded-lg border border-[#ddc2ff] bg-[#f5e5ff] text-gray-900 focus:ring-2 focus:ring-[#8a6bfe]"
              >
                <option value="recent">Plus récentes</option>
                <option value="price-high">Prix décroissant</option>
                <option value="price-low">Prix croissant</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            {activeFiltersCount > 0 ? (
              <button onClick={resetFilters} className="text-sm font-medium text-[#8a6bfe] hover:underline">
                Réinitialiser
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={() => setShowFilters(false)}
              className="px-6 py-2 bg-[#8a6bfe] text-white rounded-xl font-semibold shadow-md hover:bg-[#7b5aff] transition"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
</section>


      {/* CONTENU */}
      <section className="py-10 sm:py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                <span className="font-bold text-2xl text-gray-900">{filteredAndSorted.length}</span>
                <span className="ml-2">
                  annonce{filteredAndSorted.length > 1 ? 's' : ''} trouvée{filteredAndSorted.length > 1 ? 's' : ''}
                </span>
              </p>
              {filteredAndSorted.length > 0 && filteredAndSorted.length < annonces.length && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Filtré</span>
              )}
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'list' ? 'bg-white text-[#8a6bfe] shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3x3 size={18} />
                <span className="hidden sm:inline">Liste</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'map' ? 'bg-white text-[#8a6bfe] shadow-md' : 'text-gray-600 hover:text-gray-900'
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
              <EmptyState resetFilters={resetFilters} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSorted.map((a, index) => (
                  <Link
                    key={a.id}
                    href={`/jobs/${a.id}`}
                    className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-2xl hover:border-[#8a6bfe]/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms`, animation: 'fadeInUp 0.5s ease-out forwards', opacity: 0 }}
                  >
                    {/* Badge nouveau (moins de 24h) */}
                    {a.createdAt &&
                      Date.now() - new Date(a.createdAt?.toDate?.() || a.createdAt).getTime() < 86400000 && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">
                          <Sparkles size={12} />
                          Nouveau
                        </div>
                      )}

                    {/* Overlay gradient au hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8a6bfe]/0 to-[#8a6bfe]/0 group-hover:from-[#8a6bfe]/5 group-hover:to-[#b89fff]/5 transition-all duration-300 pointer-events-none" />

                    <div className="relative p-6 flex flex-col justify-between h-full">
                      <div>
                        {/* Statut */}
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

                        {/* Titre + desc */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8a6bfe] transition-colors">
                          {a.titre?.slice(0, 60)}
                          {a.titre?.length > 60 && '...'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{a.description}</p>

                        {/* Infos */}
                        <div className="space-y-2">
                          <InfoRow icon={<MapPin size={14} className="text-[#8a6bfe]" />} text={a.lieu} />
                          <InfoRow icon={<Calendar size={14} className="text-[#8a6bfe]" />} text={a.date} />
                          <InfoRow icon={<Clock size={14} className="text-[#8a6bfe]" />} text={a.duree} />
                        </div>
                      </div>

                      {/* Footer prix */}
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

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-6 relative overflow-hidden">
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8a6bfe] via-[#9b7ffe] to-[#b89fff]" />
        {/* Halo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Users size={16} />
            Plus de 1000 étudiants nous font confiance
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">Prêt à publier ton annonce ?</h2>
          <p className="text-lg sm:text-xl opacity-90 mb-8 text-white max-w-2xl mx-auto">
            Trouve l&apos;étudiant parfait pour ton job en quelques clics. C&apos;est simple, rapide et efficace !
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jobs/create"
              className="group bg-white text-[#8a6bfe] px-7 sm:px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl inline-flex items-center gap-3 justify-center"
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

          {/* Indicateurs de confiance */}
          <div className="mt-10 sm:mt-12 flex flex-wrap justify-center gap-6 sm:gap-8 text-white/80 text-sm">
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

        {/* Bouton flottant "Publier" (mobile) */}
        <Link
          href="/jobs/create"
          className="fixed sm:hidden bottom-6 right-6 bg-[#8a6bfe] text-white rounded-full shadow-xl p-4 hover:bg-[#7b5aff] transition"
          aria-label="Publier une annonce"
        >
          <Plus size={22} />
        </Link>
      </section>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-drawer {
          animation: drawer 0.25s ease-out;
        }
        @keyframes drawer {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .skeleton {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, #eee, #f5f5f5, #eee);
          background-size: 200% 100%;
          animation: shine 1.2s infinite;
        }
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

/* --------- Composants UI --------- */

function InfoRow({ icon, text }: { icon: React.ReactNode; text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <div className="p-1.5 bg-[#8a6bfe]/10 rounded-lg">{icon}</div>
      <span className="font-medium">{text || '—'}</span>
    </div>
  );
}

function EmptyState({ resetFilters }: { resetFilters: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 sm:p-16 text-center">
      <div className="relative inline-block">
        <AlertCircle className="mx-auto text-gray-300 mb-4" size={80} />
        <Sparkles className="absolute top-0 right-0 text-[#8a6bfe] animate-pulse" size={24} />
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-2">Aucune annonce trouvée</h3>
      <p className="text-gray-500 mb-6">
        Essaie d&apos;ajuster tes filtres ou reviens plus tard pour de nouvelles opportunités
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={resetFilters}
          className="px-6 py-3 bg-[#8a6bfe] text-white rounded-xl font-semibold hover:bg-[#7a5bee] transition-colors"
        >
          Réinitialiser les filtres
        </button>
        <Link
          href="/jobs/create"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Publier une annonce
        </Link>
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <section className="relative px-6 py-10 sm:py-14 bg-gradient-to-br from-[#8a6bfe] via-[#9b7ffe] to-[#b89fff] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Briefcase size={26} />
              </div>
              <div className="h-7 w-48 rounded-md skeleton" />
            </div>
            <div className="h-4 w-72 rounded-md skeleton" />
          </div>
          <div className="flex gap-4 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[110px]">
                <div className="h-8 w-16 rounded-md skeleton mb-2" />
                <div className="h-3 w-20 rounded-md skeleton" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          <div className="flex-1 h-12 rounded-xl skeleton" />
          <div className="h-12 w-40 rounded-xl skeleton" />
        </div>
      </div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 w-24 rounded-full skeleton" />
        <div className="h-5 w-5 rounded-md skeleton" />
      </div>
      <div className="h-5 w-3/4 rounded-md skeleton mb-2" />
      <div className="h-4 w-full rounded-md skeleton mb-4" />
      <div className="space-y-2">
        <div className="h-4 w-1/2 rounded-md skeleton" />
        <div className="h-4 w-1/3 rounded-md skeleton" />
        <div className="h-4 w-1/4 rounded-md skeleton" />
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="h-8 w-24 rounded-md skeleton" />
        <div className="h-4 w-20 rounded-md skeleton" />
      </div>
    </div>
  );
}
