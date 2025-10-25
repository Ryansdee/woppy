'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Euro, Clock, Calendar, Briefcase, User, Star, CheckCircle, AlertCircle, MessageCircle, Share2, Bookmark, ArrowLeft, Users } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  city: string;
  address?: string;
  hourlyRate: number;
  duration: string;
  date: string;
  startTime?: string;
  category: string;
  employer: {
    name: string;
    rating: number;
    reviewCount: number;
    jobsPosted: number;
    responseRate: number;
    avatar?: string;
  };
  requirements: string[];
  benefits: string[];
  applicants: number;
  createdAt: string;
  urgent?: boolean;
  verified: boolean;
  status: 'open' | 'closed' | 'in_progress';
}

// Données de démonstration
const mockJob: Job = {
  id: '1',
  title: 'Aide au déménagement de meubles',
  description: 'Bonjour, je recherche une personne dynamique et motivée pour m\'aider à déménager mes meubles de mon appartement vers une unité de stockage.\n\nLe travail consiste principalement à :\n- Porter et déplacer des meubles (canapé, armoire, table, chaises)\n- Charger et décharger le camion de location\n- Protéger les meubles avec des couvertures\n- Aider à l\'organisation dans l\'unité de stockage\n\nLe matériel de protection (gants, couvertures) sera fourni. Le camion est déjà réservé. Nous serons 2 personnes au total pour effectuer ce déménagement.\n\nC\'est un travail physique qui demande une bonne condition physique. L\'ambiance sera décontractée et je fournirai des boissons et snacks pendant les pauses.',
  city: 'Louvain-la-Neuve',
  address: 'Rue des Wallons 72',
  hourlyRate: 12,
  duration: '3-5 heures',
  date: '15 mars 2025',
  startTime: '09:00',
  category: 'Déménagement',
  employer: {
    name: 'Marie Dubois',
    rating: 4.8,
    reviewCount: 12,
    jobsPosted: 15,
    responseRate: 95,
  },
  requirements: [
    'Bonne condition physique',
    'Capacité à porter des charges lourdes',
    'Ponctualité et sérieux',
    'Expérience en déménagement (souhaitée mais pas obligatoire)',
  ],
  benefits: [
    'Rémunération attractive : 12€/h',
    'Matériel de protection fourni',
    'Boissons et snacks offerts',
    'Ambiance décontractée',
    'Paiement le jour même',
  ],
  applicants: 5,
  createdAt: 'Il y a 2 heures',
  urgent: true,
  verified: true,
  status: 'open',
};

export default function JobDetailPage() {
  const params = useParams();
  const [job] = useState<Job>(mockJob);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');

  const handleApply = () => {
    setShowApplicationModal(true);
  };

  const submitApplication = () => {
    // TODO: Envoyer la candidature via API
    setHasApplied(true);
    setShowApplicationModal(false);
    console.log('Application submitted', { jobId: job.id, message: applicationMessage });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] to-white">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link href="/jobs" className="flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition">
          <ArrowLeft size={20} />
          <span>Retour aux offres</span>
        </Link>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête de l'offre */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-[#f5e5ff] text-[#8a6bfe] px-3 py-1 rounded-full text-sm font-medium">
                      {job.category}
                    </span>
                    {job.urgent && (
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <AlertCircle size={14} />
                        URGENT
                      </span>
                    )}
                    {job.verified && (
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <CheckCircle size={14} />
                        Vérifié
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-[#8a6bfe]" />
                      <span>{job.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-[#8a6bfe]" />
                      <span>{job.date}</span>
                      {job.startTime && <span className="text-sm">à {job.startTime}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-[#8a6bfe]" />
                      <span>{job.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-3xl font-bold text-[#8a6bfe] flex items-center gap-1">
                    <Euro size={28} />
                    {job.hourlyRate}/h
                  </div>
                  <p className="text-sm text-gray-500">Publié {job.createdAt}</p>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                    isSaved
                      ? 'bg-[#8a6bfe] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark size={18} className={isSaved ? 'fill-white' : ''} />
                  {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">
                  <Share2 size={18} />
                  Partager
                </button>
                <div className="flex-1"></div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={18} />
                  <span className="text-sm font-medium">{job.applicants} candidature(s)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase size={24} className="text-[#8a6bfe]" />
                Description de la mission
              </h2>
              <div className="prose max-w-none">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-3 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Prérequis */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ce que nous recherchons</h2>
              <ul className="space-y-3">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avantages */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ce que nous offrons</h2>
              <ul className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Star size={20} className="text-[#8a6bfe] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Localisation */}
            {job.address && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={24} className="text-[#8a6bfe]" />
                  Localisation
                </h2>
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-gray-900 font-semibold">{job.address}</p>
                  <p className="text-gray-600">{job.city}</p>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  💡 L'adresse exacte sera communiquée après acceptation de votre candidature
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bouton de candidature */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              {hasApplied ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Candidature envoyée !</h3>
                  <p className="text-gray-600 mb-4">
                    L'employeur a reçu votre candidature et vous contactera bientôt.
                  </p>
                  <Link
                    href="/messages"
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={20} />
                    Voir mes messages
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-[#8a6bfe] mb-2">
                      {job.hourlyRate}€/h
                    </div>
                    <p className="text-gray-600">Pour {job.duration}</p>
                  </div>
                  <button
                    onClick={handleApply}
                    className="w-full bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition mb-3"
                  >
                    Postuler maintenant
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Vous pourrez ajouter un message personnalisé
                  </p>
                </>
              )}
            </div>

            {/* Info employeur */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-[#8a6bfe]" />
                À propos de l'employeur
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {job.employer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{job.employer.name}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{job.employer.rating}</span>
                    <span className="text-gray-500">({job.employer.reviewCount} avis)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Annonces publiées</span>
                  <span className="font-semibold text-gray-900">{job.employer.jobsPosted}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Taux de réponse</span>
                  <span className="font-semibold text-green-600">{job.employer.responseRate}%</span>
                </div>
              </div>

              <Link
                href={`/messages?employer=${job.employer.name}`}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Contacter
              </Link>
            </div>

            {/* Conseils */}
            <div className="bg-[#f5e5ff] border border-[#8a6bfe]/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Conseils</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Lisez attentivement la description</li>
                <li>• Personnalisez votre candidature</li>
                <li>• Soyez ponctuel et professionnel</li>
                <li>• N'hésitez pas à poser des questions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de candidature */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Postuler pour cette mission</h2>
            <p className="text-gray-600 mb-6">
              Présentez-vous brièvement et expliquez pourquoi vous êtes le candidat idéal pour cette mission.
            </p>

            {/* Récapitulatif */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{job.city}</span>
                <span>•</span>
                <span>{job.date}</span>
                <span>•</span>
                <span className="text-[#8a6bfe] font-semibold">{job.hourlyRate}€/h</span>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message de motivation
              </label>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent resize-none"
                placeholder="Bonjour, je suis intéressé(e) par votre annonce car..."
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Mentionnez vos expériences pertinentes et votre disponibilité
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button
                onClick={submitApplication}
                disabled={!applicationMessage.trim()}
                className="flex-1 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Envoyer ma candidature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}