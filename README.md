# Woppy

Plateforme belge qui met en relation des étudiants cherchant des petits jobs flexibles avec des particuliers et des entreprises qui ont besoin d'un coup de main ponctuel.

Site : https://woppy.be · Contact : contact@woppy.be

---

## Ce que fait l'application

**Étudiants**
- Inscription, mot de passe oublié, profil public (`/profile/[uid]`)
- Parcourir les annonces, en liste ou sur une carte (`/jobs`)
- Postuler et suivre ses candidatures (`/mes-candidatures`, `/dashboard/applications`)
- Messagerie en temps réel avec l'employeur (`/messages`)
- Laisser et recevoir des avis (`/review/[userId]`, `/reviews`)

**Employeurs**
- Publier une annonce (`/jobs/create`)
- Gérer les candidatures, accepter un étudiant, clôturer la mission
- Parcourir les profils étudiants (`/students`)

**Équipe Woppy (rôles `admin` / `collaborator`)**
- Tableau de bord collaborateur et signalements (`/dashboard/collaborateur`)
- Support client avec tickets (`/contact/admin`, `/contact/support/[id]`)
- Statistiques et finances (`/dashboard/recap`, `/dashboard/finance`)
- Offres d'emploi Woppy (`/careers`, `/dashboard/jobs-career`)

**Pages publiques** : accueil, démo, à propos, statut du service (`/status`), journal des mises à jour (`/updates`, alimenté par l'historique GitHub), CGU, confidentialité, cookies.

Au total : 38 pages et 3 routes API.

## Stack

| Partie | Outils |
|---|---|
| Front | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide |
| Cartes et graphiques | Leaflet / React Leaflet, Recharts, React Big Calendar |
| Backend | Firebase : Auth, Firestore, Storage, Cloud Messaging |
| Serveur | 3 routes API Next.js (`src/app/api`) avec Firebase Admin, Cloud Functions (`functions/`) pour les notifications push |
| PWA | next-pwa |
| Hébergement | Netlify (`@netlify/plugin-nextjs`) |

Stripe est installé mais **pas encore branché** (`src/lib/stripe.ts` est vide) : aucun paiement ne passe par le site.

## Structure

```
src/
├── app/              pages (App Router) et routes API
│   ├── api/          admin/analytics, reviews, github-sync
│   ├── providers/    auth, redirections, notifications
│   └── ...           un dossier par page
├── components/       Navbar, Footer, formulaires d'auth, cartes
├── lib/              init Firebase (client + admin), helpers, notifications
├── types/            types User et Job
└── utils/            dates, calcul de distance
functions/            Cloud Functions Firebase (push)
public/               images, manifest, service worker
```

## Lancer le projet

Prérequis : Node.js 20 ou plus.

```bash
npm install
npm run dev
```

Créer un fichier `.env.local` avec :

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Côté serveur (routes API)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

Autres commandes : `npm run build`, `npm run lint`.

## Sécurité

- Rôles : `student`, `employer`, `collaborator`, `admin`.
- Les routes API vérifient le jeton Firebase et le rôle côté serveur.
- Les règles Firestore et Storage sont gérées dans la console Firebase : elles **ne sont pas versionnées** dans ce dépôt.

## Feuille de route

- Paiements Stripe
- Règles Firestore versionnées et testées
- Disponibilités sur calendrier
- Multilingue (FR / NL / EN)
