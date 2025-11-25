"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  Star,
  User,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  FileText,
  Zap,
  Loader2,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

/* ---------------------------------------------------------- */
/* ---------------------- PAGE ------------------------------ */
/* ---------------------------------------------------------- */

export default function ActivityPage() {
  const [tab, setTab] = useState<"jobs" | "annonces">("jobs");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🎯 DATA
  const [jobsPostules, setJobsPostules] = useState<any[]>([]);
  const [jobsSelectionnes, setJobsSelectionnes] = useState<any[]>([]);
  const [jobsTermines, setJobsTermines] = useState<any[]>([]);

  const [annoncesPubliees, setAnnoncesPubliees] = useState<any[]>([]);
  const [annoncesEnCours, setAnnoncesEnCours] = useState<any[]>([]);
  const [annoncesTerminees, setAnnoncesTerminees] = useState<any[]>([]);

  /* ------------------- AUTH ------------------- */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) window.location.href = "/auth/login";
      else setUser(u);
    });
    return () => unsubscribe();
  }, []);

  /* ------------------- FIRESTORE FETCH ------------------- */
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setLoading(true);
      const uid = user.uid;

      try {
        /* ---------------------------------------------------- */
        /* 📌 1. Jobs où j'ai postulé                           */
        /* ---------------------------------------------------- */
        const cQ = query(
          collection(db, "candidatures"),
          where("candidatId", "==", uid)
        );
        const cSnap = await getDocs(cQ);

        const postuleIds = cSnap.docs.map((d) => d.data().annonceId);

        const postules: any[] = [];
        for (const id of postuleIds) {
          const snap = await getDoc(doc(db, "annonces", id));
          if (snap.exists()) {
            const ad = snap.data();
            if (!ad.acceptedUserId) postules.push({ id, ...ad });
          }
        }

        setJobsPostules(postules);

        /* ---------------------------------------------------- */
        /* 📌 2. Jobs où je suis sélectionné                   */
        /* ---------------------------------------------------- */
        const selectedQ = query(
          collection(db, "annonces"),
          where("acceptedUserId", "==", uid),
          where("statut", "!=", "fini")
        );
        const selectedSnap = await getDocs(selectedQ);
        setJobsSelectionnes(
          selectedSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );

        /* ---------------------------------------------------- */
        /* 📌 3. Jobs terminés                                 */
        /* ---------------------------------------------------- */
        const finQ = query(
          collection(db, "annonces"),
          where("acceptedUserId", "==", uid),
          where("statut", "==", "fini")
        );
        const finSnap = await getDocs(finQ);
        setJobsTermines(finSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        /* ---------------------------------------------------- */
        /* 📌 4. Annonces publiées                             */
        /* ---------------------------------------------------- */
        const pubQ = query(
          collection(db, "annonces"),
          where("userId", "==", uid),
          where("statut", "==", "ouvert")
        );
        const pubSnap = await getDocs(pubQ);
        setAnnoncesPubliees(
          pubSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );

        /* ---------------------------------------------------- */
        /* 📌 5. Annonces en cours                             */
        /* ---------------------------------------------------- */
        const myAdsQ = query(
          collection(db, "annonces"),
          where("userId", "==", uid)
        );

        const myAdsSnap = await getDocs(myAdsQ);

        const enCours = myAdsSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as any))
          .filter((a) => a.acceptedUserId && a.statut !== "fini");

        setAnnoncesEnCours(enCours);

        /* ---------------------------------------------------- */
        /* 📌 6. Annonces terminées                            */
        /* ---------------------------------------------------- */
        const doneQ = query(
          collection(db, "annonces"),
          where("userId", "==", uid),
          where("statut", "==", "fini")
        );
        const doneSnap = await getDocs(doneQ);
        setAnnoncesTerminees(
          doneSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (!user) return null;

  /* ---------------------------------------------------------- */
  /* ---------------------- STATS ----------------------------- */
  /* ---------------------------------------------------------- */

  const stats = tab === "jobs" 
    ? [
        { label: "Candidatures", value: jobsPostules.length, icon: <ClipboardList className="w-5 h-5" />, color: "from-blue-500 to-cyan-500" },
        { label: "Sélectionné", value: jobsSelectionnes.length, icon: <Zap className="w-5 h-5" />, color: "from-[#8a6bfe] to-[#6b4fd9]" },
        { label: "Terminés", value: jobsTermines.length, icon: <Award className="w-5 h-5" />, color: "from-green-500 to-emerald-500" },
      ]
    : [
        { label: "Publiées", value: annoncesPubliees.length, icon: <Briefcase className="w-5 h-5" />, color: "from-[#8a6bfe] to-[#6b4fd9]" },
        { label: "En cours", value: annoncesEnCours.length, icon: <Users className="w-5 h-5" />, color: "from-blue-500 to-cyan-500" },
        { label: "Terminées", value: annoncesTerminees.length, icon: <Star className="w-5 h-5" />, color: "from-green-500 to-emerald-500" },
      ];

  /* ---------------------------------------------------------- */
  /* ---------------------- RENDER ---------------------------- */
  /* ---------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header avec gradient Woppy */}
      <div className="bg-gradient-to-r from-[#6b4fd9] via-[#8a6bfe] to-[#7b5bef] text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">Mon activité</h1>
            <p className="text-purple-100">
              Suivez vos candidatures et gérez vos annonces
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8 bg-white rounded-2xl p-2 shadow-md border border-gray-100"
        >
          <button
            onClick={() => setTab("jobs")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              tab === "jobs"
                ? "bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Briefcase className="w-5 h-5" />
              Mes jobs
            </div>
          </button>

          <button
            onClick={() => setTab("annonces")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              tab === "annonces"
                ? "bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              Mes annonces
            </div>
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#8a6bfe]/5 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    {stat.icon}
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                
                <p className="text-gray-600 text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#8a6bfe] mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Chargement...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === "jobs" ? (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <JobsView
                  postules={jobsPostules}
                  selectionnes={jobsSelectionnes}
                  termines={jobsTermines}
                  user={user}
                />
              </motion.div>
            ) : (
              <motion.div
                key="annonces"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <AnnoncesView
                  publiees={annoncesPubliees}
                  encours={annoncesEnCours}
                  terminees={annoncesTerminees}
                  user={user}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* ---------------- VIEW : MES JOBS ------------------------- */
/* ---------------------------------------------------------- */

function JobsView({ postules, selectionnes, termines, user }: any) {
  return (
    <div className="space-y-8">
      <Section 
        title="Candidatures en attente" 
        icon={<ClipboardList className="w-6 h-6" />}
        count={postules.length}
      />
      {postules.length === 0 ? (
        <Empty text="Aucune candidature en attente" icon={<ClipboardList />} />
      ) : (
        <div className="grid gap-4">
          {postules.map((a: any, index: number) => (
            <JobCard key={a.id} {...a} type="pending" index={index} />
          ))}
        </div>
      )}

      <Section 
        title="Jobs où je suis sélectionné" 
        icon={<Zap className="w-6 h-6" />}
        count={selectionnes.length}
      />
      {selectionnes.length === 0 ? (
        <Empty text="Aucun job sélectionné" icon={<Clock />} />
      ) : (
        <div className="grid gap-4">
          {selectionnes.map((a: any, index: number) => (
            <JobCard key={a.id} {...a} type="selected" user={user} index={index} />
          ))}
        </div>
      )}

      <Section 
        title="Jobs terminés" 
        icon={<Award className="w-6 h-6" />}
        count={termines.length}
      />
      {termines.length === 0 ? (
        <Empty text="Aucun job terminé" icon={<CheckCircle />} />
      ) : (
        <div className="grid gap-4">
          {termines.map((a: any, index: number) => (
            <JobCard key={a.id} {...a} type="done" user={user} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* ---------------- VIEW : MES ANNONCES --------------------- */
/* ---------------------------------------------------------- */

function AnnoncesView({ publiees, encours, terminees, user }: any) {
  return (
    <div className="space-y-8">
      <Section 
        title="Annonces publiées" 
        icon={<Briefcase className="w-6 h-6" />}
        count={publiees.length}
      />
      {publiees.length === 0 ? (
        <Empty text="Aucune annonce publiée" icon={<Briefcase />} />
      ) : (
        <div className="grid gap-4">
          {publiees.map((a: any, index: number) => (
            <AnnonceCard key={a.id} {...a} type="open" user={user} index={index} />
          ))}
        </div>
      )}

      <Section 
        title="Annonces en cours" 
        icon={<Users className="w-6 h-6" />}
        count={encours.length}
      />
      {encours.length === 0 ? (
        <Empty text="Aucune annonce en cours" icon={<Users />} />
      ) : (
        <div className="grid gap-4">
          {encours.map((a: any, index: number) => (
            <AnnonceCard key={a.id} {...a} type="progress" user={user} index={index} />
          ))}
        </div>
      )}

      <Section 
        title="Annonces terminées" 
        icon={<Star className="w-6 h-6" />}
        count={terminees.length}
      />
      {terminees.length === 0 ? (
        <Empty text="Aucune annonce terminée" icon={<Star />} />
      ) : (
        <div className="grid gap-4">
          {terminees.map((a: any, index: number) => (
            <AnnonceCard key={a.id} {...a} type="done" user={user} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* ---------------- COMPONENTS ------------------------------ */
/* ---------------------------------------------------------- */

function Empty({ text, icon }: any) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
        {icon}
      </div>
      <p className="text-gray-500 font-medium">{text}</p>
    </div>
  );
}

function Section({ title, icon, count }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-xl flex items-center justify-center text-white">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        {count}
      </span>
    </div>
  );
}

/* ------------------------ JOB CARD ------------------------ */

async function markJobAsDone(id: string) {
  await updateDoc(doc(db, "annonces", id), {
    taskCompletion: true,
    statut: "fini",
  });
}

function JobCard({ id, title, date, location, type, user, index }: {
  id: string;
  title: string;
  date?: string;
  location?: string;
  type: 'pending' | 'selected' | 'done';
  user?: any;
  index: number;
}) {
  const [loading, setLoading] = useState(false);

  const config: Record<'pending' | 'selected' | 'done', { badge: string; label: string; gradient: string }> = {
    pending: {
      badge: "bg-blue-100 text-blue-700 border border-blue-200",
      label: "En attente",
      gradient: "from-blue-500 to-cyan-500",
    },
    selected: {
      badge: "bg-purple-100 text-purple-700 border border-purple-200",
      label: "Sélectionné",
      gradient: "from-[#8a6bfe] to-[#6b4fd9]",
    },
    done: {
      badge: "bg-green-100 text-green-700 border border-green-200",
      label: "Terminé",
      gradient: "from-green-500 to-emerald-500",
    },
  };

  const currentConfig = config[type];

  const handleMarkAsDone = async () => {
    setLoading(true);
    try {
      await markJobAsDone(id);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${currentConfig.gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#8a6bfe] transition-colors">
              {title}
            </h3>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location}
                </span>
              )}
              {date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {date}
                </span>
              )}
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${currentConfig.badge}`}>
            {currentConfig.label}
          </span>
        </div>

        {type === "selected" && (
          <button
            onClick={handleMarkAsDone}
            disabled={loading}
            className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Marquer comme terminé
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* --------------------- ANNONCE CARD ----------------------- */

async function markAnnonceAsDone(id: string) {
  await updateDoc(doc(db, "annonces", id), {
    statut: "fini",
  });
}

function AnnonceCard({
  id,
  title,
  date,
  location,
  type,
  acceptedUserId,
  index,
}: {
  id: string;
  title: string;
  date?: string;
  location?: string;
  type: 'open' | 'progress' | 'done';
  acceptedUserId?: string;
  index: number;
}) {
  const [loading, setLoading] = useState(false);

  const config: Record<'open' | 'progress' | 'done', { badge: string; label: string; gradient: string }> = {
    open: {
      badge: "bg-purple-100 text-purple-700 border border-purple-200",
      label: "Ouverte",
      gradient: "from-[#8a6bfe] to-[#6b4fd9]",
    },
    progress: {
      badge: "bg-blue-100 text-blue-700 border border-blue-200",
      label: "En cours",
      gradient: "from-blue-500 to-cyan-500",
    },
    done: {
      badge: "bg-green-100 text-green-700 border border-green-200",
      label: "Terminée",
      gradient: "from-green-500 to-emerald-500",
    },
  };

  const currentConfig = config[type];

  const handleMarkAsDone = async () => {
    setLoading(true);
    try {
      await markAnnonceAsDone(id);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${currentConfig.gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#8a6bfe] transition-colors">
              {title}
            </h3>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location}
                </span>
              )}
              {date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {date}
                </span>
              )}
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${currentConfig.badge}`}>
            {currentConfig.label}
          </span>
        </div>

        {acceptedUserId && (
          <div className="flex items-center gap-2 mb-3 p-3 bg-purple-50 border border-purple-100 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-lg flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Étudiant sélectionné</p>
              <p className="text-sm text-gray-900 font-semibold">{acceptedUserId}</p>
            </div>
          </div>
        )}

        {type === "progress" && (
          <button
            onClick={handleMarkAsDone}
            disabled={loading}
            className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Marquer comme terminée
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}