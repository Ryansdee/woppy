import Link from 'next/link';

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
    <main className="container-w grid gap-10 py-10 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <aside className="hidden flex-col justify-between rounded-[2rem] bg-ink p-10 text-paper lg:flex">
        <div>
          <span className="chip !border-paper/15 !bg-paper/5 !text-paper/80">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Woppy
          </span>
          <h2 className="mt-8 font-display text-4xl font-bold leading-tight tracking-tight">{aside.title}</h2>
        </div>
        <ul className="mt-10 space-y-4">
          {aside.points.map((p, i) => (
            <li key={p} className="flex items-start gap-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lime text-xs font-bold text-ink">
                {i + 1}
              </span>
              <span className="pt-0.5 text-paper/80">{p}</span>
            </li>
          ))}
        </ul>
      </aside>

      <section className={`mx-auto w-full ${wide ? 'max-w-[560px]' : 'max-w-[420px]'} lg:py-6`}>
        <h1 className="display text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-8 text-center text-sm text-muted">
          {switchText}{' '}
          <Link href={switchHref} className="font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
            {switchLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}
