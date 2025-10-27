'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Star, MessageSquare, MapPin, Clock, Euro, Users, Briefcase } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-white text-gray-900">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-[#e3d4ff] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo Woppy" width={32} height={32} className="rounded-md" />
            <span className="text-2xl font-bold text-[#8a6bfe]">Woppy</span>
          </Link>

          {/* Liens principaux */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="hover:text-[#8a6bfe] transition">Fonctionnalités</Link>
            <Link href="#etudiants" className="hover:text-[#8a6bfe] transition">Étudiants</Link>
            <Link href="#jobs" className="hover:text-[#8a6bfe] transition">Emplois</Link>
          </div>

          {/* Boutons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-[#8a6bfe] font-medium">
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition"
            >
              Commencer
            </Link>
          </div>

          {/* Mobile */}
          <button
            className="md:hidden text-[#8a6bfe]"
            onClick={() => {
              const el = document.getElementById('mobile-menu');
              el?.classList.toggle('hidden');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div id="mobile-menu" className="hidden md:hidden flex flex-col gap-3 bg-white border-t border-[#e3d4ff] px-6 py-4">
          <Link href="#features" className="hover:text-[#8a6bfe]" onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}>
            Fonctionnalités
          </Link>
          <Link href="#etudiants" className="hover:text-[#8a6bfe]">Étudiants</Link>
          <Link href="#jobs" className="hover:text-[#8a6bfe]">Emplois</Link>
          <hr />
          <Link href="/auth/login" className="text-gray-600">Connexion</Link>
          <Link href="/auth/register" className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white text-center px-4 py-2.5 rounded-lg font-semibold mt-2">
            Commencer
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900 mb-6">
              Trouvez de l’aide,
              <span className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] bg-clip-text text-transparent">
                ou aidez près de chez vous
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Woppy connecte étudiants et particuliers pour des petits jobs rapides et rémunérés à Louvain-la-Neuve et alentours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                Rejoindre gratuitement
                <ArrowRight className="group-hover:translate-x-1 transition" size={20} />
              </Link>
              <Link
                href="/auth/login"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-[#8a6bfe] hover:text-[#8a6bfe]"
              >
                J’ai déjà un compte
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Check className="text-green-500" size={18} /> Sans CV</div>
              <div className="flex items-center gap-2"><Check className="text-green-500" size={18} /> Gratuit</div>
            </div>
          </div>

          {/* Mockup */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 z-10 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Aide pour ménage rapide</h3>
                <span className="bg-[#8a6bfe] text-white text-xs px-3 py-1 rounded-full">12€/h</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Louvain-la-Neuve • Disponible ce week-end
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1"><Clock size={14} className="text-[#8a6bfe]" /> 3h</div>
                <div className="flex items-center gap-1"><MapPin size={14} className="text-[#8a6bfe]" /> À 800m</div>
              </div>
              <button className="w-full bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white py-3 rounded-lg font-semibold hover:shadow-lg">
                Contacter
              </button>
            </div>
            <div className="absolute -top-8 -right-8 w-72 h-72 bg-[#8a6bfe]/20 blur-3xl rounded-full" />
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-[#4C3E87]">Woppy simplifie le job étudiant</h2>
          <p className="text-lg text-gray-600">
            Une plateforme complète pour publier, trouver, et collaborer facilement.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: <Briefcase className="w-8 h-8 text-[#8a6bfe]" />,
              title: 'Publiez vos besoins',
              desc: 'En quelques clics, créez une annonce pour une aide ponctuelle. Rapide, simple et local.',
            },
            {
              icon: <Users className="w-8 h-8 text-[#8a6bfe]" />,
              title: 'Étudiants vérifiés',
              desc: 'Tous les profils sont vérifiés manuellement. Sécurité et fiabilité garanties.',
            },
            {
              icon: <MessageSquare className="w-8 h-8 text-[#8a6bfe]" />,
              title: 'Messagerie intégrée',
              desc: 'Discutez directement dans Woppy, sans partager de données personnelles.',
            },
          ].map((f, i) => (
            <div key={i} className="bg-[#f8f6ff] rounded-2xl p-8 border border-[#ebe3ff] hover:shadow-md transition">
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2 text-[#4C3E87]">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ETUDIANTS ===== */}
      <section id="etudiants" className="py-24 px-6 bg-gradient-to-b from-white to-[#f8f3ff]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-[#4C3E87] mb-4">Des étudiants disponibles maintenant</h2>
          <p className="text-lg text-gray-600">Profils réels, vérifiés et prêts à aider</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full" />
                <div>
                  <h4 className="font-semibold text-gray-900">Étudiant #{i}</h4>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill="#facc15" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                “Je propose de l’aide pour du jardinage, du montage de meubles et des déménagements.”
              </p>
              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                Disponible maintenant
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 bg-gradient-to-r from-[#8a6bfe] via-[#9b7bff] to-[#b89fff] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.svg')] bg-cover bg-center" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl font-bold mb-6">Prêt à rejoindre Woppy ?</h2>
          <p className="text-lg opacity-90 mb-8">
            Rejoignez des centaines d’étudiants et employeurs à Louvain-la-Neuve.  
            Gratuit, rapide et sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-white text-[#8a6bfe] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-lg flex items-center justify-center gap-2"
            >
              Créer mon compte <ArrowRight size={20} />
            </Link>
            <Link
              href="/auth/login"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10"
            >
              Se connecter
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-80">
            ✓ Gratuit pour toujours • ✓ Inscription en 2 minutes • ✓ Sans carte bancaire
          </p>
        </div>
      </section>
    </main>
  );
}
