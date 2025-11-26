"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  DocumentData,
} from "firebase/firestore";
import {
  Wallet,
  TrendingUp,
  Clock,
  Euro,
  Calendar,
  MapPin,
  Briefcase,
  PieChart,
  ArrowUpRight,
  ArrowLeft,
  Loader2,
  Star,
  Award,
  Target,
  DollarSign,
  Download,
} from "lucide-react";
import Link from "next/link";

interface Mission {
  id: string;
  annonceId: string;
  annonce: DocumentData | null;
}

export default function FinanceDashboard() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const fetchMissions = async () => {
      try {
        const candidaturesRef = collection(db, "candidatures");
        const q = query(
          candidaturesRef,
          where("userId", "==", user.uid),
          where("statut", "==", "acceptée")
        );

        const querySnap = await getDocs(q);

        const results: Mission[] = await Promise.all(
          querySnap.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const annonceRef = doc(db, "annonces", data.annonceId);
            const annonceSnap = await getDoc(annonceRef);
            return {
              id: docSnap.id,
              annonceId: data.annonceId,
              annonce: annonceSnap.exists() ? annonceSnap.data() : null,
            };
          })
        );

        setMissions(results);
      } catch (err) {
        console.error("Erreur lors du chargement des missions :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  // 🔢 Données agrégées
  const summary = useMemo(() => {
    // Total brut = rémunération * durée
    const totalBrut = missions.reduce((acc, m) => {
      const pay = Number(m.annonce?.remuneration) || 0;
      const hours = Number(m.annonce?.duree) || 0;
      return acc + pay * hours;
    }, 0);

    const totalNet = totalBrut * 0.85;
    
    const monthData = missions.map((m) => ({
      name: m.annonce?.date || "N/A",
      brut:
        (Number(m.annonce?.remuneration) || 0) *
        (Number(m.annonce?.duree) || 0),
      net:
        (Number(m.annonce?.remuneration) || 0) *
        (Number(m.annonce?.duree) || 0) *
        0.85,
    }));

    const totalHours = missions.reduce(
      (acc, m) => acc + (Number(m.annonce?.duree) || 0),
      0
    );

    const avgPerHour = totalHours > 0 ? totalBrut / totalHours : 0;

    return { totalBrut, totalNet, monthData, totalHours, avgPerHour };
  }, [missions]);

  // Grouper les missions par mois
  const missionsByMonth = useMemo(() => {
    const grouped: { [key: string]: Mission[] } = {};
    
    missions.forEach(m => {
      if (!m.annonce?.date) return;
      
      // Extraire le mois (format DD/MM/YYYY ou similaire)
      const dateParts = m.annonce.date.split('/');
      if (dateParts.length >= 2) {
        const monthYear = `${dateParts[1]}/${dateParts[2] || new Date().getFullYear()}`;
        if (!grouped[monthYear]) {
          grouped[monthYear] = [];
        }
        grouped[monthYear].push(m);
      }
    });
    
    return grouped;
  }, [missions]);

  // Calculer les stats par mois
  const monthlyStats = useMemo(() => {
    return Object.entries(missionsByMonth).map(([month, missions]) => {
      const brut = missions.reduce((acc, m) => {
        const pay = Number(m.annonce?.remuneration) || 0;
        const hours = Number(m.annonce?.duree) || 0;
        return acc + (pay * hours);
      }, 0);
      
      const hours = missions.reduce((acc, m) => {
        return acc + (Number(m.annonce?.duree) || 0);
      }, 0);
      
      return {
        month,
        brut,
        net: brut * 0.85,
        hours,
        count: missions.length
      };
    }).sort((a, b) => {
      // Trier par date (plus récent en premier)
      const [monthA, yearA] = a.month.split('/');
      const [monthB, yearB] = b.month.split('/');
      return (parseInt(yearB) * 12 + parseInt(monthB)) - (parseInt(yearA) * 12 + parseInt(monthA));
    });
  }, [missionsByMonth]);

  // Export des données en CSV (Excel-ready)
  const exportToCSV = () => {
    if (missions.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    // Fonction pour échapper les champs CSV
    const escapeCSV = (value: string | number): string => {
      const strValue = String(value);
      if (strValue.includes(';') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    };

    // Headers
    const headers = ["Date", "Titre", "Lieu", "Durée (h)", "Rémunération/h (€)", "Total Brut (€)", "Total Net (€)", "Taux Net"];
    
    // Rows avec les données de chaque mission
    const rows = missions.map(m => {
      const a = m.annonce;
      const pay = Number(a?.remuneration) || 0;
      const hours = Number(a?.duree) || 0;
      const brut = pay * hours;
      const net = brut * 0.85;
      
      return [
        escapeCSV(a?.date || "N/A"),
        escapeCSV(a?.titre || "N/A"),
        escapeCSV(a?.lieu || "N/A"),
        hours.toString().replace('.', ','), // Format européen
        pay.toFixed(2).replace('.', ','),
        brut.toFixed(2).replace('.', ','),
        net.toFixed(2).replace('.', ','),
        "85%"
      ];
    });

    // Ligne vide pour la séparation
    rows.push(["", "", "", "", "", "", "", ""]);

    // Ligne de total
    rows.push([
      "TOTAL",
      "",
      "",
      summary.totalHours.toString().replace('.', ','),
      summary.avgPerHour.toFixed(2).replace('.', ','),
      summary.totalBrut.toFixed(2).replace('.', ','),
      summary.totalNet.toFixed(2).replace('.', ','),
      ""
    ]);

    // Lignes vides
    rows.push(["", "", "", "", "", "", "", ""]);
    rows.push(["", "", "", "", "", "", "", ""]);

    // Statistiques mensuelles
    if (monthlyStats.length > 0) {
      rows.push(["STATISTIQUES MENSUELLES", "", "", "", "", "", "", ""]);
      rows.push(["Mois", "Nombre de missions", "Heures totales", "Brut (€)", "Net (€)", "", "", ""]);
      
      monthlyStats.forEach(stat => {
        rows.push([
          stat.month,
          stat.count.toString(),
          stat.hours.toString().replace('.', ','),
          stat.brut.toFixed(2).replace('.', ','),
          stat.net.toFixed(2).replace('.', ','),
          "",
          "",
          ""
        ]);
      });
    }

    // Construire le contenu CSV avec point-virgule (format Excel européen)
    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.join(";"))
    ].join("\n");

    // Ajouter BOM UTF-8 pour Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `woppy-finances-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // État pour les graphiques
  const [showGraphs, setShowGraphs] = useState(false);

  // État pour les objectifs
  const [showObjectives, setShowObjectives] = useState(false);
  const [objectives, setObjectives] = useState({
    monthlyTarget: 400,
    hoursTarget: 30,
  });

  // Calculer la progression des objectifs
  const objectivesProgress = useMemo(() => {
    const currentMonth = new Date().toLocaleString('fr-FR', { month: '2-digit', year: 'numeric' });
    const currentMonthData = monthlyStats.find(m => m.month === currentMonth);
    
    return {
      earningsProgress: currentMonthData ? (currentMonthData.net / objectives.monthlyTarget) * 100 : 0,
      hoursProgress: currentMonthData ? (currentMonthData.hours / objectives.hoursTarget) * 100 : 0,
      currentEarnings: currentMonthData?.net || 0,
      currentHours: currentMonthData?.hours || 0,
    };
  }, [monthlyStats, objectives]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <Loader2 className="w-12 h-12 animate-spin text-[#8a6bfe] mb-4" />
        <p className="text-gray-600 font-medium">Chargement de tes finances...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header avec gradient Woppy */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#6b4fd9] via-[#8a6bfe] to-[#7b5bef] text-white shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 sm:mb-6 transition-colors group text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-x-1 transition-transform" />
            Retour au tableau de bord
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
                  Mes finances
                </h1>
                <p className="text-purple-100 text-sm sm:text-base">
                  Analyse de tes revenus sur Woppy
                </p>
              </div>
            </div>

            {/* Badge missions */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
              <p className="text-2xl sm:text-3xl font-bold">{missions.length}</p>
              <p className="text-xs text-purple-100">Mission{missions.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {missions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center border border-gray-100"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
              <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Aucune donnée financière
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              Tu n'as pas encore de missions acceptées. Commence à postuler pour voir tes finances ici !
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
            >
              Voir les annonces
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Statistiques principales - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
            >
              {/* Total brut */}
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-blue-600 text-xs font-semibold bg-blue-50 px-2 py-1 rounded-full">
                      Brut
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">
                    Total brut
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {summary.totalBrut.toFixed(2)} €
                  </p>
                </div>
              </motion.div>

              {/* Total net */}
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#8a6bfe]/10 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Euro className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[#8a6bfe] text-xs font-semibold bg-purple-50 px-2 py-1 rounded-full">
                      Net
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">
                    Total net estimé
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] bg-clip-text text-transparent">
                    {summary.totalNet.toFixed(2)} €
                  </p>
                </div>
              </motion.div>

              {/* Heures totales */}
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">
                      Heures
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">
                    Heures totales
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {summary.totalHours} h
                  </p>
                </div>
              </motion.div>

              {/* Moyenne par heure */}
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-orange-600 text-xs font-semibold bg-orange-50 px-2 py-1 rounded-full">
                      Moy.
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">
                    Moyenne/heure
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {summary.avgPerHour.toFixed(2)} €
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
            >
              <button 
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#8a6bfe] transition-all text-sm sm:text-base font-medium text-gray-700 hover:text-[#8a6bfe]"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Exporter Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>
              <button 
                onClick={() => setShowGraphs(!showGraphs)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#8a6bfe] transition-all text-sm sm:text-base font-medium text-gray-700 hover:text-[#8a6bfe]"
              >
                <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Graphiques</span>
                <span className="sm:hidden">Stats</span>
              </button>
              <button 
                onClick={() => setShowObjectives(!showObjectives)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#8a6bfe] transition-all text-sm sm:text-base font-medium text-gray-700 hover:text-[#8a6bfe] col-span-2 lg:col-span-1"
              >
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                Objectifs
              </button>
            </motion.div>

            {/* Section Graphiques par mois */}
            <AnimatePresence>
              {showGraphs && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 sm:mb-8 overflow-hidden"
                >
                  <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                      <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-[#8a6bfe]" />
                      Statistiques mensuelles
                    </h3>
                    
                    {monthlyStats.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Aucune donnée mensuelle disponible</p>
                    ) : (
                      <div className="space-y-4">
                        {monthlyStats.map((stat, index) => (
                          <motion.div
                            key={stat.month}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900">{stat.month}</h4>
                                <p className="text-sm text-gray-600">{stat.count} mission{stat.count > 1 ? 's' : ''}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{stat.net.toFixed(2)} €</p>
                                <p className="text-xs text-gray-600">{stat.hours}h travaillées</p>
                              </div>
                            </div>
                            
                            {/* Barre de progression visuelle */}
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((stat.net / Math.max(...monthlyStats.map(s => s.net))) * 100, 100)}%` }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Section Objectifs */}
            <AnimatePresence>
              {showObjectives && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 sm:mb-8 overflow-hidden"
                >
                  <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#8a6bfe]" />
                      Mes objectifs du mois
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Objectif revenus */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Objectif revenus</span>
                          <span className="text-sm font-bold text-[#8a6bfe]">
                            {objectivesProgress.currentEarnings.toFixed(2)} € / {objectives.monthlyTarget} €
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${Math.min(objectivesProgress.earningsProgress, 100)}%` }}
                          >
                            {objectivesProgress.earningsProgress >= 10 && (
                              <span className="text-xs font-bold text-white">
                                {objectivesProgress.earningsProgress.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Objectif heures */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Objectif heures</span>
                          <span className="text-sm font-bold text-green-600">
                            {objectivesProgress.currentHours}h / {objectives.hoursTarget}h
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${Math.min(objectivesProgress.hoursProgress, 100)}%` }}
                          >
                            {objectivesProgress.hoursProgress >= 10 && (
                              <span className="text-xs font-bold text-white">
                                {objectivesProgress.hoursProgress.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Modifier objectifs */}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-3">Modifier mes objectifs</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Revenus mensuels (€)</label>
                            <input
                              type="number"
                              value={objectives.monthlyTarget}
                              onChange={(e) => setObjectives(prev => ({ ...prev, monthlyTarget: Number(e.target.value) }))}
                              className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8a6bfe]"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Heures mensuelles</label>
                            <input
                              type="number"
                              value={objectives.hoursTarget}
                              onChange={(e) => setObjectives(prev => ({ ...prev, hoursTarget: Number(e.target.value) }))}
                              className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8a6bfe]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Liste des missions - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#8a6bfe]" />
                  Historique
                </h3>
                <span className="text-xs sm:text-sm text-gray-500">
                  {missions.length} mission{missions.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {missions.map((m, index) => {
                  const a = m.annonce;
                  if (!a) return null;
                  const brut =
                    (Number(a.remuneration) || 0) * (Number(a.duree) || 0);
                  const net = brut * 0.85;

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      onClick={() => setSelectedMission(m)}
                      className="p-4 sm:p-5 bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-xl border border-purple-100 hover:border-[#8a6bfe] transition-all cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base truncate">
                            {a.titre}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#8a6bfe]" />
                              <span>{a.date}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#8a6bfe]" />
                              <span>{a.duree}h</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-[#8a6bfe]" />
                              <span className="truncate">{a.lieu}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-1 sm:justify-end">
                            <Euro className="w-4 h-4 text-gray-600" />
                            {brut.toFixed(2)} €
                          </p>
                          <p className="text-xs sm:text-sm text-[#8a6bfe] font-semibold">
                            Net: {net.toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Info fiscale */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 sm:mt-8"
            >
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                      Information importante
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      Les montants nets sont estimés à 85% du brut. Les charges réelles peuvent varier selon ton statut. 
                      Consulte un comptable pour plus de précision.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </main>

      {/* Modal détails mission - Responsive */}
      <AnimatePresence>
        {selectedMission && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMission(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
                <Euro className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">
                Détail des gains
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 text-center">
                {selectedMission.annonce?.titre}
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Total brut</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {(
                      Number(selectedMission.annonce?.remuneration) *
                      Number(selectedMission.annonce?.duree || 1)
                    ).toFixed(2)}{" "}
                    €
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Euro className="w-5 h-5 text-[#8a6bfe]" />
                    <span className="font-semibold text-gray-900">Total net</span>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] bg-clip-text text-transparent">
                    {(
                      Number(selectedMission.annonce?.remuneration) *
                      Number(selectedMission.annonce?.duree || 1) *
                      0.85
                    ).toFixed(2)}{" "}
                    €
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMission(null)}
                className="w-full bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white px-6 py-3 sm:py-4 rounded-xl font-bold hover:shadow-xl transition-all text-sm sm:text-base"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}