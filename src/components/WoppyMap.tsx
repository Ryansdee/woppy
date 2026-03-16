'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🎨 Marqueur Woppy
const woppyMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 45">
  <path fill="#8a6bfe" stroke="#ddc2ff" stroke-width="2"
        d="M16 2C8.3 2 2 8.2 2 16c0 9.6 14 26 14 26s14-16.4 14-26C30 8.2 23.7 2 16 2z"/>
  <circle cx="16" cy="16" r="6" fill="#f5e5ff" />
</svg>
`;

const woppyMarkerIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(woppyMarkerSvg)}`,
  iconSize: [38, 55],
  iconAnchor: [19, 55],
  popupAnchor: [0, -50],
});

export default function WoppyMap({
  position,
  lieu,
}: {
  position: [number, number];
  lieu: string;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 🔄 Nettoyer la carte existante
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    if (mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: position,
        zoom: 14,
        scrollWheelZoom: false,
      });

      // ✅ Fond clair Carto (fonctionne sans clé API)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '© <strong>Woppy</strong>',
        }
      ).addTo(map);

      // 📍 Marqueur Woppy
      L.marker(position, { icon: woppyMarkerIcon })
        .addTo(map)
        .bindPopup(`<b>${lieu}</b><br><small>Lieu de l’annonce</small>`);

      mapRef.current = map;
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [position, lieu]);

  return (
    <div className="mt-6 h-64 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      <div ref={mapContainerRef} className="h-full w-full z-0" />
    </div>
  );
}