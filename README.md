# 🚀 Woppy - Plateforme de mise en relation étudiants/employeurs

![Woppy Banner](https://via.placeholder.com/1200x300/8a6bfe/ffffff?text=Woppy+-+Jobs+%C3%89tudiants+Flexibles)

> **Woppy** est une plateforme moderne qui connecte les étudiants à la recherche de jobs flexibles avec des particuliers et entreprises ayant besoin d'aide ponctuelle.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table des matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🎨 Design System](#-design-system)
- [📁 Structure du projet](#-structure-du-projet)
- [🚀 Installation](#-installation)
- [🛠️ Technologies utilisées](#️-technologies-utilisées)
- [📱 Pages & Composants](#-pages--composants)
- [🎯 Roadmap](#-roadmap)
- [🤝 Contribution](#-contribution)
- [📄 License](#-license)

---

## ✨ Fonctionnalités

### 👥 Pour les Étudiants

- ✅ **Inscription simplifiée** avec profil personnalisé
  - Informations de base (âge, ville, rémunération souhaitée)
  - Auto-description et présentation
  - Liste d'expériences professionnelles
- 🔍 **Recherche d'emplois** avec filtres avancés
  - Par catégorie (déménagement, baby-sitting, cours, etc.)
  - Par localisation et rémunération
  - Offres urgentes mises en avant
- 📝 **Candidature en un clic** avec message personnalisé
- ⭐ **Système d'avis** et de notation
- 💬 **Messagerie intégrée** pour communiquer avec les employeurs
- 📊 **Tableau de bord** avec statistiques personnelles

### 💼 Pour les Employeurs

- 📢 **Publication d'annonces** détaillées
  - Description complète de la mission
  - Prérequis et avantages
  - Rémunération et disponibilités
- 👀 **Parcours des profils étudiants**
  - Filtres par compétences et localisation
  - Consultation des avis et expériences
  - Notes et statistiques visibles
- 📨 **Contact direct** avec les candidats
- ✅ **Gestion des candidatures**
- ⭐ **Système de notation** des étudiants

### 🌟 Fonctionnalités communes

- 🔐 **Authentification sécurisée** (JWT)
- 💬 **Chat en temps réel** (WebSocket ready)
- 🔔 **Notifications** pour les nouveaux messages et candidatures
- 📱 **Design responsive** (mobile, tablette, desktop)
- 🌍 **Multilingue** (FR/EN/NL - prévu)
- 🎨 **Interface moderne** avec animations fluides

---

## 🎨 Design System

### Palette de couleurs

```css
/* Couleurs principales */
--primary: #8a6bfe;        /* Violet principal */
--primary-light: #b89fff;  /* Violet clair */
--secondary: #f5e5ff;      /* Fond violet pâle */

/* Couleurs d'état */
--success: #10b981;        /* Vert */
--warning: #f59e0b;        /* Orange */
--error: #ef4444;          /* Rouge */
--info: #3b82f6;           /* Bleu */

/* Neutres */
--gray-50: #f9fafb;
--gray-900: #111827;
```

### Typographie

- **Font principale** : System font stack (SF Pro, Segoe UI, etc.)
- **Titres** : Bold (700)
- **Corps** : Regular (400) / Medium (500)
- **Tailles** :
  - H1 : 3rem (48px)
  - H2 : 2rem (32px)
  - H3 : 1.5rem (24px)
  - Body : 1rem (16px)
  - Small : 0.875rem (14px)

### Composants UI

- **Boutons** : `rounded-xl` avec gradients
- **Cards** : `rounded-2xl` avec `shadow-lg`
- **Inputs** : `rounded-xl` avec focus ring violet
- **Badges** : `rounded-full` avec couleurs thématiques
- **Avatars** : Circulaires avec initiales et gradient

---

## 📁 Structure du projet

```
woppy/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Page de connexion
│   │   └── register/
│   │       └── page.tsx          # Page d'inscription
│   ├── jobs/
│   │   ├── [id]/
│   │   │   └── page.tsx          # Détail d'une offre
│   │   ├── create/
│   │   │   └── page.tsx          # Créer une annonce
│   │   └── page.tsx              # Liste des offres
│   ├── students/
│   │   ├── [id]/
│   │   │   └── page.tsx          # Profil étudiant
│   │   └── page.tsx              # Liste des étudiants
│   ├── messages/
│   │   └── page.tsx              # Messagerie
│   ├── profile/
│   │   └── page.tsx              # Profil utilisateur
│   ├── references/
│   │   └── page.tsx              # Avis et références
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Page d'accueil
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # Formulaire de connexion
│   │   └── RegisterForm.tsx      # Formulaire d'inscription
│   ├── ui/
│   │   ├── Button.tsx            # Composant bouton
│   │   ├── Card.tsx              # Composant carte
│   │   ├── Input.tsx             # Composant input
│   │   └── Badge.tsx             # Composant badge
│   └── layout/
│       ├── Header.tsx            # En-tête
│       └── Footer.tsx            # Pied de page
├── lib/
│   ├── api/                      # Appels API
│   ├── hooks/                    # Custom hooks React
│   └── utils/                    # Fonctions utilitaires
├── public/
│   ├── images/
│   │   └── logo.png              # Logo Woppy
│   └── icons/                    # Icônes
├── styles/
│   └── globals.css               # Styles globaux
├── types/
│   └── index.ts                  # Types TypeScript
├── .env.local                    # Variables d'environnement
├── next.config.js                # Configuration Next.js
├── tailwind.config.js            # Configuration Tailwind
├── tsconfig.json                 # Configuration TypeScript
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prérequis

- **Node.js** >= 18.0.0
- **npm** ou **yarn** ou **pnpm**

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/votre-username/woppy.git

# Naviguer dans le dossier
cd woppy

# Installer les dépendances
npm install
# ou
yarn install
# ou
pnpm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Démarrer le serveur de développement
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api
API_SECRET_KEY=your_secret_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/woppy

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# OAuth (optionnel)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Upload
NEXT_PUBLIC_MAX_FILE_SIZE=5242880 # 5MB

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
```

---

## 🛠️ Technologies utilisées

### Frontend

| Technologie | Version | Description |
|------------|---------|-------------|
| **Next.js** | 15.x | Framework React avec SSR et routing |
| **React** | 19.x | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 3.x | Framework CSS utility-first |
| **Lucide React** | Latest | Bibliothèque d'icônes |

### Backend (prévu)

| Technologie | Description |
|------------|-------------|
| **Node.js + Express** | API REST |
| **PostgreSQL** | Base de données |
| **Prisma** | ORM |
| **JWT** | Authentification |
| **Socket.io** | Chat en temps réel |
| **Cloudinary** | Upload d'images |

### DevOps

| Technologie | Description |
|------------|-------------|
| **Vercel** | Hébergement frontend |
| **Docker** | Containerisation |
| **GitHub Actions** | CI/CD |

---

## 📱 Pages & Composants

### Pages d'authentification

#### `/auth/login` - Connexion
- ✅ Formulaire email/mot de passe
- 🔒 Affichage/masquage du mot de passe
- ☑️ Case "Se souvenir de moi"
- 🔗 Lien "Mot de passe oublié"
- 🌐 Connexion via Google/Facebook
- ✨ Validation côté client
- 🎨 Design avec gradient violet

#### `/auth/register` - Inscription
**Étape 1 : Choix du type de compte**
- 👨‍🎓 Compte Étudiant
- 💼 Compte Employeur

**Étape 2 : Formulaire d'inscription**

**Champs communs :**
- Prénom, Nom
- Email
- Ville
- Téléphone (optionnel)
- Mot de passe + confirmation
- Acceptation CGU

**Champs spécifiques étudiant :**
- 📅 Âge (minimum 16 ans)
- 💶 Rémunération horaire souhaitée (optionnel)
- ✍️ Auto-description (optionnel)
- 📋 Liste d'expériences (ajout dynamique)
  - Titre de l'expérience
  - Description

**Features :**
- 📊 Indicateur de progression (2 étapes)
- ✅ Validation complète
- 🎯 Messages d'erreur clairs
- 🔄 Possibilité de modifier le type de compte

---

### Pages principales

#### `/` - Page d'accueil
- 🎯 Hero section avec CTA
- 💼 Section "Comment ça marche"
- 🌟 Témoignages
- 📊 Statistiques de la plateforme
- 📱 CTA d'inscription

#### `/jobs` - Liste des offres d'emploi
- 🔍 Barre de recherche
- 🎚️ Filtres : ville, catégorie, rémunération
- 🏷️ Catégories rapides (cliquables)
- 📋 Liste des offres avec :
  - Titre et badges (urgent, vérifié)
  - Employeur et date
  - Description courte
  - Infos : lieu, date, durée, €/h
  - Nombre de candidatures
  - Bouton "Postuler"
- 📊 Tri par pertinence
- ➕ Bouton "Publier une annonce" (header)

#### `/jobs/[id]` - Détail d'une offre
**Colonne principale :**
- 📄 En-tête complet avec toutes les infos
- 🔖 Boutons : Sauvegarder, Partager
- 📝 Description détaillée (multi-paragraphes)
- ✅ Liste des prérequis
- ⭐ Liste des avantages
- 📍 Localisation (adresse partielle)

**Sidebar (sticky) :**
- 💶 Prix et durée en grand
- 🚀 Bouton "Postuler maintenant"
- 👤 Carte employeur avec stats
- 💡 Conseils pour candidater

**Modal de candidature :**
- 📋 Récapitulatif de l'offre
- ✍️ Message de motivation (textarea)
- 💡 Conseils pour améliorer sa candidature
- ✅ Validation + confirmation

#### `/students` - Liste des étudiants
- 🔍 Recherche par nom, compétence
- 🎚️ Filtres : ville, rémunération max, disponibilité
- 📇 Cartes étudiants avec :
  - Avatar avec initiales
  - Nom, âge, ville
  - Note et nombre d'avis
  - Missions complétées
  - Rémunération/h
  - Description courte
  - Tags d'expériences (max 3)
  - Badges : Disponible/Indisponible
  - Boutons "Voir profil" + "Contacter"

#### `/messages` - Messagerie
**Layout 2 colonnes :**

**Colonne gauche :**
- 🔍 Recherche de conversations
- 📋 Liste des conversations avec :
  - Avatar + statut en ligne
  - Nom + note
  - Dernier message
  - Timestamp
  - Badge messages non lus

**Colonne droite :**
- 👤 Header du contact (nom, statut, profil)
- 💬 Zone de messages :
  - Bulles différenciées (vous/autre)
  - Timestamps
  - Indicateurs de lecture (double check)
- ⌨️ Input avec :
  - Bouton pièce jointe
  - Champ de texte
  - Bouton envoyer
- 💡 Conseil en footer

#### `/profile` - Profil utilisateur
**Header du profil :**
- 👤 Avatar circulaire (initiales + gradient)
- Nom complet
- Âge, ville, rémunération/h
- Note moyenne et nombre d'avis
- Missions complétées
- Bouton "Modifier" / "Enregistrer"

**4 onglets :**

**1. Informations**
- 📝 Formulaire éditable :
  - Prénom, Nom
  - Email, Téléphone
  - Ville
  - Rémunération horaire
  - Description

**2. Expériences**
- 📋 Liste des expériences
- ➕ Bouton "Ajouter"
- ❌ Supprimer une expérience
- 💼 Affichage en cartes violettes

**3. Avis**
- ⭐ Liste des avis reçus
- Note en étoiles
- Commentaire complet
- Auteur et date
- Titre du job

**4. Statistiques**
- 📊 4 cartes avec icônes :
  - 💼 Missions complétées
  - ⭐ Note moyenne
  - ✅ Taux de complétion
  - ⚡ Temps de réponse

#### `/references` - Avis et références
**Hero avec statistiques :**
- 💬 Total avis publiés
- ⭐ Note moyenne globale
- 📈 Avis 5 étoiles
- ✅ % avis vérifiés

**Section filtres :**
- 📊 Distribution des notes (barres de progression cliquables)
- 🎯 Filtres rapides : Tous / Étudiants / Employeurs

**Liste des références :**
- 👤 Avatar auteur + type (badge)
- ✅ Badge "Vérifié"
- ⭐ Note en étoiles
- 📝 Commentaire complet
- 🎯 Job concerné
- 👍 Bouton "Utile" avec compteur
- 🔗 Lien vers profil

---

## 🎯 Roadmap

### Phase 1 : MVP (En cours) ✅
- [x] Pages d'authentification
- [x] Page d'accueil
- [x] Liste des offres d'emploi
- [x] Détail d'une offre
- [x] Liste des étudiants
- [x] Messagerie basique
- [x] Profil utilisateur
- [x] Système d'avis
- [ ] Intégration API backend

### Phase 2 : Fonctionnalités avancées 🚧
- [ ] Chat en temps réel (WebSocket)
- [ ] Notifications push
- [ ] Upload d'images (avatar, documents)
- [ ] Système de paiement intégré (Stripe)
- [ ] Vérification d'identité
- [ ] Géolocalisation avec carte
- [ ] Système de matching intelligent
- [ ] Calendrier de disponibilités

### Phase 3 : Expansion 📅
- [ ] Application mobile (React Native)
- [ ] Version multilingue (FR/EN/NL)
- [ ] Programme de parrainage
- [ ] Badges et gamification
- [ ] Statistiques avancées pour employeurs
- [ ] Export de factures
- [ ] Intégration agenda (Google Calendar)
- [ ] Mode sombre

### Phase 4 : Entreprise 🏢
- [ ] Version B2B pour entreprises
- [ ] Dashboard administrateur
- [ ] Analytics avancés
- [ ] API publique
- [ ] Programme partenaire
- [ ] Support client intégré

---

## 📊 Modèle de données

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  city: string;
  accountType: 'student' | 'employer';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### StudentProfile
```typescript
interface StudentProfile {
  userId: string;
  age: number;
  hourlyRate?: number;
  description?: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: string;
  available: boolean;
  experiences: Experience[];
}
```

### Job
```typescript
interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  address?: string;
  hourlyRate: number;
  duration: string;
  date: string;
  startTime?: string;
  employerId: string;
  requirements: string[];
  benefits: string[];
  status: 'open' | 'closed' | 'in_progress';
  urgent: boolean;
  verified: boolean;
  applicants: number;
  createdAt: Date;
}
```

### Review
```typescript
interface Review {
  id: string;
  rating: number;
  comment: string;
  authorId: string;
  recipientId: string;
  jobId: string;
  helpful: number;
  verified: boolean;
  createdAt: Date;
}
```

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🚀 Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Docker

```bash
# Build
docker build -t woppy .

# Run
docker run -p 3000:3000 woppy
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. Créer une **branche** (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

### Guidelines

- ✅ Code en TypeScript
- ✅ Utiliser Tailwind CSS pour le styling
- ✅ Suivre les conventions de nommage du projet
- ✅ Ajouter des tests pour les nouvelles fonctionnalités
- ✅ Documenter les fonctions complexes
- ✅ Respecter le design system

---

## 📄 License

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Équipe

- **Product Owner** : [Votre nom]
- **Lead Developer** : [Votre nom]
- **UI/UX Designer** : [Votre nom]

---

## 📞 Contact

**Email** : contact@woppy.be  
**Website** : [https://woppy.be](https://woppy.be)  
**Twitter** : [@WoppyJobs](https://twitter.com/WoppyJobs)  
**LinkedIn** : [Woppy](https://linkedin.com/company/woppy)

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Lucide](https://lucide.dev/) pour les icônes
- [Vercel](https://vercel.com/) pour l'hébergement

---

<div align="center">

**[⬆ Retour en haut](#-woppy---plateforme-de-mise-en-relation-étudiantsemployeurs)**

Made with 💜 by the Woppy Team

</div>