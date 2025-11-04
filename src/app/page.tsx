'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Star,
  MessageSquare,
  MapPin,
  Clock,
  Euro,
  Users,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Sparkles
} from 'lucide-react';
import "./globals.css";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-white text-gray-900">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-[#e3d4ff] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo Woppy" width={36} height={36} className="rounded-md" />
            <span className="text-2xl font-bold text-[#8a6bfe]">Woppy</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="hover:text-[#8a6bfe] transition">Fonctionnalités</Link>
            <Link href="#etudiants" className="hover:text-[#8a6bfe] transition">Étudiants</Link>
            <Link href="#pricing" className="hover:text-[#8a6bfe] transition">Paiement sécurisé</Link>
          </div>

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

          {/* Bouton mobile */}
          <button
            className="md:hidden text-[#8a6bfe]"
            onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        <div id="mobile-menu" className="hidden md:hidden flex flex-col gap-3 bg-white border-t border-[#e3d4ff] px-6 py-4">
          <Link href="#features" className="hover:text-[#8a6bfe]">Fonctionnalités</Link>
          <Link href="#etudiants" className="hover:text-[#8a6bfe]">Étudiants</Link>
          <Link href="#paiement" className="hover:text-[#8a6bfe]">Paiement sécurisé</Link>
          <hr />
          <Link href="/auth/login" className="text-gray-600">Connexion</Link>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white text-center px-4 py-2.5 rounded-lg font-semibold mt-2"
          >
            Commencer
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#f5e5ff] via-white to-[#e8d5ff]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900 mb-6">
              Trouvez de l’aide,
              <span className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] bg-clip-text text-transparent">
                ou aidez près de chez vous
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Woppy connecte les étudiants vérifiés et les particuliers pour des petits jobs rapides, rémunérés et sécurisés à Louvain-la-Neuve et alentours.
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
              <div className="flex items-center gap-2"><Check className="text-green-500" size={18} /> Vérification manuelle</div>
              <div className="flex items-center gap-2"><Check className="text-green-500" size={18} /> Paiement sécurisé</div>
            </div>
          </div>

          {/* Mockup d'annonce */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 z-10 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Aide pour déménagement</h3>
                <span className="bg-[#8a6bfe] text-white text-xs px-3 py-1 rounded-full">16€/h</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Louvain-la-Neuve • Samedi matin</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1"><Clock size={14} className="text-[#8a6bfe]" /> 5h</div>
                <div className="flex items-center gap-1"><MapPin size={14} className="text-[#8a6bfe]" /> À 1,2 km</div>
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
          <h2 className="text-4xl font-bold mb-4 text-[#4C3E87]">Pourquoi choisir Woppy ?</h2>
          <p className="text-lg text-gray-600">
            Un environnement sûr, humain et rapide pour chaque mission.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: <Briefcase className="w-8 h-8 text-[#8a6bfe]" />,
              title: 'Publiez vos besoins',
              desc: 'Créez une annonce locale pour un coup de main ponctuel. Woppy s’occupe de la visibilité et de la sélection des étudiants.',
            },
            {
              icon: <Users className="w-8 h-8 text-[#8a6bfe]" />,
              title: 'Étudiants vérifiés à la main',
              desc: 'Chaque carte étudiante est contrôlée par notre équipe. Pas de faux profils, pas de triche. Vous embauchez en toute confiance.',
            },
            {
              icon: <MessageSquare className="w-8 h-8 text-[#8a6bfe]" />,
              title: 'Messagerie intégrée',
              desc: 'Discutez avant d’accepter une mission. Gardez toutes vos conversations au même endroit.',
            },
            {
              icon: <CreditCard className="w-8 h-8 text-[#8a6bfe]" />,
              title: 'Paiement sécurisé Stripe',
              desc: 'L’argent est bloqué tant que la mission n’est pas terminée. Woppy prélève 15% pour la gestion et la sécurité.',
            },
            {
              icon: <ShieldCheck className="w-8 h-8 text-[#8a6bfe]" />,
              title: 'Protection et confiance',
              desc: 'Profils notés, avis vérifiés et système de litiges intégré. Vous êtes couvert à chaque étape.',
            },
            {
              icon: <Sparkles className="w-8 h-8 text-[#8a6bfe]" />,
              title: 'Simple et gratuit à l’inscription',
              desc: 'Inscrivez-vous en 2 minutes. Aucun abonnement, aucune carte bancaire demandée.',
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
          <h2 className="text-4xl font-bold text-[#4C3E87] mb-4">Des étudiants fiables et motivés</h2>
          <p className="text-lg text-gray-600">Tous nos étudiants sont vérifiés manuellement avant d’être acceptés sur la plateforme.</p>
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
                “Je propose de l’aide pour le montage de meubles, les déménagements ou les travaux rapides.”
              </p>
              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                Carte vérifiée • Disponible
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PAIEMENT ===== */}
      <section className="py-24 px-6 bg-white" id="pricing">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#4C3E87] mb-6">Paiement sécurisé et transparent</h2>
            <p className="text-lg text-gray-600 mb-6">
              Woppy utilise <strong>Stripe Connect</strong> pour garantir la sécurité de chaque transaction.  
              L’argent du client est conservé en sécurité jusqu’à la fin de la mission, puis reversé à l’étudiant.
            </p>
            <ul className="text-gray-700 space-y-3">
              <li className="flex items-center gap-2"><Check className="text-green-500" /> 15% de commission pour la plateforme</li>
              <li className="flex items-center gap-2"><Check className="text-green-500" /> 85% reversés à l’étudiant</li>
              <li className="flex items-center gap-2"><Check className="text-green-500" /> Aucune donnée bancaire stockée par Woppy</li>
              <li className="flex items-center gap-2"><Check className="text-green-500" /> Conforme PSD2 et SCA (paiement européen sécurisé)</li>
            </ul>
          </div>
          <div className="relative">
            <Image
              src="/images/stripe-payment.png"
              alt="Paiement sécurisé Stripe"
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl border border-gray-100"
            />
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#8a6bfe]/20 blur-3xl rounded-full" />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 bg-gradient-to-r from-[#8a6bfe] via-[#9b7bff] to-[#b89fff] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.svg')] bg-cover bg-center" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl font-bold mb-6">Prêt à rejoindre Woppy ?</h2>
          <p className="text-lg opacity-90 mb-8">
            Rejoignez des centaines d’étudiants vérifiés et de particuliers à Louvain-la-Neuve.  
            Sécurité, rapidité et liberté en un clic.
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
            ✓ Gratuit • ✓ Étudiants vérifiés manuellement • ✓ Paiements Stripe sécurisés
          </p>
        </div>
      </section>
    </main>
  );
}
