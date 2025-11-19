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
  Clock
} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-[#7b5bff] rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7b5bff] to-[#6a4de6] rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Candidatures
            </h1>
          </div>
          <p className="text-gray-600 ml-15">
            Gérez toutes les candidatures reçues pour vos offres d'emploi
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Inbox className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
            <p className="text-sm text-gray-600 font-medium">Total des candidatures</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              {stats.new > 0 && (
                <div className="w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {stats.new}
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.new}</p>
            <p className="text-sm text-gray-600 font-medium">Nouvelles candidatures</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.seen}</p>
            <p className="text-sm text-gray-600 font-medium">Candidatures vues</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-purple-100">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-[#7b5bff] focus:ring-2 focus:ring-[#7b5bff]/20 outline-none transition-all"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                  filterStatus === "all"
                    ? "bg-[#7b5bff] text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilterStatus("new")}
                className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  filterStatus === "new"
                    ? "bg-amber-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Nouvelles
                {stats.new > 0 && (
                  <span className="w-5 h-5 bg-white text-amber-500 text-xs font-bold rounded-full flex items-center justify-center">
                    {stats.new}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterStatus("seen")}
                className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                  filterStatus === "seen"
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Vues
              </button>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-purple-100">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-[#7b5bff]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm || filterStatus !== "all" 
                ? "Aucune candidature trouvée"
                : "Aucune candidature pour le moment"}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Essayez de modifier vos filtres de recherche"
                : "Les nouvelles candidatures apparaîtront ici"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Link
                key={app.id}
                href={`/dashboard/applications/${app.id}`}
                className="block bg-white rounded-2xl shadow-lg hover:shadow-xl border border-purple-100 transition-all duration-200 transform hover:scale-[1.01] group"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#7b5bff] to-[#6a4de6] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {app.fullName}
                            </h3>
                            {(!app.status || app.status !== "seen") && (
                              <span className="flex-shrink-0 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                Nouveau
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{app.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 flex-shrink-0" />
                              <CareerTitle careerId={app.careerId} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {app.createdAt
                                  ? new Date(app.createdAt.seconds * 1000).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action */}
                    <div className="flex items-center justify-end sm:justify-start">
                      <div className="flex items-center gap-2 text-[#7b5bff] font-semibold group-hover:gap-3 transition-all">
                        <span className="hidden sm:inline">Voir détails</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
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