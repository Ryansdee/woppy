"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { formatRate, shortPlace } from "@/lib/annonce";
import { Badge, EmptyState, Loading, Page, PageHeader, Tabs } from "@/components/ui";
import cityMapJson from "../../../public/data/city-abbreviations.json";
const cityMap: Record<string, string> = cityMapJson;

import {
  Search, Map as MapIcon, LayoutGrid, X, Plus,
  MapPin, Calendar, SlidersHorizontal, Briefcase, ArrowUpRight,
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
  rateMode?: string;
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
  ouverte:    { label: "Ouverte",  tone: "success" },
  "en cours": { label: "En cours", tone: "warning" },
  fini:       { label: "Terminée", tone: "neutral" },
} as const;


export default function AnnoncesPage() {
  return (
    <Suspense>
      <AnnoncesContent />
    </Suspense>
  );
}

function AnnoncesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [annonces, setAnnonces]     = useState<Annonce[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
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

  if (loading) return <Loading full />;

  const filters = (
    <div className="space-y-5">
      <div>
        <label htmlFor="f-city" className="label">Ville</label>
        <input id="f-city" className="input" placeholder="Bruxelles, Wavre…" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="f-radius" className="label">Rayon</label>
          <span className="text-xs text-muted">{filterRadius} km</span>
        </div>
        <input id="f-radius" type="range" min={2} max={50} className="w-full accent-brand" value={filterRadius} onChange={(e) => setFilterRadius(Number(e.target.value))} />
      </div>
      <div>
        <label htmlFor="f-rate" className="label">Rémunération minimum</label>
        <div className="relative">
          <input id="f-rate" type="number" min={0} className="input pr-12" placeholder="12" value={filterMinRate} onChange={(e) => setFilterMinRate(e.target.value)} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">€/h</span>
        </div>
      </div>
      <div>
        <span className="label">Statut</span>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { value: "all", label: "Tous" },
            { value: "ouverte", label: "Ouverte" },
            { value: "en cours", label: "En cours" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              aria-pressed={filterStatus === opt.value}
              className={`btn btn-sm ${filterStatus === opt.value ? "btn-dark" : "btn-outline"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {activeFiltersCount > 0 && (
        <button onClick={resetFilters} className="btn btn-ghost btn-sm w-full">Réinitialiser les filtres</button>
      )}
    </div>
  );

  return (
    <Page>
      <PageHeader
        title="Annonces"
        description={`${filtered.length} mission${filtered.length !== 1 ? "s" : ""} disponible${filtered.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/jobs/create" className="btn btn-primary">
            <Plus size={16} /> Publier une annonce
          </Link>
        }
      />

      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[200px] flex-1">
          <span className="sr-only">Rechercher</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9 pr-9" placeholder="Titre, ville, mission…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} aria-label="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
              <X size={15} />
            </button>
          )}
        </label>
        <label className="sr-only" htmlFor="sort">Trier</label>
        <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="input w-auto">
          <option value="recent">Plus récentes</option>
          <option value="price-high">Prix décroissant</option>
          <option value="price-low">Prix croissant</option>
        </select>
        <button onClick={() => setShowFilters((s) => !s)} className="btn btn-outline lg:hidden" aria-expanded={showFilters}>
          <SlidersHorizontal size={15} /> Filtres{activeFiltersCount > 0 && ` (${activeFiltersCount})`}
        </button>
        <Tabs
          value={viewMode}
          onChange={setViewMode}
          items={[
            { value: "list", label: "Liste", icon: LayoutGrid },
            { value: "map", label: "Carte", icon: MapIcon },
          ]}
        />
      </div>

      {showFilters && <div className="card mt-3 p-5 lg:hidden">{filters}</div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-24 p-5">
            <p className="mb-4 text-sm font-semibold">Filtres</p>
            {filters}
          </div>
        </aside>

        <div className="min-w-0">
          {viewMode === "map" ? (
            <div className="card overflow-hidden" style={{ height: "calc(100vh - 260px)", minHeight: 480 }}>
              <AnnoncesMap annonces={filtered} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Briefcase}
                title="Aucune annonce trouvée"
                description="Modifiez votre recherche ou vos filtres."
                action={activeFiltersCount > 0 || searchQuery ? (
                  <button onClick={() => { resetFilters(); setSearchQuery(""); }} className="btn btn-outline">Tout réinitialiser</button>
                ) : (
                  <Link href="/jobs/create" className="btn btn-primary">Publier une annonce</Link>
                )}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((a) => {
                const cfg = STATUS[a.statut] || STATUS.ouverte;
                return (
                  <Link key={a.id} href={`/jobs/${a.id}`} className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
                    {a.photos?.length > 0 && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.photos[0]} alt="" className="h-36 w-full object-cover" />
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-center gap-2">
                        <Badge tone={cfg.tone} dot>{cfg.label}</Badge>
                        {isNew(a) && <Badge tone="brand">Nouveau</Badge>}
                      </div>
                      <h3 className="mt-3 line-clamp-1 font-semibold group-hover:text-brand">{a.titre}</h3>
                      <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{a.description}</p>
                      <div className="mt-4 space-y-1 text-sm text-muted">
                        <p className="flex items-center gap-1.5"><MapPin size={14} className="shrink-0" /><span className="truncate">{shortPlace(a.lieu) || "—"}</span></p>
                        <p className="flex items-center gap-1.5"><Calendar size={14} className="shrink-0" />{a.date || "—"}{a.duree ? ` · ${a.duree} h` : ""}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                        <span className="text-lg font-semibold">{formatRate(a.remuneration, a.rateMode)}</span>
                        <ArrowUpRight size={16} className="text-muted group-hover:text-brand" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
