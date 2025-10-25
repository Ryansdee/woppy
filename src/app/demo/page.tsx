'use client';

import Link from 'next/link';
import { ArrowLeft, Play, Check, Star, MessageCircle, Users, Briefcase, ArrowRight, Eye, MousePointer } from 'lucide-react';
import { useState } from 'react';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'employer' | 'student'>('employer');
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <main className="min-h-screen text-black bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Woppy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-[#8a6bfe] transition"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Retour</span>
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-[#f5e5ff] to-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
            <Play className="text-[#8a6bfe]" size={20} />
            <span className="text-sm font-medium text-gray-700">Démo interactive</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Découvrez Woppy en action</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Explorez toutes les fonctionnalités de la plateforme à travers cette démo interactive. 
            Voyez comment Woppy simplifie la mise en relation entre étudiants et employeurs.
          </p>
        </div>
      </section>

      {/* Sélection du profil */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Choisissez votre profil</h2>
            <p className="text-gray-600">Explorez Woppy selon votre perspective</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => setActiveTab('employer')}
              className={`p-8 rounded-2xl border-2 transition-all ${
                activeTab === 'employer'
                  ? 'border-[#8a6bfe] bg-[#f5e5ff] shadow-lg'
                  : 'border-gray-200 hover:border-[#8a6bfe]/50'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                activeTab === 'employer' ? 'bg-[#8a6bfe]' : 'bg-gray-100'
              }`}>
                <Briefcase className={activeTab === 'employer' ? 'text-white' : 'text-gray-400'} size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Je cherche de l'aide</h3>
              <p className="text-gray-600">Vous êtes un particulier ou une entreprise qui cherche un étudiant</p>
            </button>

            <button
              onClick={() => setActiveTab('student')}
              className={`p-8 rounded-2xl border-2 transition-all ${
                activeTab === 'student'
                  ? 'border-[#8a6bfe] bg-[#f5e5ff] shadow-lg'
                  : 'border-gray-200 hover:border-[#8a6bfe]/50'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                activeTab === 'student' ? 'bg-[#8a6bfe]' : 'bg-gray-100'
              }`}>
                <Users className={activeTab === 'student' ? 'text-white' : 'text-gray-400'} size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Je cherche un job</h3>
              <p className="text-gray-600">Vous êtes un étudiant qui cherche des missions flexibles</p>
            </button>
          </div>
        </div>
      </section>

      {/* Démo pour Employeur */}
      {activeTab === 'employer' && (
        <section className="py-16 px-6 bg-gradient-to-b from-white to-[#f5e5ff]/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Parcours Employeur</h2>
              <p className="text-xl text-gray-600">Publiez une annonce et trouvez le candidat idéal en 4 étapes</p>
            </div>

            {/* Étapes */}
            <div className="mb-12">
              <div className="flex items-center justify-between max-w-4xl mx-auto mb-8">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${
                        currentStep === step
                          ? 'bg-[#8a6bfe] text-white scale-110'
                          : currentStep > step
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step ? <Check size={24} /> : step}
                    </button>
                    {step < 4 && (
                      <div className={`w-16 md:w-32 h-1 mx-2 ${
                        currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Étape 1 : Créer une annonce */}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="bg-[#8a6bfe] text-white px-4 py-2 rounded-lg inline-block mb-4 font-semibold">
                        Étape 1
                      </div>
                      <h3 className="text-3xl font-bold mb-4">Créez votre annonce</h3>
                      <p className="text-gray-600 mb-6">
                        Décrivez votre besoin en quelques clics : titre, description, localisation, rémunération et durée. 
                        Simple et rapide, sans formulaire compliqué.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Formulaire intuitif en 5 champs</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Aperçu en temps réel</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Publication instantanée</span>
                        </li>
                      </ul>
                      <button 
                        onClick={() => setCurrentStep(2)}
                        className="mt-6 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
                      >
                        Étape suivante
                        <ArrowRight size={20} />
                      </button>
                    </div>
                    <div>
                      {/* Mockup formulaire */}
                      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                        <h4 className="font-bold mb-4 text-lg">Nouvelle annonce</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Titre de la mission</label>
                            <input 
                              type="text" 
                              value="Aide au déménagement de meubles"
                              readOnly
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea 
                              value="Besoin d'aide pour déplacer des meubles..."
                              readOnly
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">Ville</label>
                              <input 
                                type="text" 
                                value="Louvain-la-Neuve"
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Rémunération/h</label>
                              <input 
                                type="text" 
                                value="12€"
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                              />
                            </div>
                          </div>
                          <button className="w-full bg-[#8a6bfe] text-white py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed">
                            Publier l'annonce
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2 : Recevoir des candidatures */}
              {currentStep === 2 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="bg-[#8a6bfe] text-white px-4 py-2 rounded-lg inline-block mb-4 font-semibold">
                        Étape 2
                      </div>
                      <h3 className="text-3xl font-bold mb-4">Recevez des candidatures</h3>
                      <p className="text-gray-600 mb-6">
                        Les étudiants intéressés postulent à votre annonce. Vous recevez une notification 
                        et pouvez consulter leur profil complet : expériences, notes, avis.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Notifications en temps réel</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Profils détaillés avec notes</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Historique de missions</span>
                        </li>
                      </ul>
                      <div className="flex gap-3 mt-6">
                        <button 
                          onClick={() => setCurrentStep(1)}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                        >
                          Retour
                        </button>
                        <button 
                          onClick={() => setCurrentStep(3)}
                          className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
                        >
                          Étape suivante
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                    <div>
                      {/* Mockup candidatures */}
                      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-lg">Candidatures (3)</h4>
                          <span className="bg-[#8a6bfe] text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Nouvelles
                          </span>
                        </div>
                        <div className="space-y-3">
                          {[
                            { name: 'Sarah Johnson', note: '4.9', missions: '23' },
                            { name: 'Marc Dubois', note: '4.7', missions: '15' },
                            { name: 'Emma Martin', note: '5.0', missions: '31' }
                          ].map((candidate, i) => (
                            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#8a6bfe] transition cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full"></div>
                                <div className="flex-1">
                                  <p className="font-semibold">{candidate.name}</p>
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                      <span>{candidate.note}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{candidate.missions} missions</span>
                                  </div>
                                </div>
                                <button className="text-[#8a6bfe] font-semibold text-sm hover:underline">
                                  Voir profil
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 3 : Choisir et contacter */}
              {currentStep === 3 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="bg-[#8a6bfe] text-white px-4 py-2 rounded-lg inline-block mb-4 font-semibold">
                        Étape 3
                      </div>
                      <h3 className="text-3xl font-bold mb-4">Choisissez et contactez</h3>
                      <p className="text-gray-600 mb-6">
                        Sélectionnez le candidat qui vous convient le mieux et contactez-le directement 
                        via la messagerie intégrée. Organisez les détails de la mission en toute simplicité.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Messagerie sécurisée</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Échange de coordonnées facilité</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Confirmation de mission</span>
                        </li>
                      </ul>
                      <div className="flex gap-3 mt-6">
                        <button 
                          onClick={() => setCurrentStep(2)}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                        >
                          Retour
                        </button>
                        <button 
                          onClick={() => setCurrentStep(4)}
                          className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
                        >
                          Étape suivante
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                    <div>
                      {/* Mockup messagerie */}
                      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                        <div className="flex items-center gap-3 pb-4 border-b mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full"></div>
                          <div>
                            <p className="font-semibold">Sarah Johnson</p>
                            <p className="text-xs text-gray-500">En ligne</p>
                          </div>
                        </div>
                        <div className="space-y-3 mb-4">
                          <div className="bg-[#f5e5ff] rounded-lg p-3 ml-auto max-w-[80%]">
                            <p className="text-sm">Bonjour Sarah ! Votre profil m'intéresse 😊</p>
                            <p className="text-xs text-gray-500 mt-1">14:23</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 mr-auto max-w-[80%] border border-gray-200">
                            <p className="text-sm">Bonjour ! Je suis disponible samedi matin.</p>
                            <p className="text-xs text-gray-500 mt-1">14:24</p>
                          </div>
                          <div className="bg-[#f5e5ff] rounded-lg p-3 ml-auto max-w-[80%]">
                            <p className="text-sm">Parfait ! On se retrouve à 9h ?</p>
                            <p className="text-xs text-gray-500 mt-1">14:26</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Votre message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
                          />
                          <button className="bg-[#8a6bfe] text-white px-4 py-2 rounded-lg">
                            <MessageCircle size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 4 : Noter et valider */}
              {currentStep === 4 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="bg-green-500 text-white px-4 py-2 rounded-lg inline-block mb-4 font-semibold">
                        Étape 4
                      </div>
                      <h3 className="text-3xl font-bold mb-4">Validez et notez</h3>
                      <p className="text-gray-600 mb-6">
                        Une fois la mission terminée, validez-la et laissez une note et un avis. 
                        Cela aide la communauté à identifier les meilleurs prestataires.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Validation mutuelle requise</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Notation sur 5 étoiles</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="text-green-500 mt-1" size={20} />
                          <span>Avis publics et transparents</span>
                        </li>
                      </ul>
                      <div className="flex gap-3 mt-6">
                        <button 
                          onClick={() => setCurrentStep(3)}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                        >
                          Retour
                        </button>
                        <button 
                          onClick={() => setCurrentStep(1)}
                          className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition flex items-center gap-2"
                        >
                          <Check size={20} />
                          Recommencer la démo
                        </button>
                      </div>
                    </div>
                    <div>
                      {/* Mockup notation */}
                      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                        <h4 className="font-bold text-lg mb-4">Mission terminée ✅</h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full"></div>
                            <div>
                              <p className="font-semibold">Sarah Johnson</p>
                              <p className="text-sm text-gray-500">Aide au déménagement</p>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Votre note</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={32} 
                                  className="fill-yellow-400 text-yellow-400 cursor-pointer hover:scale-110 transition"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Votre avis (optionnel)</label>
                            <textarea 
                              placeholder="Excellent travail, ponctuelle et efficace !"
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">
                            Valider la mission
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Sarah recevra également une notification pour vous noter
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Démo pour Étudiant */}
      {activeTab === 'student' && (
        <section className="py-16 px-6 bg-gradient-to-b from-white to-[#f5e5ff]/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Parcours Étudiant</h2>
              <p className="text-xl text-gray-600">Trouvez des missions et gagnez de l'argent facilement</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Option 1 : Postuler aux annonces */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="bg-[#8a6bfe] text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Eye size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Option 1 : Parcourir les annonces</h3>
                <p className="text-gray-600 mb-6">
                  Consultez les annonces disponibles et postulez à celles qui vous intéressent.
                </p>
                
                {/* Mockup liste d'annonces */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold mb-3 text-sm">Annonces près de vous</h4>
                  <div className="space-y-2">
                    {[
                      { title: 'Aide déménagement', lieu: 'LLN', prix: '12€/h' },
                      { title: 'Garde d\'enfants', lieu: 'Ottignies', prix: '10€/h' },
                      { title: 'Jardinage', lieu: 'Wavre', prix: '11€/h' }
                    ].map((job, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-[#8a6bfe] transition cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">{job.title}</p>
                            <p className="text-xs text-gray-500">{job.lieu}</p>
                          </div>
                          <span className="text-[#8a6bfe] font-bold text-sm">{job.prix}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={16} />
                    <span>Filtrez par lieu et rémunération</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={16} />
                    <span>Postulez en 1 clic</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={16} />
                    <span>L'employeur vous contacte</span>
                  </li>
                </ul>
              </div>

              {/* Option 2 : Se rendre disponible */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="bg-[#b89fff] text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <MousePointer size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Option 2 : Me rendre disponible</h3>
                <p className="text-gray-600 mb-6">
                  Créez votre profil public et laissez les employeurs vous contacter directement.
                </p>
                
                {/* Mockup profil public */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full"></div>
                    <div>
                      <p className="font-bold">Votre Profil</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">4.9</span>
                        <span className="text-gray-500">(23 avis)</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 mb-2">
                    <p className="text-xs text-gray-600 mb-2">Disponibilités</p>
                    <div className="flex gap-2">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Soirs</span>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Week-ends</span>
                    </div>
                  </div>
                  <button className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-semibold">
                    ✓ Disponible
                  </button>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={16} />
                    <span>Profil visible par tous</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={16} />
                    <span>Recevez des propositions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={16} />
                    <span>Choisissez vos missions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Avantages étudiant */}
            <div className="bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-2xl p-8 text-white text-center">
              <h3 className="text-3xl font-bold mb-4">Pourquoi devenir prestataire Woppy ?</h3>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div>
                  <div className="text-4xl mb-2">💰</div>
                  <h4 className="font-bold mb-2">Rémunération flexible</h4>
                  <p className="text-sm opacity-90">Choisissez vos missions selon vos disponibilités</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">⭐</div>
                  <h4 className="font-bold mb-2">Construisez votre réputation</h4>
                  <p className="text-sm opacity-90">Notes et avis visibles par tous les employeurs</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">🚀</div>
                  <h4 className="font-bold mb-2">Pas de CV nécessaire</h4>
                  <p className="text-sm opacity-90">Votre profil et vos notes parlent pour vous</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Vidéo explicative */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Regardez Woppy en vidéo</h2>
          <p className="text-xl text-gray-600 mb-8">
            Découvrez en 2 minutes comment fonctionne la plateforme
          </p>
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8a6bfe]/80 to-[#b89fff]/80"></div>
            <button className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <Play className="text-[#8a6bfe] ml-1" size={32} />
            </button>
            <p className="absolute bottom-6 left-0 right-0 text-white font-semibold text-lg">
              Tutoriel complet - 2:30
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            La vidéo sera bientôt disponible
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#8a6bfe] via-[#9b7bff] to-[#b89fff] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Convaincu ? Lancez-vous !
          </h2>
          <p className="text-xl opacity-95 mb-10">
            Créez votre compte gratuitement et rejoignez la communauté Woppy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="bg-white text-[#8a6bfe] px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-50 transition shadow-xl inline-flex items-center justify-center gap-2"
            >
              Créer mon compte
              <ArrowRight size={24} />
            </Link>
            <Link 
              href="/" 
              className="text-white border-2 border-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white/10 transition"
            >
              En savoir plus
            </Link>
          </div>
          <p className="mt-8 text-sm opacity-80">
            ✓ Sans engagement  •  ✓ Gratuit  •  ✓ 2 minutes d'inscription
          </p>
        </div>
      </section>
    </main>
  );
}