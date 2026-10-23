'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* Pages plein écran sans pied de page */
const HIDDEN_ON = ['/messages'];

const COLUMNS = [
  {
    title: 'Plateforme',
    links: [
      { label: 'Annonces', href: '/jobs' },
      { label: 'Publier une annonce', href: '/jobs/create' },
      { label: 'Étudiants', href: '/students' },
    ],
  },
  {
    title: 'Woppy',
    links: [
      { label: 'À propos', href: '/a-propos' },
      { label: 'Carrières', href: '/careers' },
      { label: 'Mises à jour', href: '/updates' },
      { label: 'Statut du service', href: '/status' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Conditions d’utilisation', href: '/terms' },
      { label: 'Confidentialité', href: '/privacy' },
      { label: 'Cookies', href: '/cookies' },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <footer className="mt-auto border-t border-line bg-paper">
      <div className="container-w py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/images/logo.png" alt="" width={28} height={28} />
              <span className="font-display text-xl font-bold tracking-tight">woppy</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Des petits jobs près de chez vous, entre étudiants et particuliers.
            </p>
            <a
              href="mailto:contact@woppy.be"
              className="mt-4 inline-block text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              contact@woppy.be
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="eyebrow mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-ink-2 transition-colors hover:text-ink">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© 2025{year > 2025 ? `–${year}` : ''} Woppy</p>
          <p>Fait en Belgique</p>
        </div>
      </div>
    </footer>
  );
}
