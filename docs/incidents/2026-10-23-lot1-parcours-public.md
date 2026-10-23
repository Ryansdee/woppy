# Rapport : lot 1, refonte du parcours public (23/10/2026)

Pages touchées : layout, Navbar, Footer, accueil, connexion, inscription, mot de passe oublié (nouvelle), annonces, détail d'annonce, création d'annonce.

## Tests

| Contrôle | Résultat |
|---|---|
| `npx tsc --noEmit` | OK |
| `npx eslint src` | 264 problèmes (avant : 292). Aucun nouveau dans les fichiers réécrits, il reste ceux de `RegisterForm` (`any`). |
| `npm run build` | OK, 39 pages. Avertissement déjà présent : `topLevelAwait` dans `src/lib/firebase.ts`. |
| Navigateur (localhost:3001) | Accueil, connexion, inscription, mot de passe oublié : rendu OK, données réelles chargées. |
| Non vérifié à l'écran | `/jobs`, `/jobs/[id]`, `/jobs/create` : il faut être connecté. Seules les couleurs y ont changé (remplacement automatique). |

## Incidents trouvés pendant le lot

| # | Gravité | Sujet | État |
|---|---|---|---|
| 9 | **Haute** | La « vérification manuelle » des étudiants n'existe pas dans les faits | Ouvert |
| 10 | Haute | Données inventées affichées comme réelles (accueil, connexion) | Corrigé |
| 11 | Moyenne | Lien « Mot de passe oublié » vers une page inexistante | Corrigé |
| 12 | Moyenne | Double barre de navigation sur l'accueil et les pages d'auth | Corrigé |
| 13 | Basse | Erreur de connexion générique avec Firebase récent | Corrigé |
| 14 | Basse | Liens morts du pied de page (`#`, `/#features`) | Corrigé |
| 15 | Basse | `?role=` passé à l'inscription mais jamais lu | Ouvert |

### 9. Vérification des étudiants
Le site annonçait partout des « étudiants vérifiés manuellement ». En réalité :
- `src/app/dashboard/profile/page.tsx:157` : `activateStudentAccount` écrit `verificationStatus: 'verified'` lui-même, côté client, en un clic.
- `src/components/auth/RegisterForm.tsx:444` : l'inscription étudiante met `hasStudentProfile: true` sans aucun statut de vérification.
- La page collaborateur liste les profils `pending`, mais aucun parcours ne met un profil dans cet état.
- Postuler (`jobs/[id]`) ne demande que `hasStudentProfile`.

**Fait** : toutes les mentions de vérification ont été retirées des pages publiques.
**À décider** : soit on construit la vraie vérification (envoi de la carte étudiante, statut `pending`, validation par un collaborateur, règle Firestore qui interdit au client d'écrire `verified`), soit on abandonne la promesse.

### 10. Fausses données
Retiré : « 142 missions disponibles », « 1 200+ utilisateurs », « 210+ jobs réalisés », note « 4.8/5 » codée en dur, « 200+ avis vérifiés », faux témoignage « Lucas M. », catégories avec compteurs fictifs, annonces d'exemple, « les paiements transitent par Stripe » (Stripe n'est pas branché), « gagne jusqu'à 18€/h », « trouvez quelqu'un en 2h ».
L'accueil affiche maintenant les 3 dernières annonces ouvertes, les vrais avis et une note moyenne calculée. Le bandeau de chiffres ne s'affiche qu'à partir de 50 membres (`MIN_USERS_FOR_STATS` dans `src/app/page.tsx`).

### 11. Mot de passe oublié
Nouvelle page `src/app/auth/forgot-password/page.tsx` avec `sendPasswordResetEmail`. Elle affiche le même message que le compte existe ou non.

### 13. Messages d'erreur de connexion
Firebase renvoie maintenant `auth/invalid-credential` au lieu de `user-not-found` / `wrong-password` : l'utilisateur voyait « Une erreur est survenue ». Le cas est géré, ainsi que `too-many-requests` et `network-request-failed`.

## Changements de design
- Tokens dans `src/app/globals.css` (`@theme`) : `paper`, `ink`, `muted`, `line`, `brand` (violet du logo), `lime`.
- Classes partagées : `btn`, `btn-primary`, `btn-brand`, `btn-outline`, `btn-ghost`, `card`, `chip`, `input`, `label`, `eyebrow`, `display`, `container-w`.
- Polices : Bricolage Grotesque (titres) et Inter (texte), chargées par `next/font`. Sora et Geist ont été retirées.
- `src/components/auth/AuthShell.tsx` : mise en page commune aux pages d'authentification.
