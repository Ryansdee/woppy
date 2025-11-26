'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  ListChecks,
  Users,
  MessageSquare,
  UserCog,
  ShieldCheck,
  Sparkles,
  Handshake,
  Trophy,
  ArrowRight,
  BarChart3,
  UserCheck,
  Clock,
  TrendingUp,
  Zap,
  Star,
  Gift,
  Bell,
  Settings,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getCountFromServer,
  doc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    users: 0,
    annonces: 0,
    jobs: 0,
  });
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');
  const [hasStudentProfile, setHasStudentProfile] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        window.location.href = '/auth/login';
        return;
      }

      setUser(u);

      try {
        const snap = await getDoc(doc(db, 'users', u.uid));

        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || null);
          setHasStudentProfile(data.hasStudentProfile === true);
        }
      } catch (err) {
        console.error('Erreur récupération rôle/profil étudiant :', err);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) window.location.href = '/auth/login';
      else {
        setUser(u);
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) setRole(snap.data().role || null);
        } catch (err) {
          console.error('Erreur récupération rôle :', err);
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const studentsQuery = query(
          collection(db, "users"),
          where("hasStudentProfile", "==", true)
        );

        const jobsQuery = query(
          collection(db, "annonces"),
          where("statut", "==", "fini")
        );

        const [studentsSnap, usersSnap, annoncesSnap, jobsSnap] =
          await Promise.all([
            getCountFromServer(studentsQuery),
            getCountFromServer(collection(db, "users")),
            getCountFromServer(collection(db, "annonces")),
            getCountFromServer(jobsQuery),
          ]);

        setStats({
          students: studentsSnap.data().count,
          users: usersSnap.data().count,
          annonces: annoncesSnap.data().count,
          jobs: jobsSnap.data().count,
        });
      } catch (err) {
        console.error("Erreur chargement stats :", err);
      }
    }
    fetchStats();
  }, []);

  if (!user) return null;

  const mainActions = [
    {
      href: '/jobs/create',
      icon: <Megaphone className="w-6 h-6" />,
      label: 'Publier',
      description: 'Créer une annonce',
      color: 'from-[#8a6bfe] to-[#6b4fd9]',
      primary: true,
    },
    {
      href: '/jobs',
      icon: <ListChecks className="w-6 h-6" />,
      label: 'Annonces',
      description: 'Parcourir les offres',
      color: 'from-[#6b4fd9] to-[#8a6bfe]',
    },
    {
      href: '/students',
      icon: <Users className="w-6 h-6" />,
      label: 'Étudiants',
      description: 'Trouver des talents',
      color: 'from-[#7b5bef] to-[#9d7fff]',
    },
    {
      href: '/messages',
      icon: <MessageSquare className="w-6 h-6" />,
      label: 'Messages',
      description: 'Conversations',
      color: 'from-[#5b4bc9] to-[#7b5bef]',
    },
  ];

  const secondaryActions = [
    {
      href: '/dashboard/profile',
      icon: <UserCog className="w-5 h-5" />,
      label: 'Mon profil',
    },
    {
      href: '/dashboard/activity',
      icon: <Clock className="w-5 h-5" />,
      label: 'Mon activité',
    },
  ];

  if (role === 'collaborator' || role === 'admin') {
    secondaryActions.push({
      href: '/dashboard/collaborateur',
      icon: <UserCheck className="w-5 h-5" />,
      label: 'Espace collaborateur',
    });
  }

  if (role === 'admin') {
    secondaryActions.push(
      {
        href: '/dashboard/jobs-career',
        icon: <Briefcase className="w-5 h-5" />,
        label: 'Créer des postes',
      },
      {
        href: '/dashboard/applications',
        icon: <ListChecks className="w-5 h-5" />,
        label: 'Candidatures',
      }
    );
  }

  if (hasStudentProfile === true) {
    secondaryActions.push({
      href: '/dashboard/finance',
      icon: <Star className="w-5 h-5" />,
      label: 'Mes finances',
    });
  }

  const statsData = [
    {
      label: 'Étudiants',
      value: stats.students,
      icon: <Users className="w-6 h-6" />,
      color: 'from-[#8a6bfe] to-[#6b4fd9]',
      change: '+12%',
    },
    {
      label: 'Annonces',
      value: stats.annonces,
      icon: <Megaphone className="w-6 h-6" />,
      color: 'from-[#7b5bef] to-[#5b4bc9]',
      change: '+8%',
    },
    {
      label: 'Travaux réalisés',
      value: stats.jobs,
      icon: <Trophy className="w-6 h-6" />,
      color: 'from-[#9d7fff] to-[#8a6bfe]',
      change: '+15%',
    },
    {
      label: 'Utilisateurs',
      value: stats.users,
      icon: <Star className="w-6 h-6" />,
      color: 'from-[#6b4fd9] to-[#7b5bef]',
      change: '+10%',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header avec gradient Woppy */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#6b4fd9] via-[#8a6bfe] to-[#7b5bef] text-white shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-purple-100 text-sm font-medium mb-2">
                  {greeting} 👋
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
                  {user.displayName || user.email.split('@')[0]}
                </h1>
                <p className="text-purple-100 text-base sm:text-lg max-w-2xl">
                  Bienvenue sur ton tableau de bord Woppy
                </p>
              </motion.div>

              {/* Badge rôle */}
              {role && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium"
                >
                  <Zap className="w-4 h-4" />
                  {role === 'admin' ? 'Administrateur' : role === 'collaborator' ? 'Collaborateur' : 'Membre'}
                </motion.div>
              )}
            </div>

            {/* Actions rapides header */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/notifications"
                className="p-3 hover:bg-white/20 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
              </Link>
              <Link
                href="/dashboard/profile"
                className="p-3 hover:bg-white/20 rounded-xl transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
        {/* Actions principales - Cards grandes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8a6bfe]" />
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainActions.map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={action.href}
                  className="group block h-full"
                >
                  <div className={`
                    relative h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300
                    bg-gradient-to-br ${action.color} p-6 border border-white/10
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                    
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        {action.icon}
                      </div>
                      
                      <h3 className="text-white font-bold text-xl mb-1">
                        {action.label}
                      </h3>
                      <p className="text-white/80 text-sm mb-4">
                        {action.description}
                      </p>
                      
                      <div className="flex items-center text-white/90 text-sm font-medium">
                        <span className="group-hover:mr-2 transition-all">Accéder</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Statistiques - Design moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#8a6bfe]" />
              Statistiques Woppy
            </h2>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Données en temps réel
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#8a6bfe]/5 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      {stat.icon}
                    </div>
                    <span className="text-green-600 text-xs font-semibold bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-1 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] bg-clip-text text-transparent">
                    {stat.value.toLocaleString('fr-BE')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions secondaires - Liste compacte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#8a6bfe]" />
            Plus d'options
          </h2>
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 divide-y divide-gray-100">
            {secondaryActions.map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Link
                  href={action.href}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-xl flex items-center justify-center text-white shadow-sm">
                      {action.icon}
                    </div>
                    <span className="font-medium text-gray-900">
                      {action.label}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#8a6bfe] group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer info - Design moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-[#7b5bef] to-[#8a6bfe] rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">
                  Plateforme sécurisée & fiable
                </h3>
                <p className="text-purple-100 text-sm">
                  Paiements protégés, système anti-spam et support 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Anti-spam actif</span>
              </div>
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5" />
                <span>Communauté bienveillante</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tips section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#8a6bfe]/20 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-semibold mb-1">
                  Astuce du jour
                </p>
                <p className="text-gray-600 text-sm">
                  Complète ton profil pour recevoir plus d'opportunités et être mieux visible auprès des recruteurs
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Import manquant pour Briefcase
import { Briefcase } from 'lucide-react';

function hasStudentProfile(user: any) {
  throw new Error('Function not implemented.');
}
