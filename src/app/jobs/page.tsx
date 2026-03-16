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
<<<<<<< HEAD
  Search, Map as MapIcon, LayoutGrid, X, ChevronRight,
  MapPin, Calendar, Clock, AlertCircle, SlidersHorizontal,
  TrendingUp, Briefcase, ArrowUpRight,
=======
  Search,
  Filter,
  Map as MapIcon,
  LayoutGrid,
  X,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Euro,
  AlertCircle,
  SlidersHorizontal,
  TrendingUp,
  Briefcase,
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd
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
<<<<<<< HEAD
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function normalizeCity(v: string) {
  return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, "");
=======
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function normalizeCity(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]/g, "");
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd
}

function resolveCityAlias(input: string): string {
  const key = input.toLowerCase().replace(/\s|-/g, "");
  return cityMap[key] || input;
}

<<<<<<< HEAD
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
=======
const statusConfig = {
  ouverte: { label: "Ouverte", dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  "en cours": { label: "En cours", dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  fini: { label: "Terminée", dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-500", ring: "ring-gray-200" },
};

export default function AnnoncesPage() {
  const router = useRouter();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterMinRate, setFilterMinRate] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "ouverte" | "en cours" | "fini">("all");
  const [filterRadius, setFilterRadius] = useState(10);
<<<<<<< HEAD
  const [cityCoords, setCityCoords]  = useState<{ lat: number; lon: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode]      = useState<"list" | "map">("list");
  const [sortBy, setSortBy]          = useState<"recent" | "price-high" | "price-low">("recent");
=======
  const [cityCoords, setCityCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState<"recent" | "price-high" | "price-low">("recent");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (!u) router.push("/auth/login"); });
    return () => unsub();
  }, [router]);

  useEffect(() => {
<<<<<<< HEAD
    const q = query(collection(db, "annonces"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAnnonces(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Annonce[]);
      setLoading(false);
    }, () => setLoading(false));
=======
    const qRef = query(collection(db, "annonces"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Annonce[];
        setAnnonces(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = filterCity.trim();
    if (q.length < 2) { setCityCoords(null); return; }
<<<<<<< HEAD
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
=======
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=be&limit=1`
        );
        const data = await res.json();
        if (data[0]) setCityCoords({ lat: Number(data[0].lat), lon: Number(data[0].lon) });
        else setCityCoords(null);
      } catch { setCityCoords(null); }
    }, 400);
    return () => clearTimeout(timer);
  }, [filterCity]);

  const filtered = useMemo(() => {
    let results = annonces.filter((a) => a.statut !== "fini");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (a) => a.titre.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.lieu.toLowerCase().includes(q)
      );
    }
    if (filterMinRate.trim()) {
      const min = Number(filterMinRate);
      results = results.filter((a) => Number(a.remuneration) >= min);
    }
    if (filterStatus !== "all") results = results.filter((a) => a.statut === filterStatus);
    if (filterCity.trim()) {
      const resolved = resolveCityAlias(filterCity);
      const target = normalizeCity(resolved);
      results = results.filter((a) => {
        const lieuNorm = normalizeCity(a.lieu || "");
        const textMatch = lieuNorm.includes(target);
        if (!cityCoords || !a.coords) return textMatch;
        const distanceKm = haversineDistance(cityCoords.lat, cityCoords.lon, a.coords.lat, a.coords.lon);
        return textMatch && distanceKm <= filterRadius;
      });
    }
    if (sortBy === "price-high") results.sort((a, b) => Number(b.remuneration) - Number(a.remuneration));
    else if (sortBy === "price-low") results.sort((a, b) => Number(a.remuneration) - Number(b.remuneration));
    return results;
  }, [annonces, searchQuery, filterMinRate, filterStatus, filterCity, cityCoords, filterRadius, sortBy]);

  const activeFiltersCount = [filterCity, filterMinRate, filterStatus !== "all"].filter(Boolean).length;

  const resetFilters = () => {
    setFilterCity(""); setCityCoords(null); setFilterMinRate(""); setFilterStatus("all"); setSortBy("recent");
  };

  const isNew = (a: Annonce) =>
    a.createdAt && Date.now() - new Date(a.createdAt?.toDate?.() || a.createdAt).getTime() < 24 * 60 * 60 * 1000;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] flex items-center justify-center animate-pulse">
            <Briefcase size={24} className="text-white" />
          </div>
          <p className="text-gray-500 font-medium">Chargement des annonces…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">

      {/* ─── HERO HEADER ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#6d4fe0] via-[#8a6bfe] to-[#a989ff] text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute top-8 right-1/3 w-2 h-2 rounded-full bg-white/40" />
        <div className="absolute top-16 right-1/4 w-1 h-1 rounded-full bg-white/30" />
        <div className="absolute bottom-8 left-1/3 w-3 h-3 rounded-full bg-white/20" />

        <div className="relative max-w-7xl mx-auto px-6 py-14">
          {/* Stats bar */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {filtered.length} annonce{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
            </div>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-400/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-yellow-200">
                <SlidersHorizontal size={11} />
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? "s" : ""} actif{activeFiltersCount > 1 ? "s" : ""}
              </div>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight leading-tight">
            Jobs étudiants
          </h1>
          <p className="text-white/75 mb-8 text-base sm:text-lg max-w-xl">
            Trouve une mission qui correspond à ton emploi du temps et tes envies.
          </p>

          {/* Search row */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
              <input
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 text-white placeholder-white/55 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all text-sm"
                placeholder="Titre, description, ville…"
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
<<<<<<< HEAD
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  <X size={13} />
=======
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition">
                  <X size={16} />
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd
                </button>
              )}
            </div>

<<<<<<< HEAD
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
=======
            <button
              onClick={() => setShowFilters(true)}
              className="relative px-5 py-3.5 bg-white text-[#8a6bfe] rounded-2xl font-semibold shadow-lg hover:bg-white/95 active:scale-95 transition-all flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <SlidersHorizontal size={17} />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 text-gray-900 rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ─── TOOLBAR ─── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-[#8a6bfe]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="recent">Plus récentes</option>
              <option value="price-high">Prix ↓</option>
              <option value="price-low">Prix ↑</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3.5 py-1.5 rounded-lg text-sm flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "list" ? "bg-white shadow-sm text-[#8a6bfe]" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid size={15} /> Liste
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3.5 py-1.5 rounded-lg text-sm flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "map" ? "bg-white shadow-sm text-[#8a6bfe]" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MapIcon size={15} /> Carte
            </button>
          </div>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-20">
        {viewMode === "list" ? (
          filtered.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => {
                const cfg = statusConfig[a.statut] || statusConfig["ouverte"];
                const newBadge = isNew(a);
                return (
                  <Link
                    key={a.id}
                    href={`/jobs/${a.id}`}
                    onMouseEnter={() => setHoveredCard(a.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#8a6bfe]/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
                  >
                    {/* Top accent bar */}
                    <div className={`h-1 w-full bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] transition-all duration-300 ${hoveredCard === a.id ? 'opacity-100' : 'opacity-0'}`} />

                    {/* Photo or placeholder */}
                    {a.photos && a.photos.length > 0 ? (
                      <div className="relative h-40 overflow-hidden bg-gray-100">
                        <img
                          src={a.photos[0]}
                          alt={a.titre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        {newBadge && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Sparkles size={9} /> Nouveau
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#f0eaff] to-[#e8daff] flex items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center shadow-sm">
                          <Briefcase size={22} className="text-[#8a6bfe]" />
                        </div>
                        {newBadge && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Sparkles size={9} /> Nouveau
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col flex-1 p-5">
                      {/* Status badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                          <Clock size={11} /> {a.duree}h
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-[#8a6bfe] transition-colors line-clamp-1">
                        {a.titre}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {a.description}
                      </p>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-[#8a6bfe]" />
                          {a.lieu || "—"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-[#8a6bfe]" />
                          {a.date}
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-gray-900">{a.remuneration}</span>
                          <span className="text-sm font-semibold text-gray-400">€/h</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a6bfe] group-hover:gap-2.5 transition-all">
                          Voir
                          <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#f0eaff] to-[#ddc2ff] flex items-center justify-center mb-5 shadow-inner">
                <AlertCircle size={32} className="text-[#8a6bfe]" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Aucune annonce trouvée</h3>
              <p className="text-gray-500 text-sm max-w-xs mb-6">Essaie de modifier tes filtres ou ta recherche.</p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-[#8a6bfe] text-white rounded-xl text-sm font-semibold hover:bg-[#7a5bf0] transition"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )
        ) : (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100" style={{ height: "calc(100vh - 280px)", minHeight: 500 }}>
            <AnnoncesMap annonces={filtered} />
          </div>
        )}
      </div>

      {/* ─── FILTER DRAWER ─── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 w-full sm:w-[400px] h-full bg-white flex flex-col shadow-2xl animate-drawer">
            {/* Handle bar (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
                {activeFiltersCount > 0 && (
                  <p className="text-xs text-[#8a6bfe] font-medium mt-0.5">{activeFiltersCount} filtre{activeFiltersCount > 1 ? "s" : ""} actif{activeFiltersCount > 1 ? "s" : ""}</p>
                )}
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">📍 Ville</label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8a6bfe]/30 focus:border-[#8a6bfe] transition"
                  placeholder="Bruxelles, Louvain-la-Neuve…"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1.5 ml-1">Recherche géographique avec rayon.</p>
              </div>

              {/* Radius */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-800">📏 Rayon</label>
                  <span className="text-sm font-bold text-[#8a6bfe] bg-[#f0eaff] px-2.5 py-0.5 rounded-full">{filterRadius} km</span>
                </div>
                <input
                  type="range" min={2} max={50}
                  className="w-full accent-[#8a6bfe]"
                  value={filterRadius}
                  onChange={(e) => setFilterRadius(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>2 km</span><span>50 km</span>
                </div>
              </div>

              {/* Rate */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">💶 Rémunération minimum</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8a6bfe]/30 focus:border-[#8a6bfe] transition"
                    placeholder="12"
                    value={filterMinRate}
                    onChange={(e) => setFilterMinRate(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">€/h</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">🏷️ Statut</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "all", label: "Tous" },
                    { value: "ouverte", label: "🟢 Ouverte" },
                    { value: "en cours", label: "🟡 En cours" },
                    { value: "fini", label: "⚪ Terminée" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterStatus(opt.value as typeof filterStatus)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        filterStatus === opt.value
                          ? "bg-[#8a6bfe] text-white border-[#8a6bfe] shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#8a6bfe]/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">↕️ Trier par</label>
                <div className="space-y-2">
                  {[
                    { value: "recent", label: "Plus récentes" },
                    { value: "price-high", label: "Prix décroissant" },
                    { value: "price-low", label: "Prix croissant" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value as typeof sortBy)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium border text-left flex items-center justify-between transition-all ${
                        sortBy === opt.value
                          ? "bg-[#f0eaff] text-[#8a6bfe] border-[#8a6bfe]/40"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {opt.label}
                      {sortBy === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#8a6bfe]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-2 px-8 py-3 bg-gradient-to-r from-[#8a6bfe] to-[#a989ff] text-white rounded-2xl text-sm font-semibold shadow hover:shadow-md transition"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-drawer {
          animation: slideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd
  );
}