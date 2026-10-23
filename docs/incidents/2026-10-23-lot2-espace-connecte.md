# Rapport : lot 2, espace connecté et carte des annonces (23/10/2026)

Pages touchées : dashboard, mon activité, profil, messagerie, notifications, étudiants, profil public, candidatures, avis, carte `/jobs`. Les barres collantes de contact, statut et mises à jour ont aussi été décalées sous la Navbar.

## Tests

| Contrôle | Résultat |
|---|---|
| `npx tsc --noEmit` | OK |
| `npx eslint src` | 255 problèmes (lot 1 : 264, départ : 292) |
| `npm run build` (dans `.next-check`) | OK. Avertissement déjà présent : `topLevelAwait` dans `src/lib/firebase.ts`. |
| Navigateur, connecté | `/jobs` (liste, recherche `?q=`, carte), `/jobs/create`, dashboard (vue admin), activité, profil, messagerie (conversation ouverte), notifications, étudiants, redirection de `/mes-candidatures` : OK |
| Non vérifié | Les marqueurs sur la carte : il n'y a aucune annonce ouverte avec des coordonnées en base. `/profile/[uid]` et `/review/[userId]` : seules les couleurs ont changé. |

## Incidents

| # | Gravité | Sujet | État |
|---|---|---|---|
| 16 | **Haute** | Carte `/jobs` : plantage « Map container is already initialized » | Corrigé |
| 17 | **Haute** | Carte `/jobs` : fond de carte CARTO bloqué (« API KEY REQUIRED ») | Corrigé |
| 18 | **Haute** | Carte `/jobs` : faille XSS via le titre, la description, le lieu ou la photo d'une annonce | Corrigé |
| 19 | Moyenne | `/mes-candidatures` : chargement infini (`permission-denied`) | Corrigé |
| 20 | Moyenne | Dashboard : statistiques de la plateforme montrées à tous, avec de fausses mentions « Stripe · vérification manuelle · Opérationnel » | Corrigé |
| 21 | Moyenne | Barres de titre `sticky top-0` qui passent sous la Navbar | Corrigé |
| 22 | Basse | Messagerie : badge « 0 » affiché sur les conversations lues | Corrigé |
| 23 | Basse | Messagerie : pied de page affiché sous un écran plein | Corrigé |
| 24 | Basse | `WoppyMap` : attribution OpenStreetMap absente (licence), popup non échappé | Corrigé (composant inutilisé) |
| 25 | Info | `npm run build` lancé pendant `next dev` corrompt les manifestes du serveur de dev (erreurs 500) | Contourné |

### 16. Crash de la carte
`AnnoncesMap` créait la carte Leaflet après un `import()` asynchrone, sans nettoyage. En mode strict, React monte l'effet deux fois, donc deux `L.map()` sur le même conteneur. Le crash se produisait aussi en repassant de la liste à la carte.
**Correction** : drapeau `cancelled` et `map.remove()` au démontage. Les marqueurs sont dans un `LayerGroup` vidé à chaque mise à jour.

### 17. Fond de carte
CARTO (`basemaps.cartocdn.com`) exige maintenant une clé API. Les deux cartes passent sur les tuiles OpenStreetMap, avec l'attribution obligatoire, via `src/lib/mapTiles.ts`.
À surveiller : la politique d'usage d'OSM interdit le trafic massif. Si Woppy grossit, il faudra un fournisseur avec clé (MapTiler, Stadia, CARTO payant). Il suffira de changer `mapTiles.ts`.

### 18. XSS sur la carte
`createPopupHTML` et `createImagePin` inséraient `titre`, `description`, `lieu`, `date` et `photos[0]` dans du HTML brut. Un titre d'annonce contenant `<img src=x onerror=…>` s'exécutait chez tout utilisateur ouvrant la carte.
**Correction** : tous les champs passent par `esc()`, les URL de photo doivent être en `https:`, et l'id est encodé dans le lien.

### 19. `/mes-candidatures`
La page filtrait sur `userId`, alors que les candidatures ont un champ `candidatId` : la règle Firestore refusait la requête et l'écran restait sur « Chargement… ». La page n'était liée nulle part et faisait doublon avec l'onglet « Mes jobs » de `/dashboard/activity`. Elle redirige maintenant vers cet onglet.

### 25. Build et serveur de dev
`next.config.ts` accepte `NEXT_DIST_DIR`. Un build de contrôle se lance avec `NEXT_DIST_DIR=.next-check npm run build` (dossier ignoré par git). Next ajoute alors `.next-check` dans `tsconfig.json` : il faut annuler ce changement après.

## Changements de design
- Le dashboard est réécrit : actions, « Mon espace », et une section « Équipe Woppy » réservée aux rôles admin et collaborateur.
- Les autres pages ont été passées aux tokens de la nouvelle identité : classes Tailwind et couleurs hex dans les styles inline.
- La carte utilise des pastilles de prix (encre pour « ouverte », citron pour « en cours ») et des popups au style du site.
