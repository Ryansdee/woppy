"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  GraduationCap,
  Home,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, Badge } from "@/components/ui";
import { formatRate, shortPlace } from "@/lib/annonce";

/* ─────────────── TYPES ─────────────── */

type Annonce = {
  id: string;
  titre: string;
  description: string;
  lieu: string;
  remuneration: number | string;
  rateMode?: string;
  duree?: number | string;
  statut: string;
};

type RawReview = {
  id: string;
  status?: string;
  rating?: number;
  firstName?: string;
  lastName?: string;
  role?: string;
  text?: string;
  comment?: string;
};

type Review = { id: string; name: string; role: string; text: string; rating: number };

type Stats = { users: number; annonces: number; finished: number; students: number };

/* ─────────────── CONTENU ─────────────── */

const MIN_USERS_FOR_STATS = 50;

const STEPS = [
  { title: "Créez votre compte", desc: "Gratuit. Les étudiants complètent leur profil : études, disponibilités, expériences." },
  { title: "Publiez ou trouvez une mission", desc: "L'annonce indique la mission, le lieu, la date et la rémunération." },
  { title: "Discutez et choisissez", desc: "L'étudiant postule, la messagerie s'ouvre, le particulier accepte une candidature." },
  { title: "Laissez un avis", desc: "Une fois la mission terminée, chacun note l'autre. Les avis restent sur les profils." },
];

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: "Pour les étudiants",
    points: [
      "Des missions courtes, près de chez vous ou de votre campus",
      "La rémunération est affichée dans l'annonce",
      "Pas de CV : votre profil et vos avis parlent pour vous",
      "Vous choisissez vos missions selon vos disponibilités",
    ],
    cta: { href: "/auth/register", label: "Créer mon profil" },
  },
  {
    icon: Home,
    title: "Pour les particuliers",
    points: [
      "Publiez une annonce en quelques minutes",
      "Consultez le profil de chaque candidat",
      "Lisez les avis laissés après les missions précédentes",
      "Échangez dans la messagerie avant de confirmer",
    ],
    cta: { href: "/jobs/create", label: "Publier une annonce" },
  },
];

const TRUST = [
  { icon: BadgeCheck, title: "Profils et avis publics", desc: "Études, expériences et avis reçus sont visibles avant de choisir." },
  { icon: MessageSquare, title: "Messagerie intégrée", desc: "Fixez les détails sans partager votre numéro de téléphone." },
  { icon: ShieldCheck, title: "Signalement et support", desc: "Signalez un message ou ouvrez un ticket : l'équipe vous répond." },
];

/* ─────────────── COMPOSANTS ─────────────── */

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className={n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-line text-line"} />
      ))}
    </div>
  );
}

function JobRow({ a }: { a: Annonce }) {
  return (
    <Link href={`/jobs/${a.id}`} className="group flex items-start justify-between gap-4 p-4 transition-colors hover:bg-paper-2">
      <div className="min-w-0">
        <p className="truncate font-medium group-hover:text-brand">{a.titre}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {a.lieu && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin size={13} className="shrink-0" /> <span className="truncate">{shortPlace(a.lieu)}</span>
            </span>
          )}
          {a.duree && (
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {a.duree} h
            </span>
          )}
        </p>
      </div>
      <span className="shrink-0 text-sm font-semibold">{formatRate(a.remuneration, a.rateMode)}</span>
    </Link>
  );
}

/* ─────────────── PAGE ─────────────── */

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [annonces, setAnnonces] = useState<Annonce[] | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<{ avg: number; count: number } | null>(null);

  /* Chiffres réels */
  useEffect(() => {
    Promise.all([
      getCountFromServer(collection(db, "users")),
      getCountFromServer(collection(db, "annonces")),
      getCountFromServer(query(collection(db, "annonces"), where("statut", "==", "fini"))),
      getCountFromServer(query(collection(db, "users"), where("hasStudentProfile", "==", true))),
    ])
      .then(([u, a, f, s]) =>
        setStats({ users: u.data().count, annonces: a.data().count, finished: f.data().count, students: s.data().count })
      )
      .catch(() => setStats(null));
  }, []);

  /* Dernières annonces encore ouvertes */
  useEffect(() => {
    getDocs(query(collection(db, "annonces"), orderBy("createdAt", "desc"), limit(20)))
      .then((snap) =>
        setAnnonces(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<Annonce, "id">) }))
            .filter((a) => a.statut !== "fini" && a.titre)
            .slice(0, 4)
        )
      )
      .catch(() => setAnnonces([]));
  }, []);

  /* Avis publiés (hors modération) et note moyenne calculée */
  useEffect(() => {
    getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(50)))
      .then((snap) => {
        const published = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as RawReview)
          .filter((d) => d.status !== "pending");
        const rated = published.filter((d) => typeof d.rating === "number");
        if (rated.length) {
          setRating({ avg: rated.reduce((s, d) => s + (d.rating ?? 0), 0) / rated.length, count: rated.length });
        }
        setReviews(
          published
            .map((d) => ({
              id: d.id,
              name: [d.firstName, d.lastName].filter(Boolean).join(" ") || "Anonyme",
              role: d.role ?? "",
              text: d.text ?? d.comment ?? "",
              rating: d.rating ?? 5,
            }))
            .filter((r) => r.text)
            .slice(0, 3)
        );
      })
      .catch(() => {});
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs");
  };

  /* Les chiffres ne s'affichent qu'à partir d'une communauté significative */
  const statItems =
    stats && stats.users >= MIN_USERS_FOR_STATS
      ? [
          { value: stats.users, label: "membres inscrits" },
          { value: stats.students, label: "profils étudiants" },
          { value: stats.annonces, label: "missions publiées" },
          { value: stats.finished, label: "missions terminées" },
        ].filter((s) => s.value > 0)
      : [];

  return (
    <main className="overflow-x-hidden">
      {/* ══════════ HERO ══════════ */}
      <section className="border-b border-line bg-gradient-to-b from-brand-soft/60 to-white">
        <div className="container-w grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Badge tone="brand">Petits jobs étudiants en Belgique</Badge>
            <h1 className="display mt-5 text-4xl leading-[1.1] sm:text-5xl">
              Des petits jobs près de chez vous, entre étudiants et particuliers.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-2">
              Woppy met en relation les particuliers qui ont besoin d&apos;un coup de main et les étudiants qui cherchent des
              missions courtes et rémunérées.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/jobs/create" className="btn btn-primary btn-lg">
                Publier une annonce <ArrowRight size={16} />
              </Link>
              <Link href="/auth/register" className="btn btn-outline btn-lg">
                <GraduationCap size={16} /> Je suis étudiant
              </Link>
            </div>

            <form onSubmit={onSearch} className="mt-6 flex max-w-xl gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Rechercher une mission</span>
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une mission : déménagement, cours, jardin…"
                  className="input pl-9"
                />
              </label>
              <button type="submit" className="btn btn-dark">Rechercher</button>
            </form>
          </div>

          {/* Aperçu des vraies annonces */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold">Dernières missions publiées</p>
              <Link href="/jobs" className="text-sm link">Tout voir</Link>
            </div>
            <div className="divide-y divide-line">
              {annonces === null &&
                [0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2 p-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-paper-2" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-paper-2" />
                  </div>
                ))}
              {annonces?.map((a) => <JobRow key={a.id} a={a} />)}
              {annonces?.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted">Aucune mission ouverte pour l&apos;instant.</p>
                  <Link href="/jobs/create" className="btn btn-outline btn-sm mt-4">Publier la première</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {statItems.length > 0 && (
          <div className="container-w pb-12">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {statItems.map((s) => (
                <div key={s.label} className="card p-4">
                  <dt className="text-sm text-muted">{s.label}</dt>
                  <dd className="mt-1 text-2xl font-semibold">{s.value.toLocaleString("fr-BE")}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      {/* ══════════ COMMENT ÇA MARCHE ══════════ */}
      <section id="comment" className="container-w py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Comment ça marche</p>
          <h2 className="display mt-2 text-3xl">Quatre étapes, de l&apos;annonce à l&apos;avis.</h2>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-sm font-semibold text-brand-dark">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ══════════ POUR QUI ══════════ */}
      <section className="border-y border-line bg-paper-2">
        <div className="container-w grid gap-6 py-20 md:grid-cols-2">
          {AUDIENCES.map(({ icon: Icon, title, points, cta }) => (
            <div key={title} className="card flex flex-col p-6 sm:p-8">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand">
                <Icon size={20} />
              </span>
              <h2 className="display mt-5 text-xl">{title}</h2>
              <ul className="mt-5 flex-1 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex gap-3 text-sm text-ink-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-brand" /> {p}
                  </li>
                ))}
              </ul>
              <Link href={cta.href} className="btn btn-outline mt-8 self-start">
                {cta.label} <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CONFIANCE ══════════ */}
      <section className="container-w py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Confiance</p>
          <h2 className="display mt-2 text-3xl">Des outils pour travailler sereinement.</h2>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {TRUST.map(({ icon: Icon, title, desc }) => (
            <div key={title}>
              <Icon size={22} className="text-brand" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ AVIS ══════════ */}
      {reviews.length > 0 && (
        <section id="avis" className="border-t border-line bg-paper-2">
          <div className="container-w py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Avis</p>
                <h2 className="display mt-2 text-3xl">Ce qu&apos;en disent les membres</h2>
              </div>
              {rating && (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-semibold">{rating.avg.toFixed(1).replace(".", ",")}</span>
                  <div>
                    <Stars rating={rating.avg} />
                    <p className="mt-1 text-xs text-muted">sur {rating.count} avis</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {reviews.map((r) => (
                <figure key={r.id} className="card flex flex-col p-5">
                  <Stars rating={r.rating} />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">« {r.text} »</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                    <Avatar name={r.name} size={32} />
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      {r.role && <p className="text-xs text-muted">{r.role}</p>}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ CTA ══════════ */}
      <section className="container-w py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink px-6 py-10 text-white sm:px-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Prêt à commencer ?</h2>
            <p className="mt-2 text-white/70">L&apos;inscription est gratuite, pour les étudiants comme pour les particuliers.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register" className="btn btn-primary btn-lg">Créer un compte</Link>
            <Link href="/jobs" className="btn btn-lg border border-white/20 text-white hover:bg-white/10">Voir les annonces</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
