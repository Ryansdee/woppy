'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

const L = typeof window !== 'undefined' ? require('leaflet') : null;

interface Annonce {
  id: string;
  description: string;
  lieu: string;
  remuneration: number;
}

export default function AnnoncesMap({ annonces }: { annonces?: Annonce[] }) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const geocodeCache = useRef<Record<string, [number, number]>>({});

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !L || !containerRef.current || !annonces?.length)
      return;

    setLoading(true);

    // 🧹 Reset du container Leaflet si déjà initialisé
    if ((containerRef.current as any)?._leaflet_id)
      (containerRef.current as any)._leaflet_id = null;

    // 🗺️ Création de la carte
    const map = L.map(containerRef.current, {
      center: [50.85, 4.35], // Bruxelles
      zoom: 8,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // 🗺️ Couche de fond (satellite Stadia)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <strong>WOPPY</strong> · Données © <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    }).addTo(map);

    // 🟣 Icône Woppy (ton logo)
    const woppyIcon = L.icon({
      iconUrl: '/images/logo.png', // ✅ Ton logo dans public/images/logo.png
      iconSize: [42, 42],
      iconAnchor: [21, 58],
      popupAnchor: [0, -50],
      className: 'leaflet-woppy-icon border border-black rounded-full',
    });

    const bounds = L.latLngBounds([]);

    // 📍 Géocodage + ajout des marqueurs
    const fetchPromises = annonces.map(async (a) => {
      if (!a.lieu) return;

      let coords = geocodeCache.current[a.lieu];
      if (!coords) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(a.lieu)}`
          );
          const data = await res.json();
          if (data?.[0]) {
            coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            geocodeCache.current[a.lieu] = coords;
          }
        } catch {
          console.warn('Erreur géocodage pour', a.lieu);
        }
      }

      if (!coords || !mounted.current) return;
      const [lat, lon] = coords;
      bounds.extend(coords);

      // 🧭 Création du marqueur
      const marker = L.marker([lat, lon], { icon: woppyIcon }).addTo(map);

      // 🪄 Popup avec bouton “Voir l’annonce”
      setTimeout(() => {
        if (!mounted.current || !map.hasLayer(marker)) return;

        const popupNode = L.DomUtil.create('div', 'popup-woppy');
        popupNode.innerHTML = `
          <b>${a.description}</b><br/>
          <small>${a.lieu}</small><br/>
          <b style="color:#8a6bfe;">${a.remuneration} €/h</b><br/>
        `;

        const btn = L.DomUtil.create('button', 'popup-btn', popupNode);
        btn.textContent = 'Voir l’annonce →';
        btn.style.cssText =
          'margin-top:6px;background:#8a6bfe;color:white;border:none;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:13px;font-weight:500;';
        btn.onclick = () => {
          if (mounted.current) router.push(`/jobs/${a.id}`);
        };

        const popup = L.popup({ maxWidth: 250 }).setContent(popupNode);
        marker.bindPopup(popup);
      }, 50);
    });

    // ✅ Ajuste la vue une fois les points chargés
    Promise.all(fetchPromises).then(() => {
      if (!mounted.current) return;
      setLoading(false);
      if (bounds.isValid()) {
        try {
          map.flyToBounds(bounds, { padding: [60, 60], duration: 1 });
        } catch {}
      }
    });

    mapRef.current = map;
  }, [annonces, router]);

  return (
    <div className="relative h-[600px] w-full rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-[999]">
          <div className="w-8 h-8 border-4 border-[#8a6bfe] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-[#8a6bfe] font-semibold text-sm">Chargement de la carte...</p>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
