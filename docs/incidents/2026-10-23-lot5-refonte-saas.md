# Rapport : lot 5, refonte complète « sobre type SaaS » (23/10/2026)

Demande : le site ne faisait pas professionnel (pages incohérentes, identité trop décontractée). Direction retenue : fond blanc, gris neutres, violet du logo comme seul accent, police Inter partout.

## Socle

- `src/app/globals.css` : nouvelle palette (blanc, gris, violet `#7357f6`), plus de citron ni de fond papier. Coins modérés, ombres légères. Les noms de tokens historiques sont conservés, donc toutes les pages suivent automatiquement.
- Police : Inter seule. Bricolage Grotesque est retirée, et les anciennes références pointent vers Inter.
- `src/components/ui/index.tsx` : composants communs `Page`, `PageHeader`, `Section`, `Badge`, `Alert`, `EmptyState`, `Loading`, `Stat`, `Tabs`, `Avatar`.
- Passe automatique sur tout le code : couleurs chaudes écrites en dur remplacées, petits titres en capitales espacées supprimés.
- `src/lib/annonce.ts` : `formatRate` (« 14 €/h » ou « 30 € » selon le type de tarif) et `shortPlace` (commune extraite d'une adresse).
- `src/lib/chat.ts` : `openChat` réutilise une conversation existante au lieu d'en créer une nouvelle.

## Pages reconstruites

Accueil, connexion, inscription, mot de passe oublié, annonces (liste, fiche, création), mon activité, mon profil, notifications, étudiants, profil public, tableau de bord, espace équipe (en-têtes). La messagerie, les pages légales et les pages de contenu ont été harmonisées (couleurs, titres, en-têtes), sans réécriture complète.

## Bugs corrigés pendant la refonte

| # | Gravité | Sujet |
|---|---|---|
| 48 | **Haute** | Mon activité : « Marquer comme terminé » clôturait la mission sans la confirmation de l'autre partie et écrasait `taskCompletion` avec `true` |
| 49 | **Haute** | Mon profil : « Enregistrer » réécrivait tout le document utilisateur (y compris `role`) ; l'activation étudiante s'auto-déclarait `verified` |
| 50 | Moyenne | Profil public : les disponibilités n'apparaissaient jamais (format `slots` non lu) |
| 51 | Moyenne | Étudiants, profil public, fiche annonce : une nouvelle conversation créée à chaque clic sur « Message » (doublons) |
| 52 | Moyenne | Annonces à tarif fixe affichées en « €/h » partout |
| 53 | Moyenne | Notifications : filtre « Annonces » toujours à 0 (types `nouvelle_candidature` / `acceptation` ignorés) |
| 54 | Moyenne | Création d'annonce : adresse non encodée dans la recherche OpenStreetMap ; dates passées acceptées ; « minimum légal 12 €/h » (c'est une règle Woppy) |
| 55 | Basse | Fiche annonce : image vide (`src=""`) pour un candidat sans photo ; statut non rafraîchi après confirmation |
| 56 | Basse | Lieu affiché « 2 » (numéro de rue) au lieu de la commune |
| 57 | Info | Le serveur `next dev` de l'utilisateur (port 3001) a fini par servir un fragment corrompu (`SyntaxError`) après de nombreux rechargements : un redémarrage suffit. Un serveur de contrôle séparé (`woppy-check`, port 3002, dossier `.next-check-dev`) a été ajouté dans `.claude/launch.json`. |

## Tests

| Contrôle | Résultat |
|---|---|
| `npx tsc --noEmit` | OK |
| `npx eslint src` | 162 problèmes (départ : 292) |
| `npm run build` (`.next-check`) | OK |
| Navigateur | Accueil (visiteur), annonces, fiche, création, activité, profil, notifications, messagerie, contact, CGU, avis : rendu vérifié |
| Non vérifié | Les actions qui écrivent en base n'ont pas été déclenchées sur la production (postuler, accepter, confirmer une mission, enregistrer le profil). À tester avec un compte de test. |

## Reste à faire

- Réécriture complète (et non seulement harmonisation) de : contact, suivi de ticket, carrières, à propos, avis, statut, mises à jour, démo, finance.
- Décisions toujours en attente : textes juridiques (vérification, commission), règles Firestore versionnées, clés Firebase Admin.
