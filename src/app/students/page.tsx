'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Euro, Star, Filter, Users, MessageCircle, Eye, Calendar } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  age: number;
  city: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  description: string;
  experiences: string[];
  available: boolean;
  avatar?: string;
}

// Données de démonstration
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 21,
    city: 'Louvain-la-Neuve',
    hourlyRate: 12,
    rating: 4.9,
    reviewCount: 23,
    completedJobs: 27,
    description: 'Étudiante en communication, sérieuse et motivée. Expérience en garde d\'enfants et aide aux devoirs.',
    experiences: ['Baby-sitting', 'Aide aux devoirs', 'Ménage'],
    available: true,
  },
  {
    id: '2',
    name: 'Marc Dubois',
    age: 23,
    city: 'Ottignies',
    hourlyRate: 15,
    rating: 4.7,
    reviewCount: 15,
    completedJobs: 18,
    description: 'Étudiant en ingénieur civil, forte expérience en déménagement et travaux manuels.',
    experiences: ['Déménagement', 'Bricolage', 'Jardinage'],
    available: true,
  },
  {
    id: '3',
    name: 'Emma Martin',
    age: 20,
    city: 'Louvain-la-Neuve',
    hourlyRate: 11,
    rating: 5.0,
    reviewCount: 31,
    completedJobs: 35,
    description: 'Étudiante en design, créative et organisée. Spécialisée dans l\'organisation d\'événements.',
    experiences: ['Événementiel', 'Serveur', 'Ménage'],
    available: false,
  },
  {
    id: '4',
    name: 'Lucas Petit',
    age: 19,
    city: 'Wavre',
    hourlyRate: 10,
    rating: 4.5,
    reviewCount: 8,
    completedJobs: 10,
    description: 'Étudiant en informatique, passionné de tech. Disponible pour cours particuliers et support IT.',
    experiences: ['Cours particuliers', 'Support IT', 'Data entry'],
    available: true,
  },
  {
    id: '5',
    name: 'Sophie Lambert',
    age: 22,
    city: 'Louvain-la-Neuve',
    hourlyRate: 13,
    rating: 4.8,
    reviewCount: 19,
    completedJobs: 22,
    description: 'Étudiante en langues, trilingue (FR/EN/NL). Expérience en traduction et cours de langues.',
    experiences: ['Cours de langues', 'Traduction', 'Baby-sitting'],
    available: true,
  },
  {
    id: '6',
    name: 'Tom Bernard',
    age: 24,
    city: 'Ottignies',
    hourlyRate: 14,
    rating: 4.6,
    reviewCount: 12,
    completedJobs: 15,
    description: 'Étudiant en kinésithérapie, sportif et dynamique. Aide au déménagement et cours de sport.',
    experiences: ['Déménagement', 'Coach sportif', 'Jardinage'],
    available: true,
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterMaxRate, setFilterMaxRate] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrage des étudiants
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.experiences.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCity = !filterCity || student.city.toLowerCase().includes(filterCity.toLowerCase());
    const matchesRate = !filterMaxRate || student.hourlyRate <= parseFloat(filterMaxRate);
    const matchesAvailable = !filterAvailable || student.available;

    return matchesSearch && matchesCity && matchesRate && matchesAvailable;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] to-white">

      {/* Hero Section */}
      <section className="py-12 px-6 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Users size={32} />
            <h1 className="text-4xl font-bold">Étudiants disponibles</h1>
          </div>
          <p className="text-xl opacity-90 mb-8">
            Parcourez les profils et contactez directement l'étudiant qui correspond à vos besoins
          </p>

          {/* Barre de recherche */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, compétence, expérience..."
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
                  <label className="block text-sm font-medium mb-2">Rémunération max (€/h)</label>
                  <input
                    type="number"
                    value={filterMaxRate}
                    onChange={(e) => setFilterMaxRate(e.target.value)}
                    placeholder="Ex: 15"
                    className="w-full px-4 py-2 rounded-lg text-gray-900"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg cursor-pointer hover:bg-white/30 transition w-full">
                    <input
                      type="checkbox"
                      checked={filterAvailable}
                      onChange={(e) => setFilterAvailable(e.target.checked)}
                      className="w-5 h-5 text-[#8a6bfe] rounded"
                    />
                    <span>Disponibles uniquement</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Liste des étudiants */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredStudents.length}</span> étudiant(s) trouvé(s)
            </p>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-xl text-gray-500">Aucun étudiant ne correspond à vos critères</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCity('');
                  setFilterMaxRate('');
                  setFilterAvailable(false);
                }}
                className="mt-4 text-[#8a6bfe] hover:underline font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition group"
                >
                  {/* Header de la carte */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{student.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>{student.age} ans</span>
                            <span>•</span>
                            <MapPin size={14} />
                            <span>{student.city}</span>
                          </div>
                        </div>
                      </div>
                      {student.available ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Disponible
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                          Indisponible
                        </span>
                      )}
                    </div>

                    {/* Statistiques */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{student.rating}</span>
                        <span className="text-gray-500">({student.reviewCount})</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="text-gray-600">
                        {student.completedJobs} missions
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-[#8a6bfe] font-semibold">
                        <Euro size={16} />
                        {student.hourlyRate}/h
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {student.description}
                    </p>

                    {/* Expériences */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {student.experiences.slice(0, 3).map((exp, index) => (
                        <span
                          key={index}
                          className="bg-[#f5e5ff] text-[#8a6bfe] px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <Link
                      href={`/students/${student.id}`}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-50 transition text-center flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      Voir profil
                    </Link>
                    <Link
                      href={`/messages?user=${student.id}`}
                      className="flex-1 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-2 rounded-xl font-semibold hover:shadow-lg transition text-center flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      Contacter
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Vous ne trouvez pas ce que vous cherchez ?</h2>
          <p className="text-xl opacity-90 mb-8">
            Publiez une annonce et laissez les étudiants venir à vous
          </p>
          <Link
            href="/jobs/create"
            className="bg-white text-[#8a6bfe] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition inline-block"
          >
            Publier une annonce
          </Link>
        </div>
      </section>
    </div>
  );
}