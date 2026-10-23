"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Euro,
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

/* ─────────────── TYPES ─────────────── */

type Annonce = {
  id: string;
  titre: string;
  description: string;
  lieu: string;
  remuneration: number | string;
  duree?: number | string;
  date?: string;
  statut: string;
};

type Review = {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
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

type Stats = { users: number; annonces: number; finished: number; students: number };

/* ─────────────── CONTENU ─────────────── */

const MIN_USERS_FOR_STATS = 50;

const STEPS = [
  {
    title: "Créez votre compte",
    desc: "Gratuit. Les étudiants complètent leur profil : études, disponibilités, expériences.",
  },
  {
    title: "Publiez ou trouvez une mission",
    desc: "Le particulier décrit la mission, le lieu, la date et la rémunération. Tout est clair dès le départ.",
  },
  {
    title: "Discutez et choisissez",
    desc: "L'étudiant postule, la messagerie s'ouvre, le particulier accepte la candidature qui lui convient.",
  },
  {
    title: "Mission faite, avis laissé",
    desc: "Une fois la mission terminée, chacun note l'autre. Les avis restent visibles sur les profils.",
  },
];

const AUDIENCES = {
  student: {
    label: "Je suis étudiant",
    icon: GraduationCap,
    title: "Des jobs qui rentrent dans votre horaire",
    points: [
      "Des missions courtes, près de chez vous ou de votre campus",
      "La rémunération est affichée dans l'annonce, sans négociation",
      "Pas de CV : votre profil et vos avis parlent pour vous",
      "Vous choisissez vos missions, quand vous êtes disponible",
    ],
    cta: { href: "/auth/register", label: "Créer mon profil étudiant" },
  },
  client: {
    label: "Je cherche de l'aide",
    icon: Home,
    title: "Un coup de main, sans prise de tête",
    points: [
      "Publiez une annonce en quelques minutes",
      "Consultez le profil de chaque candidat avant de choisir",
      "Lisez les avis laissés après les missions précédentes",
      "Échangez dans la messagerie avant de confirmer",
    ],
    cta: { href: "/jobs/create", label: "Publier une annonce" },
  },
} as const;

/* ─────────────── COMPOSANTS ─────────────── */

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(rating) ? "fill-ink text-ink" : "fill-line text-line"}
        />
      ))}
    </div>
  );
}

function JobCard({ a }: { a: Annonce }) {
  return (
    <Link
      href={`/jobs/${a.id}`}
      className="card group flex h-full flex-col p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-ink"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">{a.titre}</h3>
        <ArrowUpRight size={18} className="shrink-0 text-muted transition-colors group-hover:text-ink" />
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{a.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <span className="chip !border-transparent !bg-lime-soft font-semibold !text-ink">
          <Euro size={12} /> {a.remuneration} €/h
        </span>
        {a.lieu && (
          <span className="chip">
            <MapPin size={12} /> {a.lieu}
          </span>
        )}
        {a.duree && (
          <span className="chip">
            <Clock size={12} /> {a.duree} h
          </span>
        )}
      </div>
    </Link>
  );
}

/* ─────────────── PAGE ─────────────── */

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [audience, setAudience] = useState<keyof typeof AUDIENCES>("student");
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
        setStats({
          users: u.data().count,
          annonces: a.data().count,
          finished: f.data().count,
          students: s.data().count,
        })
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
            .slice(0, 3)
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
          setRating({
            avg: rated.reduce((s, d) => s + (d.rating ?? 0), 0) / rated.length,
            count: rated.length,
          });
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

  const aud = AUDIENCES[audience];
  /* Les chiffres ne s'affichent qu'à partir d'une communauté significative */
  const statItems = stats && stats.users >= MIN_USERS_FOR_STATS
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
      <section className="container-w pb-16 pt-14 sm:pt-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1.25fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Petits jobs étudiants en Belgique
            </span>
            <h1 className="display mt-6 text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl">
              Un coup de main,
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">un étudiant</span>
                <span className="absolute inset-x-[-0.1em] bottom-[0.08em] z-0 h-[0.38em] -rotate-1 rounded-sm bg-lime" />
              </span>{" "}
              du coin.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2">
              Woppy met en relation des particuliers qui ont besoin d&apos;aide et des étudiants qui
              cherchent des missions courtes et rémunérées.
            </p>

            <form onSubmit={onSearch} className="mt-8 flex max-w-lg gap-2 rounded-full border border-line bg-white p-1.5 shadow-sm">
              <label className="flex flex-1 items-center gap-2 pl-3">
                <Search size={18} className="shrink-0 text-muted" />
                <span className="sr-only">Rechercher une mission</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Déménagement, cours, jardin…"
                  className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted"
                />
              </label>
              <button type="submit" className="btn btn-primary">
                Chercher
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid gap-3"
          >
            <Link
              href="/auth/register"
              className="group flex items-center justify-between rounded-[var(--radius-card)] bg-ink p-6 text-paper transition-transform hover:-translate-y-0.5"
            >
              <div>
                <GraduationCap size={22} className="text-lime" />
                <p className="mt-4 font-display text-2xl font-semibold tracking-tight">Je suis étudiant</p>
                <p className="mt-1 text-sm text-paper/70">Trouver des missions près de chez moi</p>
              </div>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/jobs/create"
              className="group flex items-center justify-between rounded-[var(--radius-card)] bg-brand p-6 text-white transition-transform hover:-translate-y-0.5"
            >
              <div>
                <Home size={22} />
                <p className="mt-4 font-display text-2xl font-semibold tracking-tight">Je cherche de l&apos;aide</p>
                <p className="mt-1 text-sm text-white/75">Publier une annonce gratuitement</p>
              </div>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Chiffres réels, affichés seulement s'ils sont disponibles */}
        {statItems.length > 0 && (
          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-4">
            {statItems.map((s) => (
              <div key={s.label} className="bg-paper px-5 py-5">
                <dt className="text-sm text-muted">{s.label}</dt>
                <dd className="display mt-1 text-3xl">{s.value.toLocaleString("fr-BE")}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* ══════════ ANNONCES RÉCENTES ══════════ */}
      <section id="jobs" className="border-y border-line bg-white py-20">
        <div className="container-w">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">En ce moment</p>
              <h2 className="display mt-2 text-3xl sm:text-4xl">Dernières missions publiées</h2>
            </div>
            <Link href="/jobs" className="btn btn-outline">
              Toutes les annonces <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {annonces === null &&
              [0, 1, 2].map((i) => <div key={i} className="card h-48 animate-pulse bg-paper-2" />)}
            {annonces?.map((a) => <JobCard key={a.id} a={a} />)}
          </div>

          {annonces?.length === 0 && (
            <div className="card mt-2 flex flex-col items-center gap-4 px-6 py-12 text-center">
              <p className="text-ink-2">Aucune mission ouverte pour l&apos;instant.</p>
              <Link href="/jobs/create" className="btn btn-brand">
                Publier la première
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ POUR QUI ══════════ */}
      <section className="container-w py-20">
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-line bg-white p-1" role="tablist">
            {(Object.keys(AUDIENCES) as (keyof typeof AUDIENCES)[]).map((key) => {
              const Icon = AUDIENCES[key].icon;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={audience === key}
                  onClick={() => setAudience(key)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5 ${
                    audience === key ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  <Icon size={16} /> {AUDIENCES[key].label}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          key={audience}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-10 grid max-w-5xl items-center gap-10 md:grid-cols-2"
        >
          <div>
            <h2 className="display text-4xl leading-tight sm:text-5xl">{aud.title}</h2>
            <Link href={aud.cta.href} className="btn btn-primary btn-lg mt-8">
              {aud.cta.label} <ArrowRight size={18} />
            </Link>
          </div>
          <ul className="grid gap-3">
            {aud.points.map((p, i) => (
              <li key={p} className="card flex items-start gap-4 p-5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lime text-xs font-bold">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-ink-2">{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* ══════════ COMMENT ÇA MARCHE ══════════ */}
      <section id="comment" className="bg-ink py-20 text-paper">
        <div className="container-w">
          <p className="eyebrow !text-paper/60">Comment ça marche</p>
          <h2 className="display mt-2 max-w-xl text-4xl !text-paper sm:text-5xl">Quatre étapes, pas une de plus.</h2>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-paper/10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-ink p-6">
                <span className="font-display text-5xl font-bold text-lime">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════ CONFIANCE ══════════ */}
      <section className="container-w py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: BadgeCheck,
              title: "Profils et avis publics",
              desc: "Études, expériences et avis reçus : vous savez à qui vous avez affaire.",
            },
            {
              icon: MessageSquare,
              title: "Messagerie intégrée",
              desc: "Posez vos questions et fixez les détails sans partager votre numéro.",
            },
            {
              icon: ShieldCheck,
              title: "Signalement et support",
              desc: "Un problème ? Signalez un message ou ouvrez un ticket, l'équipe vous répond.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand">
                <Icon size={20} />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ AVIS ══════════ */}
      {reviews.length > 0 && (
        <section id="avis" className="border-t border-line bg-white py-20">
          <div className="container-w">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Avis</p>
                <h2 className="display mt-2 text-3xl sm:text-4xl">Ce qu&apos;en disent les membres</h2>
              </div>
              {rating && (
                <div className="flex items-center gap-3">
                  <span className="display text-3xl">{rating.avg.toFixed(1).replace(".", ",")}</span>
                  <div>
                    <Stars rating={rating.avg} />
                    <p className="mt-1 text-xs text-muted">
                      sur {rating.count} avis
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {reviews.map((r) => (
                <figure key={r.id} className="card flex flex-col p-6">
                  <Stars rating={r.rating} />
                  <blockquote className="mt-4 flex-1 leading-relaxed text-ink-2">« {r.text} »</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
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
        <div className="relative overflow-hidden rounded-[2rem] bg-lime px-6 py-14 text-center sm:px-12 sm:py-20">
          <h2 className="display mx-auto max-w-2xl text-4xl leading-tight sm:text-6xl">On s&apos;y met ?</h2>
          <p className="mx-auto mt-4 max-w-md text-ink-2">L&apos;inscription est gratuite, pour les étudiants comme pour les particuliers.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Créer un compte <ArrowRight size={18} />
            </Link>
            <Link href="/jobs" className="btn btn-lg border border-ink/20 bg-transparent hover:border-ink">
              Voir les annonces
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
