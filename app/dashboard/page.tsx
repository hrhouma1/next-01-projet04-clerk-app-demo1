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
