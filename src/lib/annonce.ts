/* Affichage du prix d'une annonce : tarif horaire (« 14 €/h ») ou montant fixe (« 30 € ») */
export function formatRate(remuneration: number | string | undefined, rateMode?: string): string {
  const value = Number(remuneration);
  if (!Number.isFinite(value)) return '—';
  const amount = value.toLocaleString('fr-BE', { maximumFractionDigits: 2 });
  return rateMode === 'fixed' ? `${amount} €` : `${amount} €/h`;
}

const STREET = /^(rue|avenue|av\.|chauss[ée]e|place|boulevard|bd|chemin|all[ée]e|square|quai|dr[èe]ve|clos|impasse|route|sentier|rond-point|cour|galerie|r[ée]sidence)\b/i;
const REGION = /^(belgique|belgi[ëe]|belgium|wallonie|flandre|vlaanderen|r[ée]gion|province|hainaut|brabant|li[èe]ge|namur|luxembourg|anvers|limbourg)/i;

/* Commune d'une adresse OpenStreetMap (« 2, Rue de la Station, Soignies, Hainaut, … » → « Soignies ») */
export function shortPlace(lieu: string | undefined): string {
  if (!lieu) return '';
  const parts = lieu.split(',').map((p) => p.trim()).filter(Boolean);
  const city = parts.find((p) => !/^\d+[a-z]?$/i.test(p) && !STREET.test(p) && !REGION.test(p) && !/^\d{4}$/.test(p));
  return city ?? parts[0];
}
