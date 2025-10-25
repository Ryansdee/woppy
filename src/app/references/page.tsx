'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ThumbsUp, Filter, TrendingUp, Award, Users, Calendar, MessageCircle } from 'lucide-react';

interface Reference {
  id: string;
  rating: number;
  comment: string;
  author: {
    name: string;
    avatar?: string;
    type: 'student' | 'employer';
  };
  recipient: {
    name: string;
    avatar?: string;
    type: 'student' | 'employer';
  };
  jobTitle: string;
  date: string;
  helpful: number;
  verified: boolean;
}

// Données de démonstration
const mockReferences: Reference[] = [
  {
    id: '1',
    rating: 5,
    comment: 'Excellent travail ! Sarah est ponctuelle, sérieuse et très efficace. Elle a fait un travail remarquable lors du déménagement. Je la recommande vivement pour tout type de mission.',
    author: {
      name: 'Marie Dubois',
      type: 'employer',
    },
    recipient: {
      name: 'Sarah Johnson',
      type: 'student',
    },
    jobTitle: 'Aide au déménagement de meubles',
    date: 'Il y a 1 semaine',
    helpful: 12,
    verified: true,
  },
  {
    id: '2',
    rating: 5,
    comment: 'Super expérience ! Marc est très professionnel et a largement dépassé mes attentes. Travail soigné et rapide. Un vrai plaisir de travailler avec lui.',
    author: {
      name: 'Pierre Lambert',
      type: 'employer',
    },
    recipient: {
      name: 'Marc Dubois',
      type: 'student',
    },
    jobTitle: 'Jardinage et entretien',
    date: 'Il y a 2 semaines',
    helpful: 8,
    verified: true,
  },
  {
    id: '3',
    rating: 4,
    comment: 'Très bon service. Emma est créative et organisée. Quelques petits ajustements mais dans l\'ensemble très satisfait de la prestation.',
    author: {
      name: 'Sophie Martin',
      type: 'employer',
    },
    recipient: {
      name: 'Emma Martin',
      type: 'student',
    },
    jobTitle: 'Organisation d\'événement',
    date: 'Il y a 3 semaines',
    helpful: 5,
    verified: true,
  },
  {
    id: '4',
    rating: 5,
    comment: 'Employeur très sympathique et respectueux. Les conditions de travail étaient excellentes et le paiement a été effectué dans les délais. Je recommande !',
    author: {
      name: 'Lucas Petit',
      type: 'student',
    },
    recipient: {
      name: 'Jean-Marc Poirier',
      type: 'employer',
    },
    jobTitle: 'Cours particuliers de mathématiques',
    date: 'Il y a 1 mois',
    helpful: 15,
    verified: true,
  },
  {
    id: '5',
    rating: 5,
    comment: 'Mon fils a fait d\'énormes progrès en maths grâce à Sophie. Elle est patiente, pédagogue et très compétente. Un grand merci !',
    author: {
      name: 'Claire Rousseau',
      type: 'employer',
    },
    recipient: {
      name: 'Sophie Lambert',
      type: 'student',
    },
    jobTitle: 'Cours particuliers',
    date: 'Il y a 1 mois',
    helpful: 20,
    verified: true,
  },
  {
    id: '6',
    rating: 4,
    comment: 'Bon travail dans l\'ensemble. Tom est dynamique et efficace. Petit manque de communication au début mais rien de grave.',
    author: {
      name: 'Anne Lefebvre',
      type: 'employer',
    },
    recipient: {
      name: 'Tom Bernard',
      type: 'student',
    },
    jobTitle: 'Déménagement',
    date: 'Il y a 2 mois',
    helpful: 7,
    verified: true,
  },
];

export default function ReferencesPage() {
  const [references] = useState<Reference[]>(mockReferences);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'student' | 'employer'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Statistiques globales
  const totalReviews = references.length;
  const averageRating = (references.reduce((acc, ref) => acc + ref.rating, 0) / totalReviews).toFixed(1);
  const fiveStars = references.filter(r => r.rating === 5).length;
  const fourStars = references.filter(r => r.rating === 4).length;

  // Filtrage
  const filteredReferences = references.filter((ref) => {
    const matchesRating = filterRating === null || ref.rating === filterRating;
    const matchesType = filterType === 'all' || 
                       (filterType === 'student' && ref.recipient.type === 'student') ||
                       (filterType === 'employer' && ref.recipient.type === 'employer');
    return matchesRating && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] to-white">

      {/* Hero Section */}
      <section className="py-12 px-6 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Award size={32} />
            <h1 className="text-4xl font-bold">Références & Avis</h1>
          </div>
          <p className="text-xl opacity-90 mb-8">
            Découvrez les témoignages et évaluations de notre communauté
          </p>

          {/* Statistiques globales */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <MessageCircle className="mx-auto mb-3" size={32} />
              <p className="text-3xl font-bold mb-1">{totalReviews}</p>
              <p className="text-sm opacity-90">Avis publiés</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <Star className="mx-auto mb-3 fill-yellow-400 text-yellow-400" size={32} />
              <p className="text-3xl font-bold mb-1">{averageRating}/5</p>
              <p className="text-sm opacity-90">Note moyenne</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <TrendingUp className="mx-auto mb-3" size={32} />
              <p className="text-3xl font-bold mb-1">{fiveStars}</p>
              <p className="text-sm opacity-90">Avis 5 étoiles</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <Users className="mx-auto mb-3" size={32} />
              <p className="text-3xl font-bold mb-1">100%</p>
              <p className="text-sm opacity-90">Avis vérifiés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filtres et distribution */}
      <section className="py-8 px-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Distribution des étoiles */}
            <div className="flex-1 w-full">
              <h3 className="font-semibold text-gray-900 mb-3">Distribution des notes</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = references.filter(r => r.rating === stars).length;
                  const percentage = (count / totalReviews) * 100;
                  return (
                    <button
                      key={stars}
                      onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                      className={`w-full flex items-center gap-3 group ${
                        filterRating === stars ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {[...Array(stars)].map((_, i) => (
                          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#8a6bfe] transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtres rapides */}
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-gray-900">Type d'avis</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    filterType === 'all'
                      ? 'bg-[#8a6bfe] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilterType('student')}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    filterType === 'student'
                      ? 'bg-[#8a6bfe] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Étudiants
                </button>
                <button
                  onClick={() => setFilterType('employer')}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    filterType === 'employer'
                      ? 'bg-[#8a6bfe] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Employeurs
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des références */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredReferences.length}</span> avis trouvé(s)
            </p>
          </div>

          {filteredReferences.length === 0 ? (
            <div className="text-center py-16">
              <Award className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-xl text-gray-500">Aucun avis ne correspond à vos filtres</p>
              <button
                onClick={() => {
                  setFilterRating(null);
                  setFilterType('all');
                }}
                className="mt-4 text-[#8a6bfe] hover:underline font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReferences.map((reference) => (
                <div
                  key={reference.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar auteur */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full flex items-center justify-center text-white font-bold">
                        {reference.author.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{reference.author.name}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reference.author.type === 'student'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {reference.author.type === 'student' ? 'Étudiant' : 'Employeur'}
                          </span>
                          {reference.verified && (
                            <span className="bg-[#8a6bfe]/10 text-[#8a6bfe] px-2 py-1 rounded-full text-xs font-medium">
                              ✓ Vérifié
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          A évalué <span className="font-semibold">{reference.recipient.name}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{reference.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={i < reference.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{reference.date}</span>
                    </div>
                  </div>

                  {/* Commentaire */}
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {reference.comment}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition text-sm">
                      <ThumbsUp size={16} />
                      <span>Utile ({reference.helpful})</span>
                    </button>
                    <Link
                      href={`/${reference.recipient.type === 'student' ? 'students' : 'employers'}/${reference.recipient.name}`}
                      className="text-[#8a6bfe] hover:underline text-sm font-medium"
                    >
                      Voir le profil →
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
          <Award className="mx-auto mb-6" size={48} />
          <h2 className="text-3xl font-bold mb-4">Rejoignez une communauté de confiance</h2>
          <p className="text-xl opacity-90 mb-8">
            Créez votre profil et commencez à recevoir des avis de qualité
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-[#8a6bfe] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition inline-block"
          >
            S'inscrire gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
}