"use client";

import { use, useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  Briefcase, 
  MapPin, 
  Eye, 
  Download,
  CheckCircle,
  Clock,
  Loader2,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ApplicationDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [application, setApplication] = useState<any>(null);
  const [career, setCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    async function load() {
      const appSnap = await getDoc(doc(db, "applications", id));

      if (!appSnap.exists()) {
        setApplication(null);
        setLoading(false);
        return;
      }

      const appData = appSnap.data();
      setApplication({ id, ...appData });

      // Charger l'offre
      const careerSnap = await getDoc(doc(db, "careers", appData.careerId));
      if (careerSnap.exists()) setCareer(careerSnap.data());

      setLoading(false);
    }

    load();
  }, [id]);

  async function markAsSeen() {
    try {
      setMarking(true);
      await updateDoc(doc(db, "applications", id), {
        status: "seen",
      });
      setApplication((prev: any) => ({ ...prev, status: "seen" }));
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 px-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#8a6bfe] mb-4" />
        <p className="text-gray-600 font-medium text-center">Chargement de la candidature...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md border border-gray-100 w-full"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            Candidature introuvable
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Cette candidature n'existe pas ou a été supprimée.
          </p>
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Retour aux candidatures
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header avec gradient Woppy */}
      <div className="bg-gradient-to-r from-[#6b4fd9] via-[#8a6bfe] to-[#7b5bef] text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/dashboard/applications"
              className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 sm:mb-6 transition-colors group text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-x-1 transition-transform" />
              Retour
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">Détails</h1>
                  <p className="text-purple-100 text-sm sm:text-base truncate">
                    <span className="font-semibold">{application.fullName}</span>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {application.status === "seen" ? (
                <div className="bg-green-500/20 backdrop-blur-sm border-2 border-green-300 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl font-semibold flex items-center gap-2 text-sm sm:text-base self-start sm:self-auto">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Vue</span>
                </div>
              ) : (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-amber-500/20 backdrop-blur-sm border-2 border-amber-300 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl font-semibold flex items-center gap-2 text-sm sm:text-base self-start sm:self-auto"
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Nouveau</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Candidate Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-md p-4 sm:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8a6bfe] to-[#6b4fd9] rounded-xl flex items-center justify-center text-white shadow-lg">
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Informations
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Nom */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-5 bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#8a6bfe]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">
                      Nom complet
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
                      {application.fullName}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-5 bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#8a6bfe]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">
                      Email
                    </p>
                    <a 
                      href={`mailto:${application.email}`}
                      className="text-base sm:text-lg font-bold text-[#8a6bfe] hover:underline flex items-center gap-2 break-all"
                    >
                      <span className="break-all">{application.email}</span>
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-5 bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#8a6bfe]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">
                      Date de candidature
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">
                      {application.createdAt
                        ? new Date(
                            application.createdAt.seconds * 1000
                          ).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* CV Preview */}
                {application.cvUrl && (
                  <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-[#8a6bfe]" />
                        Aperçu du CV
                      </p>
                      <a
                        href={application.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-[#8a6bfe] hover:underline font-medium flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Télécharger</span>
                      </a>
                    </div>
                    <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px]">
                      <iframe
                        src={application.cvUrl}
                        className="w-full h-full"
                        title="Aperçu du CV"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md p-4 sm:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Message
                </h2>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 p-4 sm:p-6 rounded-xl border-2 border-blue-100">
                <p className="text-sm sm:text-base text-gray-800 whitespace-pre-line leading-relaxed">
                  {application.message}
                </p>
              </div>

              {/* Stats message */}
              <div className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <span>{application.message.length} caractères</span>
                <span>•</span>
                <span>{application.message.split(/\s+/).length} mots</span>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-4 sm:space-y-6">
            {/* Job Offer Card */}
            {career && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 lg:sticky lg:top-6"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Offre concernée
                  </h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl border-2 border-green-100">
                    <p className="font-bold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3 break-words">
                      {career.title}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium">{career.location}</span>
                      </div>
                      
                      {career.type && (
                        <div className="inline-block px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold">
                          {career.type}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mark as Seen Button */}
                  {application.status !== "seen" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={markAsSeen}
                      disabled={marking}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] disabled:from-gray-400 disabled:to-gray-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      {marking ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span>Mise à jour...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Marquer comme vue</span>
                        </>
                      )}
                    </motion.button>
                  )}

                  {application.status === "seen" && (
                    <div className="p-3 sm:p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700 text-sm sm:text-base">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="font-semibold">Déjà vue</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Actions rapides</p>
                  <div className="space-y-2">
                    <Link
                      href={`mailto:${application.email}?subject=Votre candidature - ${career.title}`}
                      className="flex items-center gap-2 text-xs sm:text-sm text-[#8a6bfe] hover:underline font-medium"
                    >
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      Envoyer un email
                    </Link>
                    {application.cvUrl && (
                      <Link
                        href={application.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs sm:text-sm text-[#8a6bfe] hover:underline font-medium"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        Télécharger le CV
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}