import Link from 'next/link';
import Image from 'next/image';
import { Check } from 'lucide-react';

type Props = {
  title: string;
  subtitle: string;
  aside: { title: string; points: string[] };
  switchText: string;
  switchHref: string;
  switchLabel: string;
  wide?: boolean;
  children: React.ReactNode;
};

/* Mise en page commune aux pages de connexion et d'inscription */
export default function AuthShell({ title, subtitle, aside, switchText, switchHref, switchLabel, wide, children }: Props) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-paper-2">
      <div className="container-w grid gap-10 py-10 sm:py-16 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <aside className="hidden lg:block lg:pt-6">
          <Image src="/images/logo.png" alt="" width={36} height={36} />
          <h2 className="display mt-6 text-3xl">{aside.title}</h2>
          <ul className="mt-8 space-y-4">
            {aside.points.map((p) => (
              <li key={p} className="flex gap-3 text-ink-2">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <Check size={13} strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </aside>

        <section className={`card mx-auto w-full p-6 sm:p-8 ${wide ? 'max-w-[600px]' : 'max-w-[440px]'}`}>
          <h1 className="display text-2xl">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">
            {switchText}{' '}
            <Link href={switchHref} className="link">
              {switchLabel}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
