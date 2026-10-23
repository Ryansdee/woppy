'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { auth, db } from '@/lib/firebase';

export type StaffRole = 'admin' | 'collaborator';

/* Pages de l'équipe ; adminOnly = réservé aux administrateurs */
export const STAFF_PAGES: { href: string; label: string; adminOnly?: boolean }[] = [
  { href: '/dashboard/collaborateur', label: 'Modération' },
  { href: '/contact/admin', label: 'Support' },
  { href: '/dashboard/recap', label: 'Statistiques' },
  { href: '/dashboard/jobs-career', label: 'Postes internes', adminOnly: true },
  { href: '/dashboard/applications', label: 'Candidatures', adminOnly: true },
  { href: '/dashboard/market-survey', label: 'Enquête', adminOnly: true },
];

type StaffState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'ok'; user: User; role: StaffRole };

/* Vérifie la connexion et le rôle. Côté client uniquement : la vraie protection reste les règles Firestore. */
export function useStaff(adminOnly = false): StaffState {
  const router = useRouter();
  const [state, setState] = useState<StaffState>({ status: 'loading' });

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const role = snap.data()?.role;
        const allowed = adminOnly ? role === 'admin' : role === 'admin' || role === 'collaborator';
        setState(allowed ? { status: 'ok', user, role } : { status: 'denied' });
      } catch {
        setState({ status: 'denied' });
      }
    });
  }, [adminOnly, router]);

  return state;
}

type Props = {
  title: string;
  description?: string;
  adminOnly?: boolean;
  actions?: React.ReactNode;
  /* Reçoit l'utilisateur et son rôle une fois l'accès vérifié */
  children: (ctx: { user: User; role: StaffRole }) => React.ReactNode;
};

export default function StaffShell({ title, description, adminOnly, actions, children }: Props) {
  const pathname = usePathname();
  const staff = useStaff(adminOnly);

  if (staff.status === 'loading') {
    return (
      <main className="container-w grid min-h-[60vh] place-items-center">
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" /> Vérification des accès…
        </p>
      </main>
    );
  }

  if (staff.status === 'denied') {
    return (
      <main className="container-w grid min-h-[60vh] place-items-center text-center">
        <div>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-danger">
            <ShieldAlert size={22} />
          </span>
          <h1 className="display mt-5 text-2xl">Accès réservé à l’équipe</h1>
          <p className="mt-2 text-sm text-muted">
            {adminOnly ? 'Cette page est réservée aux administrateurs.' : 'Cette page est réservée aux collaborateurs Woppy.'}
          </p>
          <Link href="/dashboard" className="btn btn-primary mt-6">
            Retour au tableau de bord
          </Link>
        </div>
      </main>
    );
  }

  const pages = STAFF_PAGES.filter((p) => !p.adminOnly || staff.role === 'admin');

  return (
    <main className="container-w py-8 sm:py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} /> Tableau de bord
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Équipe Woppy</p>
          <h1 className="display mt-1 text-3xl sm:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-xl text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>

      <nav aria-label="Pages de l’équipe" className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-1 rounded-full border border-line bg-white p-1">
          {pages.map((p) => {
            const active = pathname === p.href || pathname.startsWith(`${p.href}/`);
            return (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
                  }`}
                >
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-8">{children({ user: staff.user, role: staff.role })}</div>
    </main>
  );
}
