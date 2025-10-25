'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, MapPin, Mail, Phone, Calendar, Euro, Edit, Save, X, Star, Briefcase, Award, Plus, Settings } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  description: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  jobTitle: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'experiences' | 'reviews' | 'stats'>('info');

  // Données du profil
  const [profile, setProfile] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+32 476 12 34 56',
    city: 'Louvain-la-Neuve',
    age: 21,
    hourlyRate: 12,
    description: 'Étudiant en informatique, sérieux et motivé. J\'ai de l\'expérience dans le déménagement et l\'aide aux devoirs. Disponible les week-ends et en soirée.',
  });

  const [experiences, setExperiences] = useState<Experience[]>([
    { id: '1', title: 'Serveur', description: '2 ans d\'expérience en restauration' },
    { id: '2', title: 'Déménageur', description: 'Aide aux déménagements le week-end' },
    { id: '3', title: 'Cours particuliers', description: 'Mathématiques niveau secondaire' },
  ]);

  const stats = {
    totalJobs: 27,
    rating: 4.8,
    reviewCount: 23,
    completionRate: 96,
    responseTime: '2h',
  };

  const reviews: Review[] = [
    {
      id: '1',
      rating: 5,
      comment: 'Excellent travail ! Jean est ponctuel, sérieux et très efficace. Je le recommande vivement.',
      author: 'Marie D.',
      date: 'Il y a 1 semaine',
      jobTitle: 'Aide au déménagement',
    },
    {
      id: '2',
      rating: 4,
      comment: 'Très bon service. Quelques petits ajustements mais dans l\'ensemble très satisfait.',
      author: 'Pierre L.',
      date: 'Il y a 2 semaines',
      jobTitle: 'Jardinage',
    },
    {
      id: '3',
      rating: 5,
      comment: 'Super étudiant ! Mon fils a fait d\'énormes progrès en maths grâce à lui.',
      author: 'Sophie M.',
      date: 'Il y a 1 mois',
      jobTitle: 'Cours particuliers',
    },
  ];

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // TODO: Envoyer les données à l'API
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] to-white">

      {/* Contenu principal */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header du profil */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full flex items-center justify-center text-white font-bold text-3xl">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{profile.city}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{profile.age} ans</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Euro size={16} />
                    <span>{profile.hourlyRate}€/h</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 bg-[#f5e5ff] px-3 py-1 rounded-full">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{stats.rating}</span>
                    <span className="text-gray-600 text-sm">({stats.reviewCount} avis)</span>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {stats.totalJobs} missions complétées
                  </div>
                </div>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-[#8a6bfe] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#7a5bee] transition"
              >
                <Edit size={18} />
                Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition"
                >
                  <Save size={18} />
                  Enregistrer
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  <X size={18} />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-t-2xl border-b border-gray-200">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 font-semibold transition relative ${
                activeTab === 'info'
                  ? 'text-[#8a6bfe]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Informations
              {activeTab === 'info' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8a6bfe]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('experiences')}
              className={`px-6 py-4 font-semibold transition relative ${
                activeTab === 'experiences'
                  ? 'text-[#8a6bfe]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Expériences
              {activeTab === 'experiences' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8a6bfe]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 font-semibold transition relative ${
                activeTab === 'reviews'
                  ? 'text-[#8a6bfe]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Avis ({stats.reviewCount})
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8a6bfe]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 font-semibold transition relative ${
                activeTab === 'stats'
                  ? 'text-[#8a6bfe]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Statistiques
              {activeTab === 'stats' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8a6bfe]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white rounded-b-2xl shadow-lg border border-gray-100 border-t-0 p-8">
          {/* Onglet Informations */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">Informations personnelles</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={isEditing ? editedProfile.firstName : profile.firstName}
                      onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={isEditing ? editedProfile.lastName : profile.lastName}
                      onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={isEditing ? editedProfile.email : profile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={isEditing ? editedProfile.phone : profile.phone}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                    <input
                      type="text"
                      value={isEditing ? editedProfile.city : profile.city}
                      onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rémunération/h</label>
                    <input
                      type="number"
                      value={isEditing ? editedProfile.hourlyRate : profile.hourlyRate}
                      onChange={(e) => setEditedProfile({ ...editedProfile, hourlyRate: parseFloat(e.target.value) })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={isEditing ? editedProfile.description : profile.description}
                  onChange={(e) => setEditedProfile({ ...editedProfile, description: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] disabled:bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Onglet Expériences */}
          {activeTab === 'experiences' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Mes expériences</h3>
                <button className="flex items-center gap-2 bg-[#8a6bfe] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#7a5bee] transition">
                  <Plus size={18} />
                  Ajouter
                </button>
              </div>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="bg-[#f5e5ff] border border-[#8a6bfe]/20 rounded-xl p-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Briefcase className="text-[#8a6bfe] mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-gray-900">{exp.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-700 transition p-1">
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Avis */}
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Avis reçus</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{review.author}</p>
                          <span className="text-gray-400">•</span>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                        <p className="text-sm text-gray-600">{review.jobTitle}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Statistiques */}
          {activeTab === 'stats' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Mes statistiques</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#f5e5ff] rounded-xl p-6 text-center">
                  <Briefcase className="mx-auto text-[#8a6bfe] mb-3" size={32} />
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalJobs}</p>
                  <p className="text-sm text-gray-600">Missions complétées</p>
                </div>
                <div className="bg-[#f5e5ff] rounded-xl p-6 text-center">
                  <Star className="mx-auto text-yellow-400 fill-yellow-400 mb-3" size={32} />
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stats.rating}/5</p>
                  <p className="text-sm text-gray-600">Note moyenne</p>
                </div>
                <div className="bg-[#f5e5ff] rounded-xl p-6 text-center">
                  <Award className="mx-auto text-green-500 mb-3" size={32} />
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stats.completionRate}%</p>
                  <p className="text-sm text-gray-600">Taux de complétion</p>
                </div>
                <div className="bg-[#f5e5ff] rounded-xl p-6 text-center">
                  <Settings className="mx-auto text-blue-500 mb-3" size={32} />
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stats.responseTime}</p>
                  <p className="text-sm text-gray-600">Temps de réponse moyen</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}