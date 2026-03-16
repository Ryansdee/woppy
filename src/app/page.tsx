'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import {
  ArrowRight, MapPin, Clock, Star, Shield, CreditCard,
  Briefcase, Users, CheckCircle, ChevronRight, Zap,
  UserCheck, Search, FileCheck, BadgeCheck, TrendingUp,
  Building2, GraduationCap, Menu, X
} from 'lucide-react';

/* ─────────────── DONNÉES STATIQUES ─────────────── */

const jobCategories = [
  { label: 'Déménagement', icon: '📦', count: '34 jobs' },
  { label: 'Jardinage', icon: '🌿', count: '21 jobs' },
  { label: 'Aide informatique', icon: '💻', count: '18 jobs' },
  { label: 'Cours particuliers', icon: '📚', count: '47 jobs' },
  { label: 'Livraison', icon: '🚴', count: '29 jobs' },
  { label: 'Nettoyage', icon: '🧹', count: '15 jobs' },
  { label: 'Bricolage', icon: '🔧', count: '22 jobs' },
  { label: "Garde d'animaux", icon: '🐾', count: '11 jobs' },
];

const featuredJobs = [
  {
    title: 'Aide pour déménagement',
    category: 'Transport',
    rate: '16€/h',
    duration: '5h',
    location: 'Louvain-la-Neuve',
    rating: 4.9,
    reviews: 12,
    urgent: true,
    date: 'Samedi 22 mars',
  },
  {
    title: 'Cours de mathématiques',
    category: 'Tutorat',
    rate: '18€/h',
    duration: '2h',
    location: 'Ottignies',
    rating: 5.0,
    reviews: 8,
    urgent: false,
    date: 'Flexible',
  },
  {
    title: 'Jardinage & taille haies',
    category: 'Jardinage',
    rate: '14€/h',
    duration: '4h',
    location: 'Wavre',
    rating: 4.7,
    reviews: 5,
    urgent: false,
    date: 'Dimanche 23 mars',
  },
];

const steps = [
  {
    step: '01',
    title: 'Créez votre profil',
    desc: 'Inscription gratuite en 2 minutes. Votre identité est vérifiée manuellement par notre équipe.',
    icon: <UserCheck size={22} />,
  },
  {
    step: '02',
    title: 'Trouvez une mission',
    desc: 'Parcourez les annonces près de chez vous. Filtrez par catégorie, tarif ou disponibilité.',
    icon: <Search size={22} />,
  },
  {
    step: '03',
    title: 'Postulez en un clic',
    desc: 'Envoyez votre candidature directement au particulier. Pas de CV requis.',
    icon: <FileCheck size={22} />,
  },
  {
    step: '04',
    title: 'Soyez payé via Stripe',
    desc: 'Le paiement est sécurisé et libéré une fois la mission validée par les deux parties.',
    icon: <CreditCard size={22} />,
  },
];

const testimonials = [
  {
    name: 'Lucas M.',
    role: 'Étudiant en droit',
    text: "En un weekend, j'ai gagné 80€ en aidant deux familles à déménager. L'app est super claire et le paiement arrive vite.",
    rating: 5,
    avatar: 'LM',
    color: '#8a6bfe',
  },
  {
    name: 'Isabelle D.',
    role: 'Particulière, Ottignies',
    text: "J'ai trouvé quelqu'un en moins de 2h pour tondre mon jardin. Sérieux, ponctuel, vraiment rassurant de savoir que les profils sont vérifiés.",
    rating: 5,
    avatar: 'ID',
    color: '#6a4fe0',
  },
  {
    name: 'Thomas V.',
    role: 'Étudiant en informatique',
    text: "Woppy me permet de trouver des missions d'aide informatique régulièrement. C'est devenu un vrai complément de revenus.",
    rating: 5,
    avatar: 'TV',
    color: '#b89fff',
  },
];

/* ─────────────── COMPOSANTS ─────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={13}
          className={n <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </div>
  );
}

function JobCard({ job, delay = 0 }: { job: typeof featuredJobs[0]; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group bg-white rounded-2xl border border-slate-100 hover:border-violet-200 p-6
                 hover:shadow-[0_8px_40px_rgba(138,107,254,0.12)] transition-all duration-300 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
              {job.category}
            </span>
            {job.urgent && (
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Zap size={10} className="fill-orange-500" /> Urgent
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-violet-700 transition-colors">
            {job.title}
          </h3>
        </div>
        <div className="ml-4 text-right">
          <div className="text-xl font-extrabold text-violet-600 font-sora">{job.rate}</div>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-5">
        <span className="flex items-center gap-1.5">
          <MapPin size={13} className="text-violet-400" /> {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} className="text-violet-400" /> {job.duration}
        </span>
        <span className="flex items-center gap-1.5">
          <TrendingUp size={13} className="text-violet-400" /> {job.date}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <StarRating rating={job.rating} />
          <span className="text-xs font-medium text-slate-600">{job.rating} ({job.reviews} avis)</span>
        </div>
        <button className="flex items-center gap-1 text-sm font-semibold text-violet-600
                           group-hover:gap-2 transition-all duration-200">
          Postuler <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────── PAGE PRINCIPALE ─────────────── */

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'student' | 'client'>('student');

  useEffect(() => {
    if (Cookies.get('woppy_user')) setIsLoggedIn(true);
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* ══════════════════ FONTS ══════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        .font-sora { font-family: 'Sora', sans-serif; }
        body, .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .gradient-text {
          background: linear-gradient(135deg, #8a6bfe 0%, #6a4fe0 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-grid {
          background-image: radial-gradient(circle, rgba(138,107,254,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float { animation: float 4s ease-in-out infinite; }
        .float-slow { animation: float 6s ease-in-out infinite 1s; }
      `}</style>

      {/* ══════════════════ NAV ══════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
              <span className="font-sora font-bold text-white text-sm">W</span>
            </div>
            <span className="font-sora font-bold text-xl text-slate-900 tracking-tight">woppy</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {[['#jobs', 'Jobs disponibles'], ['#comment', 'Comment ça marche'], ['#avis', 'Avis']].map(([href, label]) => (
              <a key={href} href={href}
                className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard"
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white
                           text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Mon espace <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link href="/auth/login"
                  className="text-sm font-semibold text-slate-600 hover:text-violet-600 px-4 py-2 transition-colors">
                  Connexion
                </Link>
                <Link href="/auth/register"
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white
                             text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm
                             shadow-violet-200">
                  S'inscrire gratuitement
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 flex flex-col gap-4">
            {[['#jobs', 'Jobs disponibles'], ['#comment', 'Comment ça marche'], ['#avis', 'Avis']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-700 py-1">
                {label}
              </a>
            ))}
            <hr className="border-slate-100" />
            <Link href="/auth/login" className="text-sm font-medium text-slate-600 py-1">Connexion</Link>
            <Link href="/auth/register"
              className="bg-violet-600 text-white text-sm font-semibold text-center py-3 rounded-xl">
              S'inscrire gratuitement
            </Link>
          </div>
        )}
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="pt-24 pb-0 relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid opacity-60" />
        {/* Gradient overlay */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />

        <div className="max-w-6xl mx-auto px-5 relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8 pt-8"
          >
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700
                            text-xs font-semibold px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
              Plateforme de jobs étudiants à Louvain-la-Neuve
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-sora font-extrabold text-center text-5xl md:text-[68px] leading-[1.07]
                       tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto"
          >
            Le job étudiant,{' '}
            <span className="gradient-text">simple et sécurisé</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-slate-500 text-lg md:text-xl font-light max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Woppy connecte étudiants vérifiés et particuliers pour des missions locales,
            rapides et rémunérées autour de Louvain-la-Neuve.
          </motion.p>

          {/* Dual CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <Link href="/auth/register?role=student"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white
                         font-sora font-semibold text-base px-7 py-4 rounded-2xl transition-all
                         shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5
                         w-full sm:w-auto justify-center">
              <GraduationCap size={18} /> Je suis étudiant
            </Link>
            <Link href="/auth/register?role=client"
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800
                         font-sora font-semibold text-base px-7 py-4 rounded-2xl transition-all
                         border-2 border-slate-200 hover:border-violet-300 hover:-translate-y-0.5
                         w-full sm:w-auto justify-center">
              <Building2 size={18} /> Je cherche de l'aide
            </Link>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 flex-wrap text-sm text-slate-500 mb-14"
          >
            {[
              ['✓', 'Inscription gratuite'],
              ['✓', 'Étudiants vérifiés manuellement'],
              ['✓', 'Paiement sécurisé Stripe'],
              ['✓', 'Sans CV requis'],
            ].map(([check, label]) => (
              <span key={label} className="flex items-center gap-1.5 font-medium">
                <span className="text-violet-500 font-bold">{check}</span> {label}
              </span>
            ))}
          </motion.div>

          {/* Hero card mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative max-w-3xl mx-auto"
          >
            {/* Main bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_20px_80px_rgba(138,107,254,0.15)] p-3 flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <Search size={16} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-400">Rechercher un job ou une mission…</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3">
                <MapPin size={14} className="text-violet-500 shrink-0" />
                <span className="text-sm font-medium text-slate-600">Louvain-la-Neuve</span>
              </div>
              <button className="bg-violet-600 text-white text-sm font-semibold px-5 py-3 rounded-xl
                                 hover:bg-violet-700 transition-colors shrink-0">
                Rechercher
              </button>
            </div>

            {/* Floating stat chips */}
            <div className="float absolute -left-4 top-[-28px] bg-white rounded-2xl border border-slate-100
                            shadow-lg px-4 py-3 flex items-center gap-2.5 text-sm font-semibold text-slate-800">
              <span className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-base">🟢</span>
              <div>
                <div className="text-xs text-slate-400 font-normal">Disponibles</div>
                <div className="font-bold text-slate-800">142 missions</div>
              </div>
            </div>
            <div className="float-slow absolute -right-4 top-[-28px] bg-white rounded-2xl border border-slate-100
                            shadow-lg px-4 py-3 flex items-center gap-2.5 text-sm font-semibold text-slate-800
                            hidden sm:flex">
              <span className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center text-base">⭐</span>
              <div>
                <div className="text-xs text-slate-400 font-normal">Note moyenne</div>
                <div className="font-bold text-slate-800">4.8 / 5</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ CATÉGORIES ══════════════════ */}
      <section className="pt-20 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-sora font-bold text-2xl text-slate-900">Parcourir par catégorie</h2>
            <a href="#jobs" className="text-sm font-semibold text-violet-600 flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ChevronRight size={15} />
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {jobCategories.map((cat, i) => (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="group flex flex-col items-center gap-2 bg-slate-50 hover:bg-violet-50
                           border border-slate-100 hover:border-violet-200 rounded-2xl p-4
                           transition-all duration-200 cursor-pointer"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-violet-700 text-center leading-tight">
                  {cat.label}
                </span>
                <span className="text-[10px] text-slate-400">{cat.count}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ JOBS ══════════════════ */}
      <section id="jobs" className="py-16 bg-slate-50/60">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-1">En ce moment</div>
              <h2 className="font-sora font-bold text-3xl text-slate-900">Missions disponibles</h2>
            </div>
            <div className="flex gap-2">
              {['Tous', 'Urgent', 'Bien noté', 'Proche'].map(f => (
                <button key={f}
                  className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200
                             bg-white hover:border-violet-300 hover:text-violet-600 transition-colors text-slate-600">
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {featuredJobs.map((job, i) => (
              <JobCard key={job.title} job={job} delay={i * 0.1} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 bg-white border-2 border-violet-200 text-violet-700
                         font-sora font-semibold text-sm px-7 py-3.5 rounded-2xl hover:border-violet-400
                         hover:bg-violet-50 transition-all">
              Voir toutes les missions <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ DUAL VALUE PROP ══════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <div className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-2">Pour tout le monde</div>
            <h2 className="font-sora font-extrabold text-4xl md:text-5xl text-slate-900 leading-tight">
              Woppy s'adapte<br />à votre situation
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
              <button
                onClick={() => setActiveTab('student')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${activeTab === 'student' ? 'bg-white shadow-sm text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <GraduationCap size={16} /> Je suis étudiant
              </button>
              <button
                onClick={() => setActiveTab('client')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${activeTab === 'client' ? 'bg-white shadow-sm text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Building2 size={16} /> Je cherche de l'aide
              </button>
            </div>
          </div>

          {activeTab === 'student' && (
            <motion.div
              key="student"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {[
                { icon: '💸', title: "Gagnez jusqu'à 18€/h", desc: 'Des missions bien rémunérées, sans intermédiaire. Votre tarif, votre rythme.' },
                { icon: '📍', title: 'Missions près de chez vous', desc: 'Trouvez des jobs dans votre quartier ou campus. Pas de trajet inutile.' },
                { icon: '🗓️', title: 'Horaires flexibles', desc: 'Choisissez les missions qui correspondent à votre emploi du temps étudiant.' },
                { icon: '🛡️', title: 'Profil vérifié = confiance', desc: 'Votre vérification manuelle rassure les clients et vous donne un avantage.' },
              ].map(item => (
                <div key={item.title}
                  className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:border-violet-200
                             hover:bg-violet-50/30 transition-all group">
                  <span className="text-3xl shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-sora font-bold text-slate-900 mb-1 group-hover:text-violet-800">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'client' && (
            <motion.div
              key="client"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {[
                { icon: '✅', title: 'Profils vérifiés manuellement', desc: 'Chaque étudiant est contrôlé par notre équipe. Vous êtes entre de bonnes mains.' },
                { icon: '⚡', title: "Trouvez quelqu'un en 2h", desc: 'Publiez une annonce et recevez des candidatures rapidement, souvent le jour même.' },
                { icon: '💳', title: "Paiement sécurisé", desc: "Le règlement via Stripe n'est libéré qu'une fois la mission validée par vous." },
                { icon: '⭐', title: 'Système de notation', desc: 'Consultez les avis des autres particuliers avant de choisir votre étudiant.' },
              ].map(item => (
                <div key={item.title}
                  className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:border-violet-200
                             hover:bg-violet-50/30 transition-all group">
                  <span className="text-3xl shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-sora font-bold text-slate-900 mb-1 group-hover:text-violet-800">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════ STATS ══════════════════ */}
      <section className="py-16 bg-violet-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { value: '1 200+', label: 'Utilisateurs inscrits' },
              { value: '340+', label: 'Missions publiées' },
              { value: '210+', label: 'Jobs réalisés' },
              { value: '4.8/5', label: 'Note moyenne' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-sora font-extrabold text-4xl md:text-5xl mb-1">{stat.value}</div>
                <div className="text-violet-200 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ COMMENT ÇA MARCHE ══════════════════ */}
      <section id="comment" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <div className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-2">Simple & rapide</div>
            <h2 className="font-sora font-extrabold text-4xl md:text-5xl text-slate-900">Comment ça marche ?</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-slate-100 z-0" />
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px
                            bg-gradient-to-r from-violet-300 to-transparent z-0" />

            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="relative z-10 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-violet-50 border-2 border-violet-100 flex items-center
                                justify-center mx-auto mb-5 group-hover:border-violet-300 transition-colors">
                  <div className="text-violet-600">{s.icon}</div>
                </div>
                <div className="font-sora font-black text-violet-200 text-sm mb-1">{s.step}</div>
                <h3 className="font-sora font-bold text-slate-900 text-base mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[180px] mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ SÉCURITÉ ══════════════════ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12
                          shadow-[0_4px_40px_rgba(0,0,0,0.04)]">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-3">Votre sécurité, notre priorité</div>
                <h2 className="font-sora font-extrabold text-3xl md:text-4xl text-slate-900 mb-4 leading-tight">
                  Une plateforme en qui vous pouvez avoir confiance
                </h2>
                <p className="text-slate-500 leading-relaxed mb-8">
                  Chaque étudiant est vérifié manuellement par notre équipe avant de pouvoir postuler.
                  Les paiements transitent par Stripe, jamais en cash. Votre expérience est protégée de bout en bout.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    "Vérification d'identité manuelle pour chaque étudiant",
                    "Paiement escrow : libéré uniquement après validation",
                    "Système de notation transparent et public",
                    "Support disponible en cas de litige",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle size={17} className="text-violet-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Shield size={24} />, label: 'Vérification manuelle', color: 'violet' },
                  { icon: <CreditCard size={24} />, label: 'Paiement Stripe', color: 'indigo' },
                  { icon: <BadgeCheck size={24} />, label: 'Avis certifiés', color: 'purple' },
                  { icon: <Users size={24} />, label: 'Communauté locale', color: 'violet' },
                ].map(item => (
                  <div key={item.label}
                    className="bg-slate-50 rounded-2xl p-6 flex flex-col gap-3 border border-slate-100
                               hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                      {item.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ AVIS ══════════════════ */}
      <section id="avis" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <div className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-2">Avis vérifiés</div>
            <h2 className="font-sora font-extrabold text-4xl md:text-5xl text-slate-900 mb-3">
              Ils font confiance à Woppy
            </h2>
            <div className="flex items-center justify-center gap-2">
              <StarRating rating={5} />
              <span className="text-sm font-semibold text-slate-600">4.8/5 · Basé sur 200+ avis vérifiés</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 hover:border-violet-200 p-7
                           hover:shadow-[0_8px_40px_rgba(138,107,254,0.1)] transition-all duration-300"
              >
                <StarRating rating={t.rating} />
                <p className="text-slate-600 text-sm leading-relaxed mt-4 mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                  <BadgeCheck size={16} className="text-violet-400 ml-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA FINAL ══════════════════ */}
      <section className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="bg-violet-600 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative z-10">
              <h2 className="font-sora font-extrabold text-4xl md:text-5xl text-white mb-4 leading-tight">
                Prêt à commencer ?
              </h2>
              <p className="text-violet-200 text-lg mb-8 max-w-md mx-auto">
                Rejoignez des centaines d'étudiants et de particuliers à Louvain-la-Neuve. C'est gratuit.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/register?role=student"
                  className="flex items-center justify-center gap-2 bg-white text-violet-700
                             font-sora font-bold text-base px-8 py-4 rounded-2xl hover:bg-violet-50 transition-all">
                  <GraduationCap size={18} /> Je suis étudiant
                </Link>
                <Link href="/auth/register?role=client"
                  className="flex items-center justify-center gap-2 bg-violet-500 text-white
                             font-sora font-bold text-base px-8 py-4 rounded-2xl hover:bg-violet-400
                             border-2 border-violet-400 transition-all">
                  <Building2 size={18} /> Je cherche de l'aide
                </Link>
              </div>
              <p className="text-violet-300 text-xs mt-5">
                ✓ Gratuit · ✓ Vérification manuelle · ✓ Paiements Stripe sécurisés
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}