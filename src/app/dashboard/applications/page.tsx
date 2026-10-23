"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import {
  FileText, Search, Filter, Calendar, Mail, Briefcase,
  ArrowRight, Inbox, CheckCircle, Clock, Loader2, X,
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

function CareerTitle({ careerId }: { careerId: string }) {
  const [title, setTitle] = useState("...");
  useEffect(() => {
    getDoc(doc(db, "careers", careerId)).then((snap) =>
      setTitle(snap.exists() ? snap.data().title : "Offre supprimée")
    );
  }, [careerId]);
  return <span className="truncate">{title}</span>;
}

export default function ApplicationsDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "seen">("all");

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "applications"), orderBy("createdAt", "desc")),
      (snap) => {
        setApplications(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Application, "id">) })));
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filtered = applications.filter((app) => {
    const matchSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "new" && (!app.status || app.status !== "seen")) ||
      (filterStatus === "seen" && app.status === "seen");
    return matchSearch && matchStatus;
  });

  const stats = {
    total: applications.length,
    new:   applications.filter((a) => !a.status || a.status !== "seen").length,
    seen:  applications.filter((a) => a.status === "seen").length,
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfaf7]">
      <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
      <p className="font-['DM_Sans',system-ui] text-muted">Chargement des candidatures...</p>
    </div>
  );

  return (
    <>
      <style>{`
        
      `}</style>

      <main className="min-h-screen bg-[#fbfaf7] font-['DM_Sans',system-ui,sans-serif]">

        {/* ── Hero ── */}
        <section className="max-w-[960px] mx-auto px-5 pt-12 pb-10 sm:pt-16 sm:pb-12">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-[7px] rounded-full bg-brand-soft border border-brand/30 text-[13px] font-semibold text-brand">
              <FileText className="w-3.5 h-3.5" />
              Recrutement
            </span>
          </div>

          <h1 className="font-[var(--font-bricolage),system-ui] text-center font-extrabold text-[1.9rem] sm:text-[2.8rem] leading-[1.15] tracking-[-0.03em] text-[#15131f] mb-4">
            Candidatures{" "}
            <span className="bg-gradient-to-br from-brand to-brand/50 bg-clip-text text-transparent">
              reçues
            </span>
          </h1>

          <p className="text-center text-[14px] sm:text-[16px] text-muted max-w-[440px] mx-auto mb-10 leading-[1.7]">
            Gérez et suivez toutes les candidatures reçues pour vos offres d'emploi.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {([
              { key: "all",  label: "Total",     value: stats.total, color: "text-brand", activeBg: "bg-brand" },
              { key: "new",  label: "Nouvelles",  value: stats.new,   color: "text-amber-500",  activeBg: "bg-amber-500"  },
              { key: "seen", label: "Vues",       value: stats.seen,  color: "text-green-500",  activeBg: "bg-green-500"  },
            ] as const).map((s) => (
              <button
                key={s.key}
                onClick={() => setFilterStatus(s.key)}
                className={`rounded-2xl p-4 text-center border transition-all duration-150
                  ${filterStatus === s.key
                    ? `${s.activeBg} border-transparent shadow-md`
                    : "bg-white border-line hover:border-brand/30 hover:shadow-sm"
                  }`}
              >
                <p className={`font-[var(--font-bricolage),system-ui] font-bold text-2xl
                  ${filterStatus === s.key ? "text-white" : "text-[#15131f]"}`}>
                  {s.value}
                </p>
                <p className={`text-[11px] font-medium mt-0.5
                  ${filterStatus === s.key ? "text-white/70" : "text-muted"}`}>
                  {s.label}
                </p>
              </button>
            ))}
          </div>
        </section>

        <div className="max-w-[960px] mx-auto px-5 pb-20 space-y-4">

          {/* ── Search bar ── */}
          <div className="bg-white border border-line rounded-2xl p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-paper-2 border border-line rounded-xl text-sm text-ink-2 placeholder:text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtres actifs */}
            <AnimatePresence>
              {(filterStatus !== "all" || searchTerm) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 mt-3 pt-3 border-t border-line flex-wrap"
                >
                  <Filter className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span className="text-[12px] text-muted">Filtres actifs :</span>

                  {filterStatus !== "all" && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-soft text-brand border border-brand/30">
                      {filterStatus === "new" ? "Nouvelles" : "Vues"}
                      <button onClick={() => setFilterStatus("all")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-paper-2 text-muted border border-line">
                      "{searchTerm}"
                      <button onClick={() => setSearchTerm("")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => { setFilterStatus("all"); setSearchTerm(""); }}
                    className="ml-auto text-[12px] text-brand font-semibold hover:text-brand transition-colors"
                  >
                    Réinitialiser
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Liste ── */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-line rounded-2xl p-16 text-center"
            >
              <div className="w-14 h-14 bg-brand-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-7 h-7 text-brand" />
              </div>
              <p className="font-[var(--font-bricolage),system-ui] font-bold text-[#15131f] mb-1">
                {searchTerm || filterStatus !== "all"
                  ? "Aucune candidature trouvée"
                  : "Aucune candidature pour le moment"}
              </p>
              <p className="text-sm text-muted mb-5">
                {searchTerm || filterStatus !== "all"
                  ? "Essayez de modifier vos filtres"
                  : "Les nouvelles candidatures apparaîtront ici"}
              </p>
              {(searchTerm || filterStatus !== "all") && (
                <button
                  onClick={() => { setFilterStatus("all"); setSearchTerm(""); }}
                  className="px-4 py-2 bg-brand hover:bg-ink text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((app, index) => {
                const isNew = !app.status || app.status !== "seen";
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      href={`/dashboard/applications/${app.id}`}
                      className="group block bg-white border border-line rounded-2xl p-5 hover:border-brand/30 hover:shadow-[0_2px_20px_rgba(138,107,254,0.08)] transition-all duration-150 no-underline"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* Avatar */}
                        <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center shrink-0 border border-brand-soft">
                          <span className="font-[var(--font-bricolage),system-ui] font-bold text-sm text-brand">
                            {app.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <p className="font-[var(--font-bricolage),system-ui] font-bold text-[14px] text-[#15131f] group-hover:text-brand transition-colors">
                              {app.fullName}
                            </p>
                            {isNew && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-500 border border-amber-200">
                                <Clock className="w-2.5 h-2.5" /> Nouveau
                              </span>
                            )}
                            {app.status === "seen" && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                                <CheckCircle className="w-2.5 h-2.5" /> Vue
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-muted shrink-0" />
                              <span className="text-[12px] text-muted truncate">{app.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3 h-3 text-muted shrink-0" />
                              <span className="text-[12px] text-muted truncate">
                                <CareerTitle careerId={app.careerId} />
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-muted shrink-0" />
                              <span className="text-[12px] text-muted">
                                {app.createdAt
                                  ? new Date(app.createdAt.seconds * 1000).toLocaleDateString("fr-FR", {
                                      day: "2-digit", month: "short", year: "numeric",
                                    })
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-brand group-hover:text-brand shrink-0 self-end sm:self-auto transition-colors">
                          Voir détails
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Footer count */}
          {filtered.length > 0 && (
            <p className="text-center text-[12px] text-muted pt-2">
              {filtered.length} candidature{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""} sur {applications.length}
            </p>
          )}

        </div>
      </main>
    </>
  );
}