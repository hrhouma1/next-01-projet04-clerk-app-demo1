# Guide d'architecture - Projet Next.js avec Clerk

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Structure du projet](#structure-du-projet)
3. [Détails des dossiers](#détails-des-dossiers)
4. [Fichiers de configuration](#fichiers-de-configuration)
5. [Flux d'authentification](#flux-dauthentification)
6. [Concepts clés](#concepts-clés)

---

## 🎯 Vue d'ensemble

Ce projet utilise **Next.js 15** avec l'**App Router** et **Clerk** pour l'authentification. Il s'agit d'une application moderne avec authentification complète, middleware de protection des routes et interface utilisateur réactive.

**Technologies utilisées :**
- ⚛️ **Next.js 15** (App Router)
- 🔐 **Clerk** (Authentification)
- 🎨 **Tailwind CSS** (Styling)
- 📘 **TypeScript** (Type safety)
- 🎯 **React 19** (Interface utilisateur)

---

## 📁 Structure du projet

```
nextjs-clerk-app/
├── app/                                 ← Dossier principal Next.js 13+ (App Router)
│   ├── layout.tsx                       ← Layout global avec ClerkProvider
│   ├── page.tsx                         ← Page d'accueil (publique)
│   ├── globals.css                      ← Styles globaux Tailwind
│   ├── favicon.ico                      ← Icône du site
│   │
│   ├── components/                      ← Composants réutilisables
│   │   └── Navbar.tsx                   ← Barre de navigation (UserButton, liens)
│   │
│   ├── contact/                         ← Route: /contact
│   │   └── page.tsx                     ← Page de contact (publique)
│   │
│   ├── dashboard/                       ← Route: /dashboard
│   │   └── page.tsx                     ← Tableau de bord (protégé par auth)
│   │
│   ├── sign-in/                         ← Route: /sign-in
│   │   └── [[...sign-in]]/              ← Catch-all route pour Clerk
│   │       └── page.tsx                 ← Composant SignIn de Clerk
│   │
│   └── sign-up/                         ← Route: /sign-up
│       └── [[...sign-up]]/              ← Catch-all route pour Clerk
│           └── page.tsx                 ← Composant SignUp de Clerk
│
├── public/                              ← Fichiers statiques
│   ├── favicon.ico                      ← Icône par défaut
│   ├── next.svg                         ← Logo Next.js
│   ├── vercel.svg                       ← Logo Vercel
│   └── *.svg                            ← Autres assets
│
├── middleware.ts                        ← Middleware Clerk (protection routes)
├── .env.local                           ← Variables d'environnement Clerk
├── .env.example                         ← Exemple de configuration
│
├── tailwind.config.js                   ← Configuration Tailwind CSS
├── postcss.config.mjs                   ← Configuration PostCSS
├── tsconfig.json                        ← Configuration TypeScript
├── next.config.ts                       ← Configuration Next.js
├── eslint.config.mjs                    ← Configuration ESLint
│
├── package.json                         ← Dépendances et scripts
├── package-lock.json                    ← Verrous des versions
└── README.md                            ← Documentation du projet
```

---

## 📂 Détails des dossiers

### 🔴 **app/** - App Router de Next.js 13+
```typescript
app/
├── layout.tsx          // Layout racine avec ClerkProvider
├── page.tsx            // Page d'accueil (route: /)
├── globals.css         // Styles Tailwind globaux
└── [dossier]/          // Chaque dossier = une route
    └── page.tsx        // Page de la route
```

**Particularités :**
- **App Router** : Nouveau système de routage Next.js 13+
- **layout.tsx** : Layout partagé par toutes les pages
- **page.tsx** : Point d'entrée de chaque route
- **Routage basé sur les dossiers** : `/contact` → `app/contact/page.tsx`

### 🔵 **app/components/** - Composants réutilisables
```typescript
components/
└── Navbar.tsx          // Navigation avec UserButton Clerk
```

**Rôle :** Composants partagés entre plusieurs pages

### 🟢 **Routes d'authentification** - Clerk
```typescript
sign-in/[[...sign-in]]/page.tsx    // Route catch-all pour Clerk
sign-up/[[...sign-up]]/page.tsx    // Route catch-all pour Clerk
```

**Particularités :**
- **[[...sign-in]]** : Catch-all route pour Clerk
- Permet à Clerk de gérer toutes les sous-routes d'authentification
- Exemple : `/sign-in/verify-email`, `/sign-in/forgot-password`

### 🟡 **public/** - Fichiers statiques
```
public/
├── favicon.ico         // Icône du site
└── *.svg              // Images et icônes
```

**Accessible via :** `/favicon.ico`, `/next.svg`, etc.

---

## ⚙️ Fichiers de configuration

### 🔐 **middleware.ts** - Protection des routes
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/contact', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect();
  }
});
```

**Rôle :** Protège automatiquement toutes les routes sauf celles déclarées publiques

### 🌍 **.env.local** - Variables d'environnement
```bash
# Clés Clerk (obtenues sur https://dashboard.clerk.com/)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# URLs de redirection (optionnel)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 🎨 **tailwind.config.js** - Styling
```javascript
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",  // Scanne le dossier app/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 📘 **tsconfig.json** - TypeScript
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]  // Alias pour les imports
    }
  }
}
```

---

## 🔄 Flux d'authentification

### 1. **Utilisateur non connecté**
```
/ (accueil) → ✅ Accessible
/contact → ✅ Accessible
/dashboard → ❌ Redirigé vers /sign-in
```

### 2. **Processus de connexion**
```
/sign-in → Clerk UI → Authentification → /dashboard
```

### 3. **Utilisateur connecté**
```
/ (accueil) → ✅ Accessible + UserButton
/contact → ✅ Accessible + UserButton
/dashboard → ✅ Accessible + contenu protégé
```

### 4. **Déconnexion**
```
UserButton → Sign Out → / (accueil)
```

---

## 🎓 Concepts clés

### 🔑 **App Router vs Pages Router**
- **App Router** (Next.js 13+) : `app/` directory
- **Pages Router** (ancien) : `pages/` directory
- Ce projet utilise **App Router** uniquement

### 🛡️ **Middleware de protection**
- S'exécute **avant** chaque requête
- Vérifie l'authentification automatiquement
- Redirige vers `/sign-in` si non connecté

### 🎯 **Catch-all Routes**
- `[[...sign-in]]` capture toutes les sous-routes
- Permet à Clerk de gérer l'UI d'authentification complète
- Exemple : `/sign-in/verify-email` fonctionne automatiquement

### 🔄 **Server vs Client Components**
- **Server Components** : Rendu côté serveur (par défaut)
- **Client Components** : Rendu côté client (`'use client'`)
- Navbar utilise `'use client'` pour les interactions

### 🎨 **Styling avec Tailwind**
- Classes utilitaires : `p-4`, `bg-gray-100`, `text-2xl`
- Configuration dans `tailwind.config.js`
- Styles globaux dans `app/globals.css`

---

## 📋 Checklist pour les étudiants

### ✅ **Prérequis**
- [ ] Node.js installé
- [ ] Compte Clerk créé
- [ ] Clés Clerk obtenues

### ✅ **Configuration**
- [ ] `npm install` exécuté
- [ ] `.env.local` créé avec les clés Clerk
- [ ] `npm run dev` fonctionne

### ✅ **Tests**
- [ ] Page d'accueil accessible
- [ ] Redirection vers /sign-in sur /dashboard
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard accessible après connexion
- [ ] Déconnexion fonctionne

### ✅ **Compréhension**
- [ ] Structure App Router comprise
- [ ] Rôle du middleware compris
- [ ] Différence routes publiques/protégées comprise
- [ ] Fonctionnement des catch-all routes compris

---

## 🚀 Commandes utiles

```bash
# Développement
npm run dev          # Démarrer le serveur de développement

# Production
npm run build        # Construire pour la production
npm run start        # Démarrer en mode production

# Maintenance
npm run lint         # Vérifier le code avec ESLint
rm -rf .next         # Nettoyer le cache Next.js
```

---

## 📚 Ressources complémentaires

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

*Ce guide est conçu pour aider les étudiants à comprendre l'architecture complète du projet Next.js avec Clerk. Chaque section peut être étudiée individuellement selon le niveau et les besoins.* 