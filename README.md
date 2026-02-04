# 🚀 Woppy — Plateforme de jobs flexibles pour étudiants

> **Woppy** est une plateforme web qui met en relation des étudiants à la recherche de jobs flexibles avec des particuliers et entreprises ayant besoin d’aide ponctuelle, **localement et simplement**.

🎯 Objectif MVP :  
**permettre de créer, candidater, discuter et finaliser des missions réelles**, en toute confiance.

---

## ⚙️ Stack technique (réelle)

### Frontend
- **Next.js 16 (App Router)**
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Framer Motion**
- **Lucide React**
- **next-pwa**

### Backend (Firebase-first)
- **Firebase Authentication**
- **Firestore (temps réel)**
- **Firebase Storage**
- **Cloud Functions**
- **Firebase Security Rules (RBAC strict)**

👉 Aucune API REST : **Firebase est le backend**.

---

## ✨ Fonctionnalités (MVP)

### 👥 Étudiants
- Inscription et profil public
- Consultation des annonces
- Candidature aux missions
- Messagerie en temps réel
- Avis et notation
- Historique des missions

### 💼 Employeurs
- Publication d’annonces
- Gestion des candidatures
- Messagerie directe
- Validation des missions
- Avis et notation

### 🌐 Commun
- Authentification sécurisée
- Chat temps réel
- Notifications
- Design responsive (mobile-first)
- Support & contact intégrés
- Progressive Web App (PWA)

> 💡 Les paiements intégrés sont **préparés mais non activés** (future feature).

---

## 🗺️ Structure du projet

```
src/
├── app/
│   ├── auth/
│   ├── jobs/
│   ├── students/
│   ├── messages/
│   ├── dashboard/
│   ├── notifications/
│   ├── contact/
│   ├── demo/
│   ├── profile/[uid]
│   ├── review/[userId]
│   └── layout.tsx
│
├── components/
│   ├── auth/
│   ├── layout/
│   ├── AnnoncesMap.tsx
│   └── WoppyMap.tsx
│
├── lib/
│   └── useAuthPersistence.ts
│
├── types/
│   └── user.ts
│
├── public/
│   ├── images/
│   ├── manifest.json
│   └── firebase-messaging-sw.js
│
└── functions/
```

---

## 🧭 Routes principales

- `/` — Accueil
- `/demo` — Démo interactive
- `/jobs` — Annonces
- `/jobs/create` — Publier une annonce
- `/students` — Étudiants
- `/messages` — Messagerie
- `/dashboard/*` — Activité utilisateur
- `/contact` — Support
- `/contact/admin` — Gestion support
- `/admin/*` — Outils internes

👉 **32 routes actives**, aucune inutile.

---

## 🔐 Sécurité

- Règles Firestore strictes (audit MVP)
- Séparation claire des rôles :
  - user
  - collaborator
  - admin
- Accès basé sur rôle + ownership
- Storage sécurisé par relation métier
- Aucun accès public sensible

✔️ Sécurité compatible **bêta publique MVP**.

---

## 🧪 Modèle de données (simplifié)

### User
```ts
interface User {
  uid: string;
  role: 'student' | 'employer' | 'admin' | 'collaborator';
  displayName: string;
  city: string;
  photoURL?: string;
}
```

### Annonce
```ts
interface Annonce {
  title: string;
  description: string;
  date: string;
  duration: number;
  hourlyRate: number;
  userId: string;
  acceptedUserId?: string;
  statut: 'open' | 'in_progress' | 'fini';
}
```

### Candidature
```ts
interface Candidature {
  annonceId: string;
  candidatId: string;
  message: string;
}
```

---

## 🚧 Roadmap

### MVP (actuel)
- Mise en relation
- Chat
- Avis
- Support
- Sécurité

### Prochaines étapes
- 💳 Paiements Stripe
- 📍 Géolocalisation avancée
- 📆 Calendrier de disponibilités
- 🔔 Notifications push
- 🌍 Multilingue

---

## 🚀 Installation locale

### Prérequis
- Node.js >= 18

### Installation

```bash
npm install
npm run dev
```

Configurer `.env.local` avec :
- Firebase config
- clés Cloud Functions (si utilisées localement)

---

## 🧠 Philosophie produit

- Pas de feature inutile
- Pas de backend fantôme
- Firebase-first
- Sécurité avant scaling
- Produit guidé par l’usage réel

---

## 📄 License

MIT

---

## 📬 Contact

**Email** : contact@woppy.be  
**Site** : https://woppy.be  

---

Made with 💜 by the Woppy team
