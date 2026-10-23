"use client";

/**
 * AnnoncesMap — carte Leaflet des annonces géolocalisées.
 * Chaque annonce avec `coords` devient une pastille de prix ; un clic ouvre un aperçu.
 */

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_TILES_URL, MAP_TILES_OPTIONS } from "@/lib/mapTiles";
import { formatRate } from "@/lib/annonce";

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
  photos?: string[];
}

interface Props {
  annonces: Annonce[];
}

const BELGIUM_CENTER: [number, number] = [50.5039, 4.4699];

const STATUS = {
  ouverte: { label: "Ouverte", bg: "#7357f6", fg: "#ffffff" },
  "en cours": { label: "En cours", bg: "#fef3c7", fg: "#92400e" },
  fini: { label: "Terminée", bg: "#f6f6f8", fg: "#6b6b78" },
} as const;

/* Les champs viennent des utilisateurs : tout est échappé avant d'entrer dans le HTML */
function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function pinHTML(a: Annonce): string {
  const s = STATUS[a.statut] ?? STATUS.ouverte;
  return `<div class="woppy-pin" style="background:${s.bg};color:${s.fg}">${esc(formatRate(a.remuneration, a.rateMode)).replace(" ", "&nbsp;")}</div>`;
}

function popupHTML(a: Annonce): string {
  const s = STATUS[a.statut] ?? STATUS.ouverte;
  const photo = safeUrl(a.photos?.[0]);
  return `
  <div class="woppy-pop">
    ${photo ? `<img class="woppy-pop-img" src="${esc(photo)}" alt="" />` : ""}
    <div class="woppy-pop-body">
      <span class="woppy-pop-status" style="background:${s.bg};color:${s.fg}">${s.label}</span>
      <h3>${esc(a.titre)}</h3>
      <p class="woppy-pop-desc">${esc(a.description)}</p>
      <p class="woppy-pop-meta">${esc(a.lieu || "—")}${a.duree ? ` · ${esc(a.duree)} h` : ""}${a.date ? ` · ${esc(a.date)}` : ""}</p>
      <div class="woppy-pop-foot">
        <strong>${esc(formatRate(a.remuneration, a.rateMode))}</strong>
        <a href="/jobs/${encodeURIComponent(a.id)}">Voir l’annonce</a>
      </div>
    </div>
  </div>`;
}

export default function AnnoncesMap({ annonces }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  /* Création de la carte, et destruction au démontage (évite « Map container is already initialized ») */
  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      // Molette désactivée : sinon la carte, presque plein écran, bloque le défilement de la page
      const map = L.map(containerRef.current, {
        center: BELGIUM_CENTER,
        zoom: 8,
        zoomControl: false,
        scrollWheelZoom: false,
      });
      L.tileLayer(MAP_TILES_URL, MAP_TILES_OPTIONS).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      setReady(false);
    };
  }, []);

  /* Marqueurs */
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      const layer = layerRef.current;
      if (cancelled || !map || !layer) return;

      layer.clearLayers();
      const located = annonces.filter((a) => a.coords && Number.isFinite(a.coords.lat) && Number.isFinite(a.coords.lon));
      if (located.length === 0) {
        map.setView(BELGIUM_CENTER, 8);
        return;
      }

      const bounds = located.map((a) => [a.coords!.lat, a.coords!.lon] as [number, number]);
      located.forEach((a, i) => {
        L.marker(bounds[i], {
          icon: L.divIcon({ html: pinHTML(a), className: "woppy-pin-wrap", iconSize: undefined, iconAnchor: [0, 0] }),
          riseOnHover: true,
        })
          .bindPopup(popupHTML(a), { maxWidth: 260, minWidth: 220, className: "woppy-popup" })
          .addTo(layer);
      });

      if (bounds.length === 1) map.setView(bounds[0], 13);
      else map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    });

    return () => {
      cancelled = true;
    };
  }, [ready, annonces]);

  const locatedCount = annonces.filter((a) => a.coords).length;

  return (
    <div className="relative isolate h-full w-full">
      <div ref={containerRef} className="h-full w-full bg-paper-2" />

      {ready && locatedCount === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-[1000] flex justify-center px-4">
          <p className="card px-4 py-2 text-sm text-ink-2 shadow-sm">Aucune annonce localisée pour ces filtres.</p>
        </div>
      )}

      {ready && locatedCount > 0 && locatedCount < annonces.length && (
        <div className="pointer-events-none absolute left-3 top-3 z-[1000]">
          <p className="card px-3 py-1.5 text-xs text-muted shadow-sm">
            {locatedCount} sur {annonces.length} annonces ont une adresse sur la carte
          </p>
        </div>
      )}

      <style>{`
        .woppy-pin-wrap { background: none; border: 0; }
        .woppy-pin {
          transform: translate(-50%, -100%);
          width: max-content;
          padding: 5px 10px;
          border-radius: 999px;
          font: 700 12px/1 var(--font-inter), system-ui, sans-serif;
          box-shadow: 0 4px 14px rgba(17,17,24,.18);
          border: 2px solid #fff;
          cursor: pointer;
          transition: transform .12s;
        }
        .woppy-pin:hover { transform: translate(-50%, -100%) scale(1.08); }
        .woppy-popup .leaflet-popup-content-wrapper {
          border-radius: 18px; padding: 0; overflow: hidden;
          box-shadow: 0 12px 36px rgba(17,17,24,.14); border: 1px solid #e6e6eb;
        }
        .woppy-popup .leaflet-popup-content { margin: 0; width: 250px !important; }
        .woppy-popup .leaflet-popup-tip { box-shadow: none; }
        .woppy-popup a.leaflet-popup-close-button { top: 8px; right: 8px; color: #6b6b78; }
        .woppy-pop { font: 400 13px/1.4 var(--font-inter), system-ui, sans-serif; color: #111118; }
        .woppy-pop-img { display: block; width: 100%; height: 110px; object-fit: cover; }
        .woppy-pop-body { padding: 14px; }
        .woppy-pop-status { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
        .woppy-pop h3 { margin: 8px 0 4px; font: 700 15px/1.25 var(--font-bricolage), system-ui, sans-serif; letter-spacing: -.01em; }
        .woppy-pop-desc { margin: 0 0 6px; color: #3d3d48; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .woppy-pop-meta { margin: 0; font-size: 12px; color: #6b6b78; }
        .woppy-pop-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e6e6eb; }
        .woppy-pop-foot strong { font-size: 16px; white-space: nowrap; }
        .woppy-pop-foot a { white-space: nowrap; background: #7357f6; color: #ffffff !important; padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 12px; text-decoration: none; }
        .leaflet-container { font-family: var(--font-inter), system-ui, sans-serif; }
      `}</style>
    </div>
  );
}
