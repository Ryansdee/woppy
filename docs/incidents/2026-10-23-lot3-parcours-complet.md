# Rapport : lot 3, parcours complet du site (23/10/2026)

Parcours de toutes les pages, connecté en admin, sur ordinateur et en largeur mobile (375 px) pour les pages principales. La nouvelle identité est maintenant appliquée partout : il ne reste aucune classe `violet-*`, `slate-*`, `stone-*` ni police Sora dans `src/`.

## Tests

| Contrôle | Résultat |
|---|---|
| `npx tsc --noEmit` | OK |
| `npx eslint src` | 252 problèmes (départ : 292) |
| `npm run build` (dans `.next-check`) | OK |
| Navigateur, ordinateur | Accueil, annonces (liste, carte avec marqueur et popup, fiche), création, dashboard, activité, profil, messagerie, notifications, étudiants, à propos, carrières et fiche d'offre, contact, statut, mises à jour, CGU, confidentialité, cookies, démo, support, espace collaborateur, tickets support, récapitulatif, finance, enquête de marché, postes internes |
| Navigateur, mobile 375 px | Dashboard, annonces : pas de défilement horizontal (393/393) |
| Non vérifié | `/contact/support/[id]`, `/dashboard/applications/[id]`, `reportsResolved` : seules les couleurs ont changé |

## Incidents

| # | Gravité | Sujet | État |
|---|---|---|---|
| 26 | **Haute** | CGU et politique de confidentialité : elles décrivent une vérification de la carte étudiante qui n'existe pas | **Ouvert : à décider** |
| 27 | **Haute** | CGU : « jusqu'à 93 % reversé à l'étudiant » (donc une commission) contredit « aucune commission » (CGU art. 125 et À propos) | **Ouvert : à décider** |
| 28 | Moyenne | Récapitulatif : « Commission Woppy (10 %) » inventée | Corrigé (0 €) |
| 29 | Moyenne | Récapitulatif : zéros affichés sans explication quand l'API admin échoue | Corrigé (message d'erreur) |
| 30 | Moyenne | Finance : chargement infini (session pas encore restaurée) et filtre sur `userId` au lieu de `candidatId` | Corrigé |
| 31 | Moyenne | À propos : « Profils étudiants vérifiés manuellement » | Corrigé (passé dans « En préparation ») |
| 32 | Moyenne | CGU, confidentialité, cookies : barre fixe propre qui recouvre la Navbar | Corrigé |
| 33 | Basse | Contact, statut, mises à jour : deuxième barre avec logo sous la Navbar | Corrigé |
| 34 | Basse | Enquête de marché : thème sombre devenu illisible après le changement de couleurs | Corrigé (thème clair) |
| 35 | Basse | Carte : popup trop étroite, molette qui bloque le défilement de la page | Corrigé |
| 36 | Basse | Finance : « net » estimé à 85 % du brut, chiffre sans base | Ouvert (affiché comme estimation) |
| 2 | Haute | `/admin/fix-chats` toujours en ligne (voir l'audit) | Ouvert |

### 26 et 27. Textes juridiques
Je n'ai pas modifié les CGU ni la politique de confidentialité, car ce sont des engagements juridiques :
- `src/app/terms/page.tsx:72` : « Chaque carte est vérifiée… ».
- `src/app/privacy/page.tsx:48` et `:70` : « carte d'identité étudiante transmise pour vérification manuelle ».
- `src/app/terms/page.tsx:29` et `:252` : tableau 14 €/h facturé contre 13 €/h perçu, « ≈ 93 % reversé », alors que la ligne 125 dit « ne prélève actuellement aucune commission ».

Il faut soit construire la vérification et la commission, soit corriger ces textes. Dans les deux cas, ça demande ta décision et idéalement une relecture juridique.

### 30. Finance
`auth.currentUser` vaut `null` au premier rendu : l'effet sortait sans jamais retirer le chargement. La page attend maintenant `onAuthStateChanged`. Le filtre utilise `candidatId`, le champ réellement écrit à la candidature (`jobs/[id]/page.tsx:406`).
Remarque : la page cherche `statut == "acceptée"`, alors que le reste du code utilise aussi `"acceptee"`. Il faudrait unifier ces valeurs.

### 29. Récapitulatif en local
La route `/api/admin/analytics` a besoin de `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` et `FIREBASE_ADMIN_PRIVATE_KEY`, absentes du `.env.local`. En production (Netlify), elles doivent être définies dans les variables du site.
