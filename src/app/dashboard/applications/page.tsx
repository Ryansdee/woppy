"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  User,
  Mail,
  Briefcase,
  ArrowRight,
  Inbox,
  TrendingUp,
  CheckCircle,
  Clock,
  Loader2,
  X,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Application {
  id: string;
  applicantId: string;
  fullName: string;
  email: string;
  message: string;
  careerId: string;
  cvUrl?: string;
  status?: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

export default function ApplicationsDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "seen">("all");

  useEffect(() => {
    const q = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setApplications(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Application, "id">),
        }))
      );
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "new" && (!app.status || app.status !== "seen")) ||
      (filterStatus === "seen" && app.status === "seen");

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    new: applications.filter(app => !app.status || app.status !== "seen").length,
    seen: applications.filter(app => app.status === "seen").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <Loader2 className="w-12 h-12 animate-spin text-[#8a6bfe] mb-4" />
        <p className="text-gray-600 font-medium">Chargement des candidatures...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header avec gradient Woppy */}
      <div className="bg-gradient-to-r from-[#6b4fd9] via-[#8a6bfe] to-[#7b5bef] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Candidatures</h1>
                <p className="text-purple-100">
                  Gérez toutes les candidatures reçues pour vos offres
                </p>
              </div>
            </div>

            {/* Total count */}
            {stats.new > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-amber-500 text-white rounded-2xl px-6 py-4 text-center shadow-xl"
              >
                <p className="text-3xl font-bold">{stats.new}</p>
                <p className="text-xs text-amber-100">Nouvelles</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {/* Total */}
          <button
            onClick={() => setFilterStatus("all")}
            className={`p-6 rounded-2xl shadow-md border transition-all text-left ${
              filterStatus === "all"
                ? 'bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] text-white border-[#8a6bfe] shadow-xl scale-105'
                : 'bg-white border-gray-200 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                filterStatus === "all" ? 'bg-white/20' : 'bg-blue-100'
              }`}>
                <Inbox className={`w-6 h-6 ${
                  filterStatus === "all" ? 'text-white' : 'text-blue-600'
                }`} />
              </div>
              <TrendingUp className={`w-5 h-5 ${
                filterStatus === "all" ? 'text-white/70' : 'text-gray-400'
              }`} />
            </div>
            <p className={`text-3xl font-bold mb-1 ${
              filterStatus === "all" ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.total}
            </p>
            <p className={`text-sm font-medium ${
              filterStatus === "all" ? 'text-purple-100' : 'text-gray-600'
            }`}>
              Total des candidatures
            </p>
          </button>

          {/* Nouvelles */}
          <button
            onClick={() => setFilterStatus("new")}
            className={`p-6 rounded-2xl shadow-md border transition-all text-left ${
              filterStatus === "new"
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-500 shadow-xl scale-105'
                : 'bg-white border-gray-200 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                filterStatus === "new" ? 'bg-white/20' : 'bg-amber-100'
              }`}>
                <Clock className={`w-6 h-6 ${
                  filterStatus === "new" ? 'text-white' : 'text-amber-600'
                }`} />
              </div>
              {stats.new > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    filterStatus === "new" ? 'bg-white/30 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {stats.new}
                </motion.div>
              )}
            </div>
            <p className={`text-3xl font-bold mb-1 ${
              filterStatus === "new" ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.new}
            </p>
            <p className={`text-sm font-medium ${
              filterStatus === "new" ? 'text-orange-100' : 'text-gray-600'
            }`}>
              Nouvelles candidatures
            </p>
          </button>

          {/* Vues */}
          <button
            onClick={() => setFilterStatus("seen")}
            className={`p-6 rounded-2xl shadow-md border transition-all text-left ${
              filterStatus === "seen"
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white border-green-500 shadow-xl scale-105'
                : 'bg-white border-gray-200 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                filterStatus === "seen" ? 'bg-white/20' : 'bg-green-100'
              }`}>
                <CheckCircle className={`w-6 h-6 ${
                  filterStatus === "seen" ? 'text-white' : 'text-green-600'
                }`} />
              </div>
            </div>
            <p className={`text-3xl font-bold mb-1 ${
              filterStatus === "seen" ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.seen}
            </p>
            <p className={`text-sm font-medium ${
              filterStatus === "seen" ? 'text-green-100' : 'text-gray-600'
            }`}>
              Candidatures vues
            </p>
          </button>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 text-black border-gray-200 rounded-xl focus:border-[#8a6bfe] focus:ring-2 focus:ring-[#8a6bfe]/20 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Active filter badge */}
          {(filterStatus !== "all" || searchTerm) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"
            >
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Filtres actifs :</span>
              {filterStatus !== "all" && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-2">
                  {filterStatus === "new" ? "Nouvelles" : "Vues"}
                  <button
                    onClick={() => setFilterStatus("all")}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-2">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setFilterStatus("all");
                  setSearchTerm("");
                }}
                className="text-xs text-[#8a6bfe] hover:underline font-medium ml-auto"
              >
                Réinitialiser tout
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Inbox className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm || filterStatus !== "all" 
                ? "Aucune candidature trouvée"
                : "Aucune candidature pour le moment"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Essayez de modifier vos filtres de recherche"
                : "Les nouvelles candidatures apparaîtront ici"}
            </p>
            {(searchTerm || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setFilterStatus("all");
                  setSearchTerm("");
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -4 }}
              >
                <Link
                  href={`/dashboard/applications/${app.id}`}
                  className="block bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all group"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Avatar & Main Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                          <User className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900">
                              {app.fullName}
                            </h3>
                            {(!app.status || app.status !== "seen") && (
                              <motion.span
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full"
                              >
                                Nouveau
                              </motion.span>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 flex-shrink-0 text-[#8a6bfe]" />
                              <span className="truncate">{app.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Briefcase className="w-4 h-4 flex-shrink-0 text-[#8a6bfe]" />
                              <CareerTitle careerId={app.careerId} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 flex-shrink-0 text-[#8a6bfe]" />
                              <span>
                                {app.createdAt
                                  ? new Date(app.createdAt.seconds * 1000).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                      }
                                    )
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Arrow */}
                      <div className="flex items-center justify-end lg:justify-start">
                        <div className="flex items-center gap-2 text-[#8a6bfe] font-semibold group-hover:gap-3 transition-all">
                          <span className="hidden sm:inline">Voir détails</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Results count */}
        {filteredApplications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm text-gray-600"
          >
            Affichage de {filteredApplications.length} candidature
            {filteredApplications.length > 1 ? "s" : ""} sur {applications.length}
          </motion.div>
        )}
      </main>
    </div>
  );
}

// --- Mini composant pour récupérer le titre de l'offre
function CareerTitle({ careerId }: { careerId: string }) {
  const [title, setTitle] = useState("Chargement...");

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "careers", careerId));
      if (snap.exists()) setTitle(snap.data().title);
      else setTitle("Offre supprimée");
    }
    load();
  }, [careerId]);

  return <span className="truncate">{title}</span>;
}