"use client";
import CareersList from "./CareerList";
import { Rocket, Users, Heart, Zap } from "lucide-react";

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-16">
          {/* Badge animé */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-full mb-6 animate-bounce-slow">
            <Rocket className="w-4 h-4 text-[#7b5bff]" />
            <span className="text-xl font-bold text-[#7b5bff]">
              On recrute !
            </span>
          </div>

          {/* Titre principal */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
            Rejoins l'équipe Woppy
          </h1>

          {/* Sous-titre */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Nous construisons la plateforme qui rend le travail flexible simple et accessible.
            Découvre nos postes ouverts, mis à jour en temps réel.
          </p>

          {/* CTA secondaire */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#postes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7b5bff] text-white font-bold rounded-xl hover:bg-[#7b5bff] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Voir les postes
              <span className="text-lg">↓</span>
            </a>
            <a
              href="#culture"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#7b5bff] font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-[#7b5bff]"
            >
              Notre culture
            </a>
          </div>
        </div>

        {/* Valeurs / Avantages */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Équipe passionnée
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Travaille avec des personnes talentueuses qui partagent ta vision
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Impact réel
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tes contributions façonnent directement l'avenir du travail flexible
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Flexibilité totale
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Remote-first, horaires flexibles et équilibre vie pro/perso
            </p>
          </div>
        </div>
      </div>

      {/* Section des postes */}
      <div id="postes" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Postes ouverts
            </h2>
            <p className="text-gray-600">
              Trouve le rôle qui correspond à tes compétences et ambitions
            </p>
          </div>
          
          {/* Indicateur en temps réel */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">
              Mis à jour en direct
            </span>
          </div>
        </div>

        <CareersList />
      </div>

      {/* Section Culture (optionnelle) */}
      <div id="culture" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Tu ne trouves pas ce que tu cherches ?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Envoie-nous une candidature spontanée. Nous sommes toujours à la recherche de talents exceptionnels.
          </p>
          <a
            href="mailto:careers@woppy.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Candidature spontanée
            <span className="text-lg">→</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}