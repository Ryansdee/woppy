"use client";

/**
 * AnnoncesMap — Leaflet map with custom Woppy pins
 *
 * Pin types:
 *  1. WoppyPin (default) — SVG badge with gradient + price label
 *  2. ImagePin           — uses annonce.photos[0] as the pin thumbnail
 *
 * ─── Custom pin with your own image ───────────────────────────────────────
 * Any annonce that has `photos[0]` gets an ImagePin automatically.
 * If you want to use a static asset (logo, icon) instead:
 *
 *   const pin = createImagePin("/images/your-custom-icon.png", label);
 *
 * Pass any URL (Firebase Storage, CDN, local /public/...) — it just becomes
 * the <img> src inside a DivIcon. Size, border-radius, shadow are all CSS.
 * ──────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

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
  photos?: string[];
}

interface Props {
  annonces: Annonce[];
}

// ─────────────────────────────────────────────
// SVG Woppy Pin (no photo)
// ─────────────────────────────────────────────
function createWoppyPin(price: string, statut: string) {
  const colors: Record<string, { from: string; to: string }> = {
    ouverte: { from: "#8a6bfe", to: "#b89fff" },
    "en cours": { from: "#f59e0b", to: "#fcd34d" },
    fini: { from: "#9ca3af", to: "#d1d5db" },
  };
  const { from, to } = colors[statut] || colors["ouverte"];

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="72" viewBox="0 0 64 72">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${from}" flood-opacity="0.35"/>
      </filter>
    </defs>
    <!-- Pin body -->
    <path
      d="M32 2 C18 2 8 12 8 26 C8 42 32 62 32 62 C32 62 56 42 56 26 C56 12 46 2 32 2 Z"
      fill="url(#g)"
      filter="url(#shadow)"
    />
    <!-- Inner circle (white) -->
    <circle cx="32" cy="26" r="16" fill="white" opacity="0.95"/>
    <!-- W letterform -->
    <text
      x="32" y="31"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="13"
      font-weight="900"
      fill="${from}"
      text-anchor="middle"
      dominant-baseline="middle"
      letter-spacing="-0.5"
    >W</text>
    <!-- Price label pill -->
    <rect x="8" y="56" width="48" height="16" rx="8" fill="${from}" opacity="0.95"/>
    <text
      x="32" y="64"
      font-family="system-ui, sans-serif"
      font-size="9"
      font-weight="700"
      fill="white"
      text-anchor="middle"
      dominant-baseline="middle"
    >${price}€/h</text>
  </svg>`;

  return svg;
}

// ─────────────────────────────────────────────
// Image Pin (with annonce photo or custom URL)
// ─────────────────────────────────────────────
function createImagePin(imageUrl: string, price: string) {
  // Escape the URL for safe inline use
  const safe = imageUrl.replace(/"/g, "&quot;");

  return `
  <div style="
    position: relative;
    width: 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    filter: drop-shadow(0 4px 8px rgba(138,107,254,0.4));
  ">
    <!-- Photo circle -->
    <div style="
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 3px solid #8a6bfe;
      overflow: hidden;
      background: #f0eaff;
      box-shadow: 0 2px 12px rgba(138,107,254,0.35);
    ">
      <img
        src="${safe}"
        style="width:100%;height:100%;object-fit:cover;"
        onerror="this.style.display='none'"
      />
    </div>
    <!-- Pointer triangle -->
    <div style="
      width: 0; height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 10px solid #8a6bfe;
      margin-top: -2px;
    "></div>
    <!-- Price pill -->
    <div style="
      position: absolute;
      bottom: -4px;
      background: #8a6bfe;
      color: white;
      font-size: 9px;
      font-weight: 700;
      font-family: system-ui, sans-serif;
      padding: 2px 6px;
      border-radius: 20px;
      white-space: nowrap;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    ">${price}€/h</div>
  </div>`;
}

// ─────────────────────────────────────────────
// Popup content
// ─────────────────────────────────────────────
function createPopupHTML(a: Annonce): string {
  const statusColor = a.statut === "ouverte" ? "#10b981" : a.statut === "en cours" ? "#f59e0b" : "#9ca3af";
  return `
  <div style="font-family: system-ui, sans-serif; min-width: 200px; max-width: 240px;">
    ${a.photos?.[0] ? `
      <div style="margin: -12px -12px 10px; height: 100px; overflow: hidden; border-radius: 10px 10px 0 0;">
        <img src="${a.photos[0]}" style="width:100%;height:100%;object-fit:cover;" />
      </div>
    ` : ""}
    <div style="padding: 0 2px;">
      <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
        <span style="width:7px;height:7px;border-radius:50%;background:${statusColor};display:inline-block;flex-shrink:0;"></span>
        <span style="font-size:10px;font-weight:700;color:${statusColor};text-transform:uppercase;letter-spacing:0.5px;">${a.statut}</span>
      </div>
      <h3 style="font-size:13px;font-weight:800;color:#1f2937;margin:0 0 4px;line-height:1.3;">${a.titre}</h3>
      <p style="font-size:11px;color:#6b7280;margin:0 0 8px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${a.description}</p>
      <div style="display:flex;gap:10px;font-size:10px;color:#9ca3af;margin-bottom:8px;">
        <span>📍 ${a.lieu || "—"}</span>
        <span>⏱ ${a.duree}h</span>
        <span>📅 ${a.date}</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid #f3f4f6;">
        <span style="font-size:18px;font-weight:900;color:#1f2937;">${a.remuneration}<span style="font-size:11px;font-weight:500;color:#9ca3af;">€/h</span></span>
        <a
          href="/jobs/${a.id}"
          style="
            background: linear-gradient(135deg,#8a6bfe,#b89fff);
            color:white;
            font-size:11px;
            font-weight:700;
            padding:5px 12px;
            border-radius:20px;
            text-decoration:none;
            display:inline-block;
          "
        >Voir →</a>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// MAP COMPONENT
// ─────────────────────────────────────────────
export default function AnnoncesMap({ annonces }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Init map once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapRef.current) return;
    if (!containerRef.current) return;

    import("leaflet").then((L) => {
      // Fix default icon path for Next.js
      (L.Icon.Default as any).mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [50.5039, 4.4699], // Belgium center
        zoom: 8,
        zoomControl: false,
      });

      // Tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom zoom control position
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
      setReady(true);
    });
  }, []);

  // Update markers when annonces change
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    import("leaflet").then((L) => {
      const map = mapRef.current!;

      // Clear existing markers
      map.eachLayer((layer) => {
        if ((layer as any)._woppyMarker) map.removeLayer(layer);
      });

      const validAnnonces = annonces.filter((a) => a.coords);
      if (validAnnonces.length === 0) return;

      const bounds: [number, number][] = [];

      validAnnonces.forEach((a) => {
        const { lat, lon } = a.coords!;
        bounds.push([lat, lon]);

        const hasPhoto = a.photos && a.photos.length > 0;
        const priceLabel = String(a.remuneration);

        // ── Choose pin type ──────────────────────────
        // Option A: Image pin (if annonce has a photo)
        // Option B: Woppy SVG pin (default)
        //
        // To use a custom static image for ALL pins:
        //   const html = createImagePin("/images/woppy-logo.png", priceLabel);
        // ─────────────────────────────────────────────

        let icon: L.DivIcon | L.Icon;

        if (hasPhoto) {
          // Image pin — uses annonce photo
          icon = L.divIcon({
            html: createImagePin(a.photos![0], priceLabel),
            className: "", // Remove Leaflet default styles
            iconSize: [56, 72],
            iconAnchor: [28, 66],
            popupAnchor: [0, -68],
          });
        } else {
          // Woppy SVG pin
          icon = L.divIcon({
            html: createWoppyPin(priceLabel, a.statut),
            className: "",
            iconSize: [64, 72],
            iconAnchor: [32, 68],
            popupAnchor: [0, -70],
          });
        }

        const marker = L.marker([lat, lon], { icon })
          .bindPopup(createPopupHTML(a), {
            maxWidth: 260,
            className: "woppy-popup",
          });

        // Tag marker so we can clear it later
        (marker as any)._woppyMarker = true;
        marker.addTo(map);
      });

      // Fit map to markers
      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    });
  }, [ready, annonces]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* Map container */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Legend */}
      <div style={{
        position: "absolute",
        bottom: 48,
        left: 12,
        zIndex: 1000,
        background: "white",
        borderRadius: 16,
        padding: "10px 14px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        fontSize: 11,
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        border: "1px solid #f3f4f6",
      }}>
        <div style={{ fontWeight: 700, color: "#374151", marginBottom: 2 }}>Statut</div>
        {[
          { color: "#8a6bfe", label: "Ouverte" },
          { color: "#f59e0b", label: "En cours" },
          { color: "#9ca3af", label: "Terminée" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
            <span style={{ color: "#6b7280" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Popup styles */}
      <style>{`
        .woppy-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(138,107,254,0.18), 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid rgba(138,107,254,0.12);
        }
        .woppy-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1;
        }
        .woppy-popup .leaflet-popup-tip {
          background: white;
        }
        .woppy-popup .leaflet-popup-close-button {
          top: 8px;
          right: 8px;
          color: #9ca3af;
          font-size: 16px;
          width: 20px;
          height: 20px;
          line-height: 18px;
          border-radius: 50%;
        }
        .woppy-popup .leaflet-popup-close-button:hover {
          color: #8a6bfe;
          background: #f0eaff;
        }
        .leaflet-container {
          font-family: system-ui, sans-serif;
        }
      `}</style>
    </div>
  );
}