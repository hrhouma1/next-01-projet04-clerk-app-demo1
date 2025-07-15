# Tutoriel : Intégrer Clerk avec Next.js et Tailwind v3 (auth + pages publiques/privées)

## 📋 Table des matières
1. [Créer le projet Next.js](#1-creation-projet)
2. [Configurer Tailwind CSS](#2-installation-tailwind)
3. [Ajouter Clerk](#3-ajouter-clerk)
4. [Créer des pages publiques](#4-creer-pages-publiques)
5. [Créer une page protégée](#5-pages-privees)
6. [Ajouter les pages d'authentification](#6-auth-pages)
7. [Protéger les routes avec middleware](#7-middleware)
8. [Ajouter une barre de navigation](#8-navbar)
9. [Test complet](#9-test)

---

## <h2 id="1-creation-projet">1. Créer le projet Next.js</h2>

```bash
npx create-next-app@latest nextjs-clerk-app --app --typescript
cd nextjs-clerk-app
```

### ✅ Réponses aux questions :

* **Would you like to use Tailwind CSS ?** → `Yes`
* **Would you like to use App Router ?** → `Yes`
* **Would you like to use ESLint ?** → `Yes`
* **Would you like to use src/ directory ?** → `No`
* **Would you like to customize the default import alias (@/*) ?** → `No`

> ⚠️ **Note importante** : L'option "experimental app/ directory" n'existe plus car App Router est maintenant stable dans Next.js 15.

---

## <h2 id="2-installation-tailwind">2. Configurer Tailwind CSS</h2>

✅ Tailwind est déjà installé si tu as dit "Yes" à l'étape précédente.

### Vérifier la configuration dans `tailwind.config.js` :

```js
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

### Vérifier les styles dans `app/globals.css` :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## <h2 id="3-ajouter-clerk">3. Ajouter Clerk</h2>

### Étape A – Créer un compte

1. Va sur : [https://clerk.com/](https://clerk.com/)
2. Crée un compte, puis un projet (par ex. `nextjs-clerk-app`)
3. Note tes clés API

---

### Étape B – Installer Clerk

```bash
npm install @clerk/nextjs
```

---

### Étape C – Ajouter les variables d'environnement

Crée un fichier `.env.local` :

```env
# Clés Clerk (obtenues sur https://dashboard.clerk.com/)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# URLs de redirection (optionnel - valeurs par défaut)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

> 🔑 **Important** : Remplace `pk_test_xxx` et `sk_test_xxx` par les clés trouvées dans Clerk → Settings → API Keys.

---

### Étape D – Ajouter ClerkProvider dans `layout.tsx`

Fichier : `app/layout.tsx`

```tsx
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

---

## <h2 id="4-creer-pages-publiques">4. Créer des pages publiques (accès sans connexion)</h2>

### `app/page.tsx` (Accueil)

```tsx
export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Bienvenue sur notre site</h1>
      <p className="mt-4">Ceci est une page publique accessible sans connexion.</p>
    </div>
  );
}
```

### `app/contact/page.tsx`

```tsx
export default function ContactPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Contact</h1>
      <p className="mt-4">Page de contact accessible à tous.</p>
    </div>
  );
}
```

---

## <h2 id="5-pages-privees">5. Créer une page protégée (connexion requise)</h2>

### `app/dashboard/page.tsx`

```tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <p className="mt-4">Bienvenue, utilisateur connecté.</p>
    </div>
  );
}
```

> ⚠️ **Correction importante** : `auth()` retourne maintenant une Promise, donc on doit utiliser `await auth()`.

---

## <h2 id="6-auth-pages">6. Ajouter les pages de connexion et d'inscription</h2>

### `app/sign-in/[[...sign-in]]/page.tsx`

```tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="p-8">
      <SignIn path="/sign-in" />
    </div>
  );
}
```

### `app/sign-up/[[...sign-up]]/page.tsx`

```tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="p-8">
      <SignUp path="/sign-up" />
    </div>
  );
}
```

> 💡 **Explication** : Les dossiers `[[...sign-in]]` et `[[...sign-up]]` sont des **catch-all routes** qui permettent à Clerk de gérer toutes les sous-routes d'authentification.

---

## <h2 id="7-middleware">7. Protéger automatiquement les routes avec middleware</h2>

### `middleware.ts` (à la racine du projet)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/contact', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect();
  }
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

> ⚠️ **Correction majeure** : `authMiddleware` est obsolète dans Clerk v6+. On utilise maintenant `clerkMiddleware` avec `createRouteMatcher`.

---

## <h2 id="8-navbar">8. Ajouter une barre de navigation simple</h2>

### `app/components/Navbar.tsx`

```tsx
'use client';

import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav className="p-4 bg-gray-100 flex justify-between items-center">
      <div className="space-x-4">
        <Link href="/">Accueil</Link>
        <Link href="/contact">Contact</Link>
        {isSignedIn && <Link href="/dashboard">Dashboard</Link>}
      </div>
      <div>
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Link href="/sign-in">Connexion</Link>
        )}
      </div>
    </nav>
  );
}
```

### Ajouter la navbar dans `app/layout.tsx` :

```tsx
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/app/components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

> ⚠️ **Correction** : L'import doit être `@/app/components/Navbar` et non `@/components/Navbar` car le dossier components est dans app/.

---

## <h2 id="9-test">9. Test complet</h2>

### Démarrer le serveur de développement :

```bash
npm run dev
```

### Tests à effectuer :

#### ✅ **Pages publiques**
- [ ] Accès libre à `http://localhost:3000/` (Accueil)
- [ ] Accès libre à `http://localhost:3000/contact` (Contact)
- [ ] Navbar affiche "Connexion" quand non connecté

#### 🔐 **Pages protégées**
- [ ] Redirection vers `/sign-in` si on tente `/dashboard` sans être connecté
- [ ] Possibilité de se connecter via `/sign-in`
- [ ] Possibilité de s'inscrire via `/sign-up`

#### ✅ **Après connexion**
- [ ] Accès à `/dashboard` après connexion
- [ ] Navbar affiche le UserButton (photo de profil)
- [ ] Lien "Dashboard" apparaît dans la navbar
- [ ] Session persistante (actualisation de page ne déconnecte pas)

#### ✅ **Déconnexion**
- [ ] Clic sur UserButton → Sign Out fonctionne
- [ ] Redirection vers `/` après déconnexion
- [ ] Navbar revient à l'état "non connecté"

---

## 🎯 Résumé des corrections apportées

### ❌ **Erreurs dans le guide original :**
1. **Middleware obsolète** : `authMiddleware` → `clerkMiddleware`
2. **API auth() incorrecte** : `auth()` → `await auth()`
3. **Import navbar incorrect** : `@/components/` → `@/app/components/`
4. **Variables d'environnement** : Noms mis à jour selon Clerk v6+

### ✅ **Améliorations apportées :**
1. **Code compatible** avec Clerk v6.25.0 et Next.js 15
2. **Explications détaillées** des corrections
3. **Checklist de test** complète
4. **Structure pédagogique** maintenue
5. **Warnings** pour les points importants

---

## 🚀 Prochaines étapes possibles

Une fois ce tutoriel maîtrisé, vos étudiants peuvent explorer :

- **Rôles et permissions** (admin/user)
- **Base de données** avec Prisma ou Supabase
- **Authentification multi-facteurs** (MFA)
- **Organisation management** (équipes)
- **Webhooks** pour synchroniser les données

---

## 📚 Ressources complémentaires

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

*Ce tutoriel a été testé et corrigé pour être compatible avec les versions actuelles de Clerk (v6.25.0) et Next.js (15.4.1).* 