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
  Clock
} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-[#7b5bff] rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Chargement de la candidature...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-10 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Candidature introuvable
          </h2>
          <p className="text-gray-600 mb-6">
            Cette candidature n'existe pas ou a été supprimée.
          </p>
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center gap-2 bg-[#7b5bff] hover:bg-[#6a4de6] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux candidatures
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7b5bff] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Retour aux candidatures</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7b5bff] to-[#6a4de6] rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Détails de la candidature
              </h1>
              <p className="text-gray-600 mt-1">
                Candidature de {application.fullName}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge - Prominent */}
        <div className="mb-6">
          {application.status === "seen" ? (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg">
              <CheckCircle className="w-5 h-5" />
              <span>Candidature vue</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg animate-pulse">
              <Clock className="w-5 h-5" />
              <span>Nouvelle candidature</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#7b5bff]/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-[#7b5bff]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Informations du candidat
                </h2>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="w-5 h-5 text-[#7b5bff]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Nom complet
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {application.fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Mail className="w-5 h-5 text-[#7b5bff]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Email
                    </p>
                    <a 
                      href={`mailto:${application.email}`}
                      className="text-lg font-semibold text-[#7b5bff] hover:underline"
                    >
                      {application.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Calendar className="w-5 h-5 text-[#7b5bff]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Date de candidature
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {application.createdAt
                        ? new Date(
                            application.createdAt.seconds * 1000
                          ).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>

                {application.cvUrl && (
                  <div className="pt-2">
                    <a
                      href={application.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-[#7b5bff] to-[#6a4de6] hover:from-[#6a4de6] hover:to-[#5940cc] text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      <Download className="w-5 h-5" />
                      Télécharger le CV (PDF)
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#7b5bff]/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#7b5bff]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Message de motivation
                </h2>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {application.message}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Job Offer Card */}
            {career && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#7b5bff]/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-[#7b5bff]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Offre concernée
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                    <p className="font-semibold text-lg text-gray-900 mb-2">
                      {career.title}
                    </p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{career.location}</span>
                    </div>
                  </div>

                  {application.status !== "seen" && (
                    <button
                      onClick={markAsSeen}
                      disabled={marking}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7b5bff] to-[#6a4de6] hover:from-[#6a4de6] hover:to-[#5940cc] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {marking ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Mise à jour...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5" />
                          <span>Marquer comme vue</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}