"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import cityMapJson from "../../../public/data/city-abbreviations.json";
const cityMap: Record<string, string> = cityMapJson;

import {
  Search,
  Filter,
  Map as MapIcon,
  Grid3x3,
  X,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Euro,
  AlertCircle,
} from "lucide-react";

const AnnoncesMap = dynamic(() => import("@/components/AnnoncesMap"), {
  ssr: false,
});

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

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.asin(Math.sqrt(a));
}

function normalizeCity(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD") // retire les accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]/g, ""); // supprime espaces & tirets
}
function resolveCityAlias(input: string): string {
  const key = input.toLowerCase().replace(/\s|-/g, "");
  return cityMap[key] || input;
}

export default function AnnoncesPage() {
  const router = useRouter();

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterMinRate, setFilterMinRate] = useState("");

  const [filterStatus, setFilterStatus] = useState<
    "all" | "ouverte" | "en cours" | "fini"
  >("all");

  const [filterRadius, setFilterRadius] = useState(10);
  const [cityCoords, setCityCoords] = useState<{ lat: number; lon: number } | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState<"recent" | "price-high" | "price-low">("recent");
  

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/auth/login");
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
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

    return () => unsub();
  }, []);

useEffect(() => {
  const q = filterCity.trim();
  if (q.length < 2) {
    setCityCoords(null);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&countrycodes=be&limit=1`
      );
      const data = await res.json();
      if (data[0]) {
        setCityCoords({
          lat: Number(data[0].lat),
          lon: Number(data[0].lon),
        });
      } else {
        // aucune ville trouvée → on garde quand même le filtre texte
        setCityCoords(null);
      }
    } catch {
      setCityCoords(null);
    }
  }, 400);

  return () => clearTimeout(timer);
}, [filterCity]);

const filtered = useMemo(() => {
  let results = annonces.filter(
    (a) => a.statut !== "fini"
  );

  // RECHERCHE TEXTE GLOBALE
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    results = results.filter(
      (a) =>
        a.titre.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.lieu.toLowerCase().includes(q)
    );
  }

  // RÉMUNÉRATION MINIMALE
  if (filterMinRate.trim()) {
    const min = Number(filterMinRate);
    results = results.filter((a) => Number(a.remuneration) >= min);
  }

  // STATUT
  if (filterStatus !== "all") {
    results = results.filter((a) => a.statut === filterStatus);
  }

  // 🔥 FILTRE VILLE : GEO + FALLBACK TEXTE
  if (filterCity.trim()) {
    const resolved = resolveCityAlias(filterCity);
    const target = normalizeCity(resolved);


    results = results.filter((a) => {
      const lieuNorm = normalizeCity(a.lieu || "");

      // 1) Toujours permettre le match texte (Louvain-la-Neuve vs louvain la neuve)
      const textMatch = lieuNorm.includes(target);

      // 2) Si pas de coords → on reste sur du texte
      if (!cityCoords || !a.coords) {
        return textMatch;
      }

      // 3) Si coords + ville trouvée → on vérifie aussi le rayon
      const distanceKm = haversineDistance(
        cityCoords.lat,
        cityCoords.lon,
        a.coords.lat,
        a.coords.lon
      );

      return textMatch && distanceKm <= filterRadius;
    });
  }

  // TRI
  if (sortBy === "price-high") {
    results.sort((a, b) => Number(b.remuneration) - Number(a.remuneration));
  } else if (sortBy === "price-low") {
    results.sort((a, b) => Number(a.remuneration) - Number(b.remuneration));
  }
  // 'recent' : déjà trié côté Firestore

  return results;
}, [
  annonces,
  searchQuery,
  filterMinRate,
  filterStatus,
  filterCity,
  cityCoords,
  filterRadius,
  sortBy,
]);

  const activeFiltersCount = [
    filterCity,
    filterMinRate,
    filterStatus !== "all",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setFilterCity("");
    setCityCoords(null);
    setFilterMinRate("");
    setFilterStatus("all");
    setSortBy("recent");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* HEADER ULTRA CLEAN */}
      <section className="px-6 py-12 bg-gradient-to-br from-[#8a6bfe] via-[#9b7ffe] to-[#b89fff] text-white shadow-xl rounded-b-3xl">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
            Annonces
          </h1>
          <p className="opacity-90 mb-8 text-lg">
            Trouve un job étudiant qui te correspond.
          </p>

          {/* Search + Filter */}
          <div className="flex gap-4 flex-col sm:flex-row">

            {/* SEARCH BAR */}
            <div className="relative flex-1 group">
              <input
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/90 text-gray-900 shadow-lg backdrop-blur-sm focus:ring-4 focus:ring-[#8a6bfe]/30 transition-all"
                placeholder="Rechercher une annonce…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a6bfe] group-focus-within:text-[#6a4ff6]"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* FILTER BUTTON */}
            <button
              onClick={() => setShowFilters(true)}
              className="px-6 py-4 bg-white/90 text-[#8a6bfe] rounded-2xl font-semibold shadow-lg hover:bg-white transition flex items-center gap-2"
            >
              <Filter size={20} />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-yellow-400 text-gray-900 rounded-full px-2 py-0.5 text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* DRAWER UX iOS */}
      {showFilters && (
        <div className="fixed inset-0 z-40">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          <div className="absolute right-0 top-0 w-full sm:w-[420px] h-full bg-white p-7 animate-slide shadow-2xl rounded-l-3xl overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#8a6bfe]">
                Filtres
              </h2>
              <button onClick={() => setShowFilters(false)}>
                <X size={22} className="text-gray-500" />
              </button>
            </div>
            {/* CITY */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-gray-800">Ville</label>
              <input
                className="mt-2 w-full px-4 py-3 bg-[#f5e5ff] border border-[#ddc2ff] rounded-xl"
                placeholder="Bruxelles, LLN..."
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Recherche géographique avec rayon circulaire.
              </p>
            </div>

            {/* RADIUS */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-gray-800">Rayon (km)</label>
              <input
                type="range"
                min={2}
                max={50}
                className="w-full mt-3 accent-[#8a6bfe]"
                value={filterRadius}
                onChange={(e) => setFilterRadius(Number(e.target.value))}
              />
              <p className="text-xs text-gray-600 mt-1">{filterRadius} km autour de la ville.</p>
            </div>

            {/* RATE */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-gray-800">Rémunération min.</label>
              <input
                type="number"
                className="w-full mt-2 px-4 py-3 bg-[#f5e5ff] border border-[#ddc2ff] rounded-xl"
                placeholder="Ex: 12€ / h"
                value={filterMinRate}
                onChange={(e) => setFilterMinRate(e.target.value)}
              />
            </div>

            {/* STATUS */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-gray-800">Statut</label>
              <select
                className="w-full mt-2 px-4 py-3 bg-[#f5e5ff] border border-[#ddc2ff] rounded-xl"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as Annonce["statut"] | "all")
                }
              >
                <option value="all">Tous</option>
                <option value="ouverte">Ouvertes</option>
                <option value="en cours">En cours</option>
                <option value="fini">Fini</option>
              </select>
            </div>

            {/* SORT */}
            <div className="mb-12">
              <label className="text-sm font-semibold text-gray-800">Trier par</label>
              <select
                className="w-full mt-2 px-4 py-3 bg-[#f5e5ff] border border-[#ddc2ff] rounded-xl"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="recent">Plus récentes</option>
                <option value="price-high">Prix décroissant</option>
                <option value="price-low">Prix croissant</option>
              </select>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between pt-4">
              <button onClick={resetFilters} className="text-[#8a6bfe] font-semibold">
                Réinitialiser
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-2 bg-[#8a6bfe] text-white rounded-xl shadow"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE LISTE / MAP */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex justify-end">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
              viewMode === "list"
                ? "bg-white shadow text-[#8a6bfe]"
                : "text-gray-600"
            }`}
          >
            <Grid3x3 size={18} /> Liste
          </button>

          <button
            onClick={() => setViewMode("map")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
              viewMode === "map"
                ? "bg-white shadow text-[#8a6bfe]"
                : "text-gray-600"
            }`}
          >
            <MapIcon size={18} /> Carte
          </button>
        </div>
      </div>

      {/* LISTE */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {viewMode === "list" ? (
          filtered.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a, idx) => (
                <Link
                  key={a.id}
                  href={`/jobs/${a.id}`}
                  className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-2xl hover:border-[#8a6bfe]/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >

                  {/* Nouveau badge */}
                  {a.createdAt &&
                    Date.now() -
                      new Date(a.createdAt?.toDate?.() || a.createdAt).getTime() <
                      24 * 60 * 60 * 1000 && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 flex items-center gap-1">
                        <Sparkles size={12} />
                        Nouveau
                      </div>
                    )}
                  <div className="p-6">

                    {/* Statut */}
                    <span
                      className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full mb-3 ${
                        a.statut === "ouverte"
                          ? "bg-green-100 text-green-700"
                          : a.statut === "en cours"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {a.statut === "ouverte" && "🟢"} {a.statut}
                    </span>

                    {/* Titre */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#8a6bfe] transition-colors">
                      {a.titre}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {a.description}
                    </p>

                    {/* Infos */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#8a6bfe]" />
                        {a.lieu || "—"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#8a6bfe]" />
                        {a.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#8a6bfe]" />
                        {a.duree}h
                      </div>
                    </div>

                    {/* Footer prix */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#8a6bfe] text-white rounded-lg">
                          <Euro size={16} />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900">
                            {a.remuneration} €/h
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-gray-400 group-hover:text-[#8a6bfe] group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <AlertCircle size={40} className="mx-auto mb-4 text-[#8a6bfe]" />
              <p>Aucune annonce trouvée…</p>
            </div>
          )
        ) : (
          <div className="h-[600px] bg-white border rounded-2xl shadow overflow-hidden">
            <AnnoncesMap annonces={filtered} />
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-slide {
          animation: slide 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes slide {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
