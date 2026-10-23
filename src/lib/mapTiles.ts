/* Fond de carte OpenStreetMap : gratuit, sans clé, attribution obligatoire.
   (CARTO demande maintenant une clé API et affiche « API KEY REQUIRED » sinon.) */
export const MAP_TILES_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_TILES_OPTIONS = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
};
