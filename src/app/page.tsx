'use client';

import useAuthPersistence from '@/lib/useAuthPersistence';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Check, Star, MessageSquare, MapPin, Clock,
  Users, Briefcase, ShieldCheck, CreditCard, Sparkles,
  Shield, Lock, Zap,
  CheckCircle,
  Quote,
  TrendingUp,
  BarChart3,
  Trophy
} from 'lucide-react';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, doc, getDoc, getCountFromServer, where } from 'firebase/firestore';

import './globals.css';
import { motion } from 'framer-motion';
// Define features array for the features section
const features = [
  {
    title: "Vérification manuelle",
    desc: "Chaque étudiant est vérifié manuellement pour garantir la sécurité.",
    icon: <ShieldCheck className="w-8 h-8" />,
    color: "from-purple-500 to-indigo-500",
    iconBg: "bg-purple-100",
  },
  {
    title: "Paiement sécurisé",
    desc: "Les paiements sont gérés via Stripe pour une sécurité maximale.",
    icon: <CreditCard className="w-8 h-8" />,
    color: "from-indigo-500 to-purple-500",
    iconBg: "bg-indigo-100",
  },
  {
    title: "Jobs variés",
    desc: "Trouvez ou proposez des missions adaptées à vos besoins.",
    icon: <Briefcase className="w-8 h-8" />,
    color: "from-pink-500 to-purple-500",
    iconBg: "bg-pink-100",
  },
  {
    title: "Communauté locale",
    desc: "Rejoignez une communauté active à Louvain-la-Neuve.",
    icon: <Users className="w-8 h-8" />,
    color: "from-green-500 to-blue-500",
    iconBg: "bg-green-100",
  },
  {
    title: "Support rapide",
    desc: "Notre équipe est disponible pour vous aider rapidement.",
    icon: <MessageSquare className="w-8 h-8" />,
    color: "from-yellow-500 to-orange-500",
    iconBg: "bg-yellow-100",
  },
  {
    title: "Simplicité d’utilisation",
    desc: "Une interface intuitive pour tous les utilisateurs.",
    icon: <Sparkles className="w-8 h-8" />,
    color: "from-blue-500 to-purple-500",
    iconBg: "bg-blue-100",
  },
];

/* ================================
      INTERFACE REVIEW
================================ */
interface Review {
  missionType: any;
  id: string;
  rating: number;
  comment: string;
  createdAt?: any;
  reviewerId: string;
  reviewerName?: string;
}

/* ================================
          PAGE ACCUEIL
================================ */
export default function HomePage() {

  // 🔐 Sync cookies <-> Firebase
  useAuthPersistence();
  const [stats, setStats] = useState({
    students: 0,
    users: 0,
    annonces: 0,
    jobs: 0,
  });
  // Auth cookie
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const cookie = Cookies.get('woppy_user');
    if (cookie) setIsLoggedIn(true);
  }, []);

      useEffect(() => {
        async function fetchStats() {
          try {
            const studentsQuery = query(
              collection(db, "users"),
              where("hasStudentProfile", "==", true)
            );
  
            // 🔥 annonces terminées
            const jobsQuery = query(
              collection(db, "annonces"),
              where("statut", "==", "fini")
            );
  
            const [studentsSnap, usersSnap, annoncesSnap, jobsSnap] =
              await Promise.all([
                getCountFromServer(studentsQuery),
                getCountFromServer(collection(db, "users")),
                getCountFromServer(collection(db, "annonces")),
                getCountFromServer(jobsQuery), // ✔️ annonce terminée = travail réalisé
              ]);
  
            setStats({
              students: studentsSnap.data().count,
              users: usersSnap.data().count,
              annonces: annoncesSnap.data().count,
              jobs: jobsSnap.data().count,  // ✔️ devient nombre de jobs finis
            });
          } catch (err) {
            console.error("Erreur chargement stats :", err);
          }
        }
        fetchStats();
      }, []);

  /* ================================
        🔥 CHARGER LES REVIEWS
  ================================= */
  useEffect(() => {
    async function loadReviews() {
      try {
        const qRev = query(
          collection(db, 'reviews'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );

        const snap = await getDocs(qRev);

        const list: Review[] = [];

        for (const d of snap.docs) {
          const data = d.data() as Review;

          // Récupérer prénom + nom du reviewer
          let reviewerName = 'Utilisateur';
          if (data.reviewerId) {
            const userRef = doc(db, 'users', data.reviewerId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const u = userSnap.data() as any;
              reviewerName = u.firstName + ' ' + u.lastName;
            }
          }

          list.push({
            ...data,
            id: d.id,
            reviewerName
          });
        }

        setReviews(list);
      } catch (err) {
        console.error('Erreur reviews:', err);
      }
    }

    loadReviews();
  }, []);

  function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center bg-[#f8f5ff] border border-[#e5d9ff] rounded-2xl p-8 sm:p-10 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
      <div className="text-gray-600 text-base sm:text-lg mb-2">{label}</div>
      <div className="text-4xl sm:text-5xl font-extrabold text-[#7b5bff]">
        {value.toLocaleString('fr-BE')}
      </div>
    </div>
  );
}

  return (
    <main className="min-h-screen w-full bg-white text-gray-900">

      {/* ========================
            NAVBAR
      ======================== */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-[#e3d4ff] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo Woppy" width={36} height={36} className="rounded-md" />
            <span className="text-2xl font-bold text-[#8a6bfe]">Woppy</span>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="hover:text-[#8a6bfe] transition">Fonctionnalités</Link>
            <Link href="#etudiants" className="hover:text-[#8a6bfe] transition">Étudiants</Link>
            <Link href="#pricing" className="hover:text-[#8a6bfe] transition">Paiement sécurisé</Link>
          </div>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Accéder à mon espace
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-[#8a6bfe] font-medium">
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Commencer
                </Link>
              </>
            )}
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

        {/* MENU MOBILE */}
        <div id="mobile-menu" className="hidden md:hidden flex flex-col gap-3 bg-white border-t border-[#e3d4ff] px-6 py-4">
          <Link href="#features" className="hover:text-[#8a6bfe]">Fonctionnalités</Link>
          <Link href="#etudiants" className="hover:text-[#8a6bfe]">Étudiants</Link>
          <Link href="#paiement" className="hover:text-[#8a6bfe]">Paiement sécurisé</Link>
          <hr />
          {isLoggedIn ? (
            <Link href="/dashboard" className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white text-center px-4 py-2.5 rounded-lg font-semibold mt-2">
              Mon espace
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600">Connexion</Link>
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white text-center px-4 py-2.5 rounded-lg font-semibold mt-2"
              >
                Commencer
              </Link>
            </>
          )}
        </div>
      </nav>
      {/* ========================
            HERO
      ======================== */}
<section className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-purple-50 via-white to-indigo-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-200/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8 hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
              Plateforme #1 pour étudiants à LLN
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-gray-900 mb-6">
              Trouvez de l'aide,
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  ou aidez près de chez vous
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 5 100 3 150 5C200 7 250 9 298 6" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8a6bfe" />
                      <stop offset="100%" stopColor="#b89fff" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
              Woppy connecte les <strong className="text-purple-700">étudiants vérifiés</strong> et les particuliers pour des petits jobs rapides, rémunérés et sécurisés à Louvain-la-Neuve et alentours.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {isLoggedIn ? (
                <a
                  href="/dashboard"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600
                             text-white px-8 py-5 rounded-2xl font-bold text-lg
                             hover:shadow-2xl hover:scale-105 transition-all duration-300
                             flex items-center justify-center gap-2 group"
                >
                  Accéder à mon espace
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" size={22} />
                </a>
              ) : (
                <>
                  <a
                    href="/auth/register"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600
                               text-white px-8 py-5 rounded-2xl font-bold text-lg
                               hover:shadow-2xl hover:scale-105 transition-all duration-300
                               flex items-center justify-center gap-2 group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative">Rejoindre gratuitement</span>
                    <ArrowRight className="relative group-hover:translate-x-2 transition-transform" size={22} />
                  </a>

                  <a
                    href="/auth/login"
                    className="border-2 border-gray-300 text-gray-700
                               px-8 py-5 rounded-2xl font-bold text-lg
                               hover:border-purple-500 hover:text-purple-700 hover:bg-purple-50
                               transition-all duration-300"
                  >
                    J'ai déjà un compte
                  </a>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="text-green-600" size={18} />
                </div>
                <span className="font-medium text-gray-700">Sans CV</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Check className="text-blue-600" size={18} />
                </div>
                <span className="font-medium text-gray-700">Vérification manuelle</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Check className="text-purple-600" size={18} />
                </div>
                <span className="font-medium text-gray-700">Paiement sécurisé</span>
              </div>
            </div>
          </div>

          {/* Right Mockup */}
          <div className="relative lg:pl-8">
            {/* Main card */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 transform hover:scale-105 transition-all duration-500 hover:shadow-purple-200/50">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Mission disponible</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-2xl mb-2">
                    Aide pour déménagement
                  </h3>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-sm px-4 py-2 rounded-xl font-bold shadow-lg whitespace-nowrap">
                  16€/h
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 mb-6 bg-gray-50 px-4 py-3 rounded-xl">
                <MapPin size={18} className="text-purple-500" />
                <span className="font-medium">Louvain-la-Neuve</span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-700 mb-1">
                    <Clock size={16} />
                    <span className="text-xs font-semibold uppercase">Durée</span>
                  </div>
                  <p className="text-gray-900 font-bold text-lg">5 heures</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-indigo-700 mb-1">
                    <Clock size={16} />
                    <span className="text-xs font-semibold uppercase">Horaire</span>
                  </div>
                  <p className="text-gray-900 font-bold text-lg">11h-16h</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">Client 5/5 (12 avis)</span>
              </div>

              {/* CTA Button */}
              <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600
                                text-white py-4 rounded-2xl font-bold text-lg
                                hover:shadow-2xl hover:scale-105 transition-all duration-300
                                flex items-center justify-center gap-2 group relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">Postuler maintenant</span>
                <TrendingUp className="relative group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              {/* Decorative corner */}
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full opacity-20 blur-2xl" />
            </div>

            {/* Floating badge */}
            <div className="absolute -top-6 -left-6 bg-gradient-to-br from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold">Populaire</span>
              </div>
            </div>

            {/* Large blur effect */}
            <div className="absolute -top-12 -right-12 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-indigo-400/30 blur-3xl rounded-full -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
          </div>
        </div>
      </div>
    </section>

      {/* ========================
          FEATURES
      ======================== */}
 <section id="features" className="py-24 px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Pourquoi nous choisir
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#4C3E87] leading-tight">
            Pourquoi choisir <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Woppy</span> ?
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Un environnement sûr, humain et rapide pour chaque mission entre particuliers et étudiants.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className="relative mb-6">
                <div className={`inline-flex p-4 rounded-2xl ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`text-transparent bg-clip-text bg-gradient-to-br ${feature.color}`}>
                    {feature.icon}
                  </div>
                </div>
                
                {/* Decorative dot */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>

              {/* Content */}
              <h3 className="font-bold text-xl mb-3 text-[#4C3E87] group-hover:text-purple-700 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-4">
                {feature.desc}
              </p>

              {/* Corner decoration */}
              <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${feature.color} opacity-0 group-hover:opacity-10 rounded-tl-full transition-opacity duration-300`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col md:flex-row items-center gap-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-8">
            <div className="flex-1 text-left">
              <h3 className="text-2xl font-bold text-[#4C3E87] mb-2">
                Prêt à rejoindre Woppy ?
              </h3>
              <p className="text-gray-600">
                Inscription gratuite en 2 minutes. Aucune carte bancaire requise.
              </p>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap">
              Commencer maintenant
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white/80 backdrop-blur-lg border border-[#d8c8ff] rounded-3xl p-8 sm:p-12 shadow-xl max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#7b5bff] mb-10 flex items-center justify-center gap-3">
          <Trophy className="w-7 h-7 text-[#7b5bff]" /> Woppy c'est : 
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Stat label="Étudiants inscrits" value={stats.students} />
          <Stat label="Annonces publiées" value={stats.annonces} />
          <Stat label="Travaux réalisés" value={stats.jobs} />
          <Stat label="Utilisateurs totaux" value={stats.users} />
        </div>
        <div className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#7b5bff]" />
          Données synchronisées avec Firestore
        </div>
      </motion.div>

      {/* ===============================
            ⭐ AVIS RÉELS FIRESTORE
      =============================== */}
      {reviews.length > 0 && (
        <section className="py-24 px-6 bg-gradient-to-br from-purple-50 via-white to-indigo-50 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4" />
                Avis vérifiés
              </div>
              
              <h2 className="text-5xl font-bold text-[#4C3E87] mb-6 leading-tight">
                Ils ont utilisé <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Woppy</span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Avis vérifiés provenant de vraies missions entre particuliers et étudiants.
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4C3E87] mb-1">4.8/5</div>
                  <div className="text-sm text-gray-600">Note moyenne</div>
                </div>
                <div className="w-px bg-gray-300" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4C3E87] mb-1">{reviews.length}+</div>
                  <div className="text-sm text-gray-600">Avis vérifiés</div>
                </div>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((r, index) => (
                <div
                  key={r.id}
                  className="group relative bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-purple-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Quote icon decoration */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Quote className="w-6 h-6 text-white" />
                  </div>

                  {/* Mission type badge */}
                  {r.missionType && (
                    <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
                      {r.missionType}
                    </div>
                  )}

                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={20}
                        className={
                          n <= r.rating
                            ? "text-yellow-500 fill-yellow-500 drop-shadow"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-gray-700">
                      {r.rating}.0
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 leading-relaxed mb-6 text-base italic">
                    "{r.comment}"
                  </p>

                  {/* Reviewer info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      {/* Avatar placeholder */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold text-sm">
                        {(r.reviewerName?.charAt(0) ?? 'U')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {r.reviewerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Client vérifié
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-gray-500">
                      {r.createdAt?.seconds
                        ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("fr-BE", {
                            month: 'short',
                            year: 'numeric'
                          })
                        : "Récent"}
                    </p>
                  </div>

                  {/* Verified badge */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <p className="text-gray-600 mb-6">
                Rejoignez des centaines d'utilisateurs satisfaits
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================
          PAIEMENT STRIPE



      {/* ===============================
                CTA FINAL
      =============================== */}
      <section className="py-24 px-6 bg-gradient-to-r from-[#8a6bfe] via-[#9b7bff] to-[#b89fff] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.svg')] bg-cover bg-center" />

        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl font-bold mb-6">Prêt à rejoindre Woppy ?</h2>

          <p className="text-lg opacity-90 mb-8">
            Rejoignez des centaines d’étudiants vérifiés et de particuliers à Louvain-la-Neuve.
            Sécurité, rapidité et liberté en un clic.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-white text-[#8a6bfe] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-lg flex items-center justify-center gap-2"
              >
                Aller à mon espace <ArrowRight size={20} />
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>

          <p className="mt-6 text-sm opacity-80">
            ✓ Gratuit • ✓ Étudiants vérifiés manuellement • ✓ Paiements Stripe sécurisés
          </p>
        </div>
      </section>
    </main>
  );
}
