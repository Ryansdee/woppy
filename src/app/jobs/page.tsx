"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import cityMapJson from "../../../public/data/city-abbreviations.json";
const cityMap: Record<string, string> = cityMapJson;

import {
  Search, Map as MapIcon, LayoutGrid, X, ChevronRight,
  MapPin, Calendar, Clock, AlertCircle, SlidersHorizontal,
  TrendingUp, Briefcase, ArrowUpRight,
} from "lucide-react";

const AnnoncesMap = dynamic(() => import("@/components/AnnoncesMap"), { ssr: false });

interface Annonce {
  id: string;
  titre: string;
  description: string;
  date: string;
  duree: number;
  lieu: string;
  coords: { lat: number; lon: number } | null;
  remuneration: number;
  statut: "ouverte" | "en cours" | "fini";
  photos: string[];
  maxApplicants: number;
  currentApplicants: number;
  applicants: string[];
  userId: string;
  createdAt?: any;
  radius?: number;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function normalizeCity(v: string) {
  return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, "");
}

function resolveCityAlias(input: string): string {
  const key = input.toLowerCase().replace(/\s|-/g, "");
  return cityMap[key] || input;
}

const STATUS = {
  ouverte:   { label: "Ouverte",   dot: "#22c55e", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  "en cours":{ label: "En cours",  dot: "#f59e0b", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  fini:      { label: "Terminée",  dot: "#94a3b8", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
};

/* ── input style ── */
const inputCls = `
  w-full px-4 py-2.5 text-sm rounded-xl
  border border-slate-200 bg-white text-slate-800
  placeholder:text-slate-400
  focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400
  transition-all
`;

export default function AnnoncesPage() {
  const router = useRouter();
  const [annonces, setAnnonces]     = useState<Annonce[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterMinRate, setFilterMinRate] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "ouverte" | "en cours" | "fini">("all");
  const [filterRadius, setFilterRadius] = useState(10);
  const [cityCoords, setCityCoords]  = useState<{ lat: number; lon: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode]      = useState<"list" | "map">("list");
  const [sortBy, setSortBy]          = useState<"recent" | "price-high" | "price-low">("recent");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (!u) router.push("/auth/login"); });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const q = query(collection(db, "annonces"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAnnonces(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Annonce[]);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = filterCity.trim();
    if (q.length < 2) { setCityCoords(null); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=be&limit=1`);
        const data = await res.json();
        setCityCoords(data[0] ? { lat: Number(data[0].lat), lon: Number(data[0].lon) } : null);
      } catch { setCityCoords(null); }
    }, 400);
    return () => clearTimeout(t);
  }, [filterCity]);

  const filtered = useMemo(() => {
    let r = annonces.filter((a) => a.statut !== "fini");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((a) => a.titre.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.lieu.toLowerCase().includes(q));
    }
    if (filterMinRate.trim()) r = r.filter((a) => Number(a.remuneration) >= Number(filterMinRate));
    if (filterStatus !== "all") r = r.filter((a) => a.statut === filterStatus);
    if (filterCity.trim()) {
      const target = normalizeCity(resolveCityAlias(filterCity));
      r = r.filter((a) => {
        const textMatch = normalizeCity(a.lieu || "").includes(target);
        if (!cityCoords || !a.coords) return textMatch;
        return textMatch && haversineDistance(cityCoords.lat, cityCoords.lon, a.coords.lat, a.coords.lon) <= filterRadius;
      });
    }
    if (sortBy === "price-high") r.sort((a, b) => Number(b.remuneration) - Number(a.remuneration));
    if (sortBy === "price-low")  r.sort((a, b) => Number(a.remuneration) - Number(b.remuneration));
    return r;
  }, [annonces, searchQuery, filterMinRate, filterStatus, filterCity, cityCoords, filterRadius, sortBy]);

  const activeFiltersCount = [filterCity, filterMinRate, filterStatus !== "all"].filter(Boolean).length;
  const resetFilters = () => { setFilterCity(""); setCityCoords(null); setFilterMinRate(""); setFilterStatus("all"); setSortBy("recent"); };
  const isNew = (a: Annonce) => a.createdAt && Date.now() - new Date(a.createdAt?.toDate?.() || a.createdAt).getTime() < 24 * 3600 * 1000;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center animate-pulse">
          <Briefcase size={18} className="text-white" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Chargement…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&display=swap');
        .jobs-root { font-family: system-ui, -apple-system, sans-serif; }
        .jobs-title { font-family: 'Sora', system-ui, sans-serif; }
        .drawer-in { animation: drawerSlide .28s cubic-bezier(.22,1,.36,1); }
        @keyframes drawerSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      <div className="jobs-root min-h-screen bg-slate-50 text-slate-900">

        {/* ════════ TOPBAR ════════ */}
        <div className="sticky top-0 z-40 bg-white border-b border-slate-100"
          style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.05)' }}>
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50
                           placeholder:text-slate-400 text-slate-800
                           focus:outline-none focus:ring-2 focus:ring-violet-400/25 focus:border-violet-400
                           focus:bg-white transition-all"
                placeholder="Titre, ville, mission…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="hidden sm:flex items-center gap-1.5">
              <TrendingUp size={13} className="text-slate-400" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm text-slate-600 bg-transparent focus:outline-none cursor-pointer">
                <option value="recent">Récentes</option>
                <option value="price-high">Prix ↓</option>
                <option value="price-low">Prix ↑</option>
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Filters button */}
              <button onClick={() => setShowFilters(true)}
                className="relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl
                           border border-slate-200 bg-white text-slate-600
                           hover:border-violet-300 hover:text-violet-600 transition-all">
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* View toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl">
                {([["list", <LayoutGrid size={14} />], ["map", <MapIcon size={14} />]] as const).map(([mode, icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-lg transition-all ${viewMode === mode
                      ? "bg-white shadow-sm text-violet-600"
                      : "text-slate-400 hover:text-slate-600"}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════ PAGE HEADER ════════ */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="jobs-title font-bold text-2xl text-slate-900 tracking-tight mb-1">
                  Annonces disponibles
                </h1>
                <p className="text-sm text-slate-500">
                  {filtered.length} mission{filtered.length !== 1 ? "s" : ""} ouverte{filtered.length !== 1 ? "s" : ""}
                  {activeFiltersCount > 0 && (
                    <button onClick={resetFilters} className="ml-2 text-violet-600 hover:text-violet-700 font-medium transition-colors">
                      · Réinitialiser les filtres
                    </button>
                  )}
                </p>
              </div>

              {/* Active filter tags */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {filterCity && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-violet-50 text-violet-700
                                     border border-violet-200 px-2.5 py-1 rounded-full">
                      <MapPin size={10} /> {filterCity}
                      <button onClick={() => setFilterCity("")} className="hover:text-violet-900 transition"><X size={10} /></button>
                    </span>
                  )}
                  {filterMinRate && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-violet-50 text-violet-700
                                     border border-violet-200 px-2.5 py-1 rounded-full">
                      ≥{filterMinRate}€/h
                      <button onClick={() => setFilterMinRate("")} className="hover:text-violet-900 transition"><X size={10} /></button>
                    </span>
                  )}
                  {filterStatus !== "all" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-violet-50 text-violet-700
                                     border border-violet-200 px-2.5 py-1 rounded-full">
                      {STATUS[filterStatus]?.label}
                      <button onClick={() => setFilterStatus("all")} className="hover:text-violet-900 transition"><X size={10} /></button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════ CONTENT ════════ */}
        <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
          {viewMode === "list" ? (
            filtered.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((a) => {
                  const cfg = STATUS[a.statut] || STATUS["ouverte"];
                  return (
                    <Link key={a.id} href={`/jobs/${a.id}`}
                      className="group relative bg-white rounded-2xl flex flex-col overflow-hidden
                                 border border-slate-100 hover:border-violet-200
                                 hover:shadow-[0_8px_32px_rgba(124,95,230,0.1)]
                                 transition-all duration-200">

                      {/* Photo or placeholder */}
                      {a.photos?.length > 0 ? (
                        <div className="relative h-36 overflow-hidden bg-slate-100">
                          <img src={a.photos[0]} alt={a.titre}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          {isNew(a) && (
                            <span className="absolute top-2.5 left-2.5 text-[10px] font-bold bg-violet-600 text-white
                                             px-2 py-0.5 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="relative h-24 bg-slate-50 border-b border-slate-100 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                            <Briefcase size={18} className="text-violet-400" />
                          </div>
                          {isNew(a) && (
                            <span className="absolute top-2.5 left-2.5 text-[10px] font-bold bg-violet-600 text-white
                                             px-2 py-0.5 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col flex-1 p-4">
                        {/* Status + duration */}
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                            {cfg.label}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={11} /> {a.duree}h
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="jobs-title font-semibold text-sm text-slate-900 mb-1 line-clamp-1
                                       group-hover:text-violet-700 transition-colors tracking-tight">
                          {a.titre}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1 leading-relaxed">
                          {a.description}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-col gap-1 text-[11px] text-slate-400 mb-3">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={11} className="text-violet-400 shrink-0" />
                            <span className="truncate">{a.lieu || "—"}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={11} className="text-violet-400 shrink-0" />
                            {a.date}
                          </span>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <div className="flex items-baseline gap-1">
                            <span className="jobs-title font-bold text-xl text-slate-900 tracking-tight">
                              {a.remuneration}
                            </span>
                            <span className="text-xs font-medium text-slate-400">€/h</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-violet-600
                                          opacity-0 group-hover:opacity-100 transition-all">
                            Voir <ArrowUpRight size={12} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <AlertCircle size={22} className="text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">Aucune annonce trouvée</h3>
                <p className="text-sm text-slate-400 mb-5">Modifie ta recherche ou réinitialise les filtres.</p>
                {activeFiltersCount > 0 && (
                  <button onClick={resetFilters}
                    className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition">
                    Réinitialiser
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
              style={{ height: "calc(100vh - 280px)", minHeight: 500 }}>
              <AnnoncesMap annonces={filtered} />
            </div>
          )}
        </div>

        {/* ════════ FILTER DRAWER ════════ */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex">
            <button className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowFilters(false)} />

            <div className="drawer-in absolute right-0 top-0 w-full sm:w-[380px] h-full bg-white flex flex-col shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <h2 className="jobs-title font-bold text-base text-slate-900">Filtres</h2>
                  {activeFiltersCount > 0 && (
                    <p className="text-xs text-violet-600 font-medium mt-0.5">
                      {activeFiltersCount} actif{activeFiltersCount > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <button onClick={() => setShowFilters(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition text-slate-500">
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ville</label>
                  <input className={inputCls} placeholder="Bruxelles, Louvain-la-Neuve…"
                    value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
                </div>

                {/* Radius */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rayon</label>
                    <span className="text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                      {filterRadius} km
                    </span>
                  </div>
                  <input type="range" min={2} max={50} className="w-full accent-violet-600"
                    value={filterRadius} onChange={(e) => setFilterRadius(Number(e.target.value))} />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>2 km</span><span>50 km</span>
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Rémunération minimum
                  </label>
                  <div className="relative">
                    <input type="number" className={inputCls + " pr-12"} placeholder="12"
                      value={filterMinRate} onChange={(e) => setFilterMinRate(e.target.value)} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">€/h</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">Statut</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "all",      label: "Tous" },
                      { value: "ouverte",  label: "Ouverte" },
                      { value: "en cours", label: "En cours" },
                      { value: "fini",     label: "Terminée" },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => setFilterStatus(opt.value as typeof filterStatus)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          filterStatus === opt.value
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">Trier par</label>
                  <div className="space-y-1.5">
                    {[
                      { value: "recent",     label: "Plus récentes" },
                      { value: "price-high", label: "Prix décroissant" },
                      { value: "price-low",  label: "Prix croissant" },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => setSortBy(opt.value as typeof sortBy)}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium border text-left
                                    flex items-center justify-between transition-all ${
                          sortBy === opt.value
                            ? "bg-violet-50 text-violet-700 border-violet-200"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}>
                        {opt.label}
                        {sortBy === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                <button onClick={resetFilters}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold
                             text-slate-600 hover:bg-slate-50 transition">
                  Réinitialiser
                </button>
                <button onClick={() => setShowFilters(false)}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl
                             text-sm font-semibold transition shadow-sm shadow-violet-200">
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}