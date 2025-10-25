'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Euro, Clock, Calendar, Filter, Briefcase, Plus, TrendingUp } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  city: string;
  hourlyRate: number;
  duration: string;
  date: string;
  category: string;
  employer: string;
  applicants: number;
  createdAt: string;
  urgent?: boolean;
}

// Données de démonstration
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Aide au déménagement de meubles',
    description: 'Besoin d\'aide pour déplacer les meubles de l\'appartement à l\'unité de stockage. Levage lourd requis. Apportez votre bonne humeur !',
    city: 'Louvain-la-Neuve',
    hourlyRate: 12,
    duration: '3-5 heures',
    date: '15 mars 2025',
    category: 'Déménagement',
    employer: 'Marie D.',
    applicants: 5,
    createdAt: 'Il y a 2 heures',
    urgent: true,
  },
  {
    id: '2',
    title: 'Baby-sitting pour 2 enfants',
    description: 'Garde de mes deux enfants (3 et 6 ans) le samedi après-midi. Personne responsable et expérimentée recherchée.',
    city: 'Ottignies',
    hourlyRate: 10,
    duration: '4 heures',
    date: '18 mars 2025',
    category: 'Baby-sitting',
    employer: 'Sophie L.',
    applicants: 12,
    createdAt: 'Il y a 5 heures',
  },
  {
    id: '3',
    title: 'Cours particuliers de mathématiques',
    description: 'Recherche étudiant pour donner des cours de maths niveau secondaire à mon fils. 2 séances par semaine.',
    city: 'Louvain-la-Neuve',
    hourlyRate: 15,
    duration: '2 heures',
    date: 'Récurrent',
    category: 'Cours particuliers',
    employer: 'Jean-Marc P.',
    applicants: 8,
    createdAt: 'Il y a 1 jour',
  },
  {
    id: '4',
    title: 'Jardinage et entretien extérieur',
    description: 'Taille de haies, tonte de pelouse et nettoyage général du jardin. Matériel fourni.',
    city: 'Wavre',
    hourlyRate: 11,
    duration: '5-6 heures',
    date: '20 mars 2025',
    category: 'Jardinage',
    employer: 'Pierre B.',
    applicants: 3,
    createdAt: 'Il y a 1 jour',
    urgent: true,
  },
  {
    id: '5',
    title: 'Serveur pour événement privé',
    description: 'Recherche 3 serveurs pour un anniversaire (50 personnes). Expérience en service souhaitée.',
    city: 'Louvain-la-Neuve',
    hourlyRate: 13,
    duration: '6 heures',
    date: '25 mars 2025',
    category: 'Événementiel',
    employer: 'Restaurant La Dolce',
    applicants: 15,
    createdAt: 'Il y a 2 jours',
  },
  {
    id: '6',
    title: 'Aide au ménage hebdomadaire',
    description: 'Ménage complet d\'un appartement 2 chambres. Tous les mercredis après-midi.',
    city: 'Ottignies',
    hourlyRate: 12,
    duration: '3 heures',
    date: 'Chaque semaine',
    category: 'Ménage',
    employer: 'Claire M.',
    applicants: 7,
    createdAt: 'Il y a 3 jours',
  },
];

const categories = ['Tous', 'Déménagement', 'Baby-sitting', 'Cours particuliers', 'Jardinage', 'Événementiel', 'Ménage'];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [filterMaxRate, setFilterMaxRate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrage des emplois
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = !filterCity || job.city.toLowerCase().includes(filterCity.toLowerCase());
    const matchesCategory = filterCategory === 'Tous' || job.category === filterCategory;
    const matchesRate = !filterMaxRate || job.hourlyRate <= parseFloat(filterMaxRate);

    return matchesSearch && matchesCity && matchesCategory && matchesRate;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] to-white">

      {/* Hero Section */}
      <section className="py-12 px-6 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase size={32} />
            <h1 className="text-4xl font-bold">Emplois disponibles</h1>
          </div>
          <p className="text-xl opacity-90 mb-8">
            Trouvez des missions flexibles qui correspondent à vos compétences et disponibilités
          </p>

          {/* Barre de recherche */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre ou description..."
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

          {/* Filtres avancés */}
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
                  <label className="block text-sm font-medium mb-2">Catégorie</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-gray-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rémunération max (€/h)</label>
                  <input
                    type="number"
                    value={filterMaxRate}
                    onChange={(e) => setFilterMaxRate(e.target.value)}
                    placeholder="Ex: 15"
                    className="w-full px-4 py-2 rounded-lg text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Catégories rapides */}
      <section className="py-6 px-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
                  filterCategory === category
                    ? 'bg-[#8a6bfe] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Liste des emplois */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredJobs.length}</span> emploi(s) trouvé(s)
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={16} />
              <span>Trié par pertinence</span>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-xl text-gray-500">Aucune offre ne correspond à vos critères</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCity('');
                  setFilterCategory('Tous');
                  setFilterMaxRate('');
                }}
                className="mt-4 text-[#8a6bfe] hover:underline font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#8a6bfe] transition group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#8a6bfe] transition">
                            {job.title}
                          </h3>
                          {job.urgent && (
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          Publié par <span className="font-semibold">{job.employer}</span> • {job.createdAt}
                        </p>
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                    </div>

                    {/* Informations */}
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} className="text-[#8a6bfe]" />
                        <span>{job.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-[#8a6bfe]" />
                        <span>{job.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} className="text-[#8a6bfe]" />
                        <span>{job.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8a6bfe] font-bold">
                        <Euro size={16} />
                        <span>{job.hourlyRate}€/h</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <span className="bg-[#f5e5ff] text-[#8a6bfe] px-3 py-1 rounded-full text-xs font-medium">
                          {job.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {job.applicants} candidature(s)
                        </span>
                      </div>
                      <button className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition">
                        Postuler
                      </button>
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
          <h2 className="text-3xl font-bold mb-4">Vous avez un job à proposer ?</h2>
          <p className="text-xl opacity-90 mb-8">
            Publiez une annonce et recevez des candidatures d'étudiants motivés
          </p>
          <Link
            href="/jobs/create"
            className="bg-white text-[#8a6bfe] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition inline-flex items-center gap-2"
          >
            <Plus size={24} />
            Publier une annonce gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
}