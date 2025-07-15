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
