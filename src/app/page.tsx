'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Star, Shield, Zap, Users, MapPin, Clock, Euro, ArrowRight, Check } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <Image
                  src="/images/logo.png"
                  alt="Logo Woppy"
                  width={24}
                  height={24}
                  className="rounded-md"
              />
            </div>
            <span className="text-2xl font-bold text-gray-900">Woppy</span>
          </div>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-[#8a6bfe] transition">
              Fonctionnalités
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-[#8a6bfe] transition">
              Comment ça marche
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-[#8a6bfe] transition">
              Tarifs
            </Link>
          </div>

          {/* Boutons desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-[#8a6bfe] transition font-medium">
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition"
            >
              Commencer
            </Link>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center gap-4">
            <button
              id="menu-toggle"
              className="text-[#8a6bfe] focus:outline-none"
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                menu?.classList.toggle('hidden');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu mobile */}
        <div id="mobile-menu" className="hidden md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 px-6 py-4 flex flex-col gap-4">
          <Link href="#features" className="text-gray-700 hover:text-[#8a6bfe] transition">
            Fonctionnalités
          </Link>
          <Link href="#how-it-works" className="text-gray-700 hover:text-[#8a6bfe] transition">
            Comment ça marche
          </Link>
          <Link href="#pricing" className="text-gray-700 hover:text-[#8a6bfe] transition">
            Tarifs
          </Link>
          <hr className="border-gray-200" />
          <Link href="/auth/login" className="text-gray-700 hover:text-[#8a6bfe] transition font-medium">
            Connexion
          </Link>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white text-center px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition"
          >
            Commencer
          </Link>
        </div>
      </nav>

      {/* Hero Section avec mockup */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
        <div className="mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texte */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700">Lancé à Louvain-la-Neuve 🚀</span>
              </div>
              <h1 className="text-5xl md:text-6xl text-black font-bold mb-6 leading-tight">
                Le coup de main qu'il vous faut,
                <span className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] bg-clip-text text-transparent"> en 2 clics</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connectez-vous avec des étudiants disponibles pour des jobs flexibles. 
                Promener un chien, nettoyer un kot, déplacer des meubles... tout se fait simplement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/auth/register" 
                  className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition flex items-center justify-center gap-2 group"
                >
                  Créer mon compte gratuit
                  <ArrowRight className="group-hover:translate-x-1 transition" size={20} />
                </Link>
                <Link 
                  href="#demo" 
                  className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-[#8a6bfe] hover:text-[#8a6bfe] transition"
                >
                  Voir la démo
                </Link>
              </div>
              <div className="flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="text-green-500" size={20} />
                  <span>Sans CV ni contrat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-green-500" size={20} />
                  <span>Gratuit pour tous</span>
                </div>
              </div>
            </div>

            {/* Mockup interface */}
            <div className="relative">
              <div className="relative z-10">
                {/* Simulation de l'interface - Carte d'emploi */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Aide au déménagement de meubles</h3>
                    <span className="bg-[#8a6bfe] text-white px-4 py-1.5 rounded-full text-sm font-semibold">OUVRIR</span>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">Louvain-La-Neuve</p>
                  <p className="text-gray-700 mb-4">
                    Besoin d'aide pour déplacer les meubles de l'appartement à l'unité de stockage. Levage lourd requis.
                  </p>
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#8a6bfe]" />
                      <span>15 mars 2025</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#8a6bfe]" />
                      <span>3 à 5 heures</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro size={16} className="text-[#8a6bfe]" />
                      <span className="font-semibold text-[#8a6bfe]">12€/h</span>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">
                    Contacter
                  </button>
                </div>

                {/* Simulation profils étudiants */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Étudiants disponibles</h3>
                    <button className="bg-[#8a6bfe] text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      Marquez-vous disponible
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full mx-auto mb-3"></div>
                        <div className="text-center">
                          <p className="font-semibold text-sm mb-1 text-black">Sarah Johnson</p>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">4.9</span>
                          </div>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            Disponible
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Éléments décoratifs */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-[#8a6bfe]/20 to-[#b89fff]/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-tr from-[#ddc2ff]/30 to-[#f5e5ff]/30 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Logos / Social Proof */}
      <section className="py-12 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-medium text-gray-500 mb-6">REJOIGNEZ DES CENTAINES D'ÉTUDIANTS</p>
          <div className="flex items-center justify-center text-[#755CD1] gap-4 opacity-80">
            <div className="text-2xl font-bold">UCLouvain,</div>
            <div className="text-2xl font-bold">Ephec,</div>
            <div className="text-2xl font-bold">...</div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités avec screenshots */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-white to-[#f5e5ff]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#4C3E87]">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour connecter étudiants et employeurs en toute simplicité
            </p>
          </div>

          {/* Feature 1 - Double Marketplace */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="inline-block bg-[#8a6bfe]/10 text-[#8a6bfe] px-4 py-2 rounded-lg font-semibold mb-4">
                🎯 Double Marketplace
              </div>
              <h3 className="text-3xl font-bold mb-4 text-[#4C3E87]">Deux façons de se connecter</h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Publiez une annonce publique et recevez des candidatures, ou parcourez directement 
                les profils d'étudiants disponibles. À vous de choisir !
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                    <Check size={16} />
                  </div>
                  <span className="text-gray-700">Annonces publiques avec système de candidature</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                    <Check size={16} />
                  </div>
                  <span className="text-gray-700">Profils étudiants consultables avec contact direct</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                    <Check size={16} />
                  </div>
                  <span className="text-gray-700">Vous choisissez votre étudiant, pas l'inverse</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-white to-[#f5e5ff] rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#8a6bfe]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#8a6bfe] rounded-full"></div>
                      <div>
                        <p className="font-semibold text-[#4C3E87]">Partie 1: Annonces</p>
                        <p className="text-xs text-gray-500">Publiez et recevez des candidatures</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#b89fff]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#b89fff] rounded-full"></div>
                      <div>
                        <p className="font-semibold text-[#4C3E87]">Partie 2: Profils</p>
                        <p className="text-xs text-gray-500">Parcourez et contactez directement</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - Tri intelligent */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 lg:order-1 relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="flex gap-2 mb-4">
                  <button className="flex-1 bg-[#8a6bfe] text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    Par lieu
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold">
                    Par prix
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold">
                    Par date
                  </button>
                </div>
                <div className="space-y-3">
                  {['Louvain-la-Neuve', 'Ottignies', 'Wavre'].map((city, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <MapPin size={20} className="text-[#8a6bfe]" />
                        <span className="font-medium text-gray-500">{city}</span>
                      </div>
                      <span className="text-sm text-gray-500">{12 - i * 3} offres</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block bg-[#8a6bfe]/10 text-[#8a6bfe] px-4 py-2 rounded-lg font-semibold mb-4">
                🔍 Tri Intelligent
              </div>
              <h3 className="text-3xl font-bold mb-4 text-[#4C3E87]">Trouvez exactement ce que vous cherchez</h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Filtrez les annonces et profils selon vos critères : localisation, rémunération, 
                disponibilité, expérience et notes. L'algorithme met en avant les meilleurs profils.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                    <Check size={16} />
                  </div>
                  <span className="text-gray-700">Tri par ville, région et distance</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                    <Check size={16} />
                  </div>
                  <span className="text-gray-700">Filtrage par rémunération et échéance</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                    <Check size={16} />
                  </div>
                  <span className="text-gray-700">Mise en avant par notes et expérience</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 - Messagerie & Notation */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-[#8a6bfe]/10 text-[#8a6bfe] px-4 py-2 rounded-lg font-semibold mb-4">
                💬 Messagerie & Notation
              </div>
              <h3 className="text-3xl font-bold mb-4 text-[#4C3E87]">Échangez en toute confiance</h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Discutez directement avec les étudiants ou employeurs via notre messagerie sécurisée. 
                Après chaque mission, notez-vous mutuellement pour construire la confiance.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                    <Check size={16} />
                  </div>
                  <span className="text-gray-700">Messagerie intégrée et sécurisée</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                    <Check size={16} />
                  </div>
                  <span className="text-gray-700">Système de notation sur 5 étoiles</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                    <Check size={16} />
                  </div>
                  <span className="text-gray-700">Historique et avis publics</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full"></div>
                  <div>
                    <p className="font-semibold text-[#8a6bfe]">Sarah Johnson</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">4.9 (127 avis)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-[#f5e5ff] rounded-lg p-3 ml-auto max-w-[80%]">
                    <p className="text-sm text-gray-700">Bonjour ! Je suis disponible samedi matin 😊</p>
                    <p className="text-xs text-gray-500 mt-1">10:24</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 mr-auto max-w-[80%]">
                    <p className="text-sm text-gray-700">Parfait ! On se retrouve à 9h ?</p>
                    <p className="text-xs text-gray-500 mt-1">10:26</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#8a6bfe]">
              Simple comme bonjour
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Commencez en quelques minutes et trouvez votre premier job ou étudiant
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Ligne de connexion */}
            <div className="hidden md:block absolute text-black top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] opacity-20"></div>

            {[
              {
                step: '1',
                title: 'Inscrivez-vous',
                desc: 'Créez votre compte en 2 minutes avec email et mot de passe',
                icon: '📧'
              },
              {
                step: '2',
                title: 'Créez votre profil',
                desc: 'Ajoutez vos infos, expériences et disponibilités',
                icon: '👤'
              },
              {
                step: '3',
                title: 'Connectez-vous',
                desc: 'Publiez une annonce ou parcourez les profils disponibles',
                icon: '🔗'
              },
              {
                step: '4',
                title: 'Validez & Notez',
                desc: 'Confirmez le travail et laissez un avis',
                icon: '⭐'
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-[#8a6bfe] hover:shadow-xl transition text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                    {item.step}
                  </div>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-[#4C3E87] text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Tarification */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-[#f5e5ff]/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl text-[#4C3E87] font-bold mb-4">
              Commencez gratuitement
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Aucun frais caché, aucune carte bancaire requise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Gratuit */}
            <div className="bg-white text-black rounded-2xl p-8 border-2 border-gray-200 hover:border-[#8a6bfe] transition">
              <h3 className="text-2xl font-bold mb-2">Standard</h3>
              <p className="text-gray-600 mb-6">Pour tous les utilisateurs</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">20€</span>
                <span className="text-gray-600">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={20} />
                  <span>Annonces illimitées</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={20} />
                  <span>Messagerie complète</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={20} />
                  <span>Système de notation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={20} />
                  <span>Support communauté</span>
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                Commencer
              </button>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-2xl p-8 text-white transform scale-105 shadow-2xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                BIENTÔT
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-white/80 mb-6">Pour se démarquer</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">50€</span>
                <span className="text-white/80">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="text-white" size={20} />
                  <span>Tout du gratuit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-white" size={20} />
                  <span>Badge Premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-white" size={20} />
                  <span>Référencement prioritaire</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-white" size={20} />
                  <span>Plus de jobs/semaine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-white" size={20} />
                  <span>Support prioritaire</span>
                </li>
              </ul>
              <button className="w-full bg-white text-[#8a6bfe] py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
                Bientôt disponible
              </button>
            </div>

            {/* Entreprise */}
            <div className="bg-white text-black rounded-2xl p-8 border-2 border-gray-200 hover:border-[#8a6bfe] transition">
              <h3 className="text-2xl font-bold mb-2">Entreprise</h3>
              <p className="text-gray-600 mb-6">Pour les pros</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">Sur mesure</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={20} />
                  <span>Tout du Premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={20} />
                  <span>Compte équipe</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={20} />
                  <span>Facturation centralisée</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-green-500" size={20} />
                  <span>Account manager dédié</span>
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                Nous contacter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA Final */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#8a6bfe] via-[#9b7bff] to-[#b89fff] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à rejoindre Woppy ?
          </h2>
          <p className="text-xl opacity-95 mb-10 leading-relaxed">
            Rejoignez des centaines d'étudiants et employeurs à Louvain-la-Neuve. 
            Inscription gratuite, sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup" 
              className="bg-white text-[#8a6bfe] px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-50 transition shadow-xl inline-flex items-center gap-2"
            >
              Créer mon compte
              <ArrowRight size={24} />
            </Link>
            <Link 
              href="/demo" 
              className="text-white border-2 border-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white/10 transition"
            >
              Voir une démo
            </Link>
          </div>
          <p className="mt-8 text-sm opacity-80">
            ✓ Gratuit pour toujours  •  ✓ Inscription en 2 minutes  •  ✓ Sans CB
          </p>
        </div>
      </section>

    </main>
  );
}