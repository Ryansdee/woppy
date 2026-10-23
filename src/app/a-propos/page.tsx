import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles, Code2, RotateCcw, CheckCircle2, Clock, Ear, Eye, GraduationCap,
  ShieldCheck, Lock, MessageCircle, ArrowRight, Heart,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'À propos — Woppy',
  description:
    "L'histoire de Woppy : une plateforme de jobs étudiants pensée en Belgique, reprise et développée par son créateur, à l'écoute des étudiants.",
};

const VIOLET = '#7357f6';

const working = [
  'Publication d\'annonces et candidatures en un clic',
  'Messagerie en temps réel entre étudiants et particuliers',
  'Notifications push pour ne rater aucune mission',
  'Profils étudiants publics : études, expériences, avis reçus',
  'Système d\'avis et de notation publics',
  'Carte des missions autour de chez toi',
];

const coming = [
  'Application Android disponible publiquement sur le Play Store',
  'Paiement intégré et sécurisé, dès que la structure juridique sera en place',
  'Vérification manuelle des cartes étudiantes',
  'Lancement ville par ville, avec des étudiants ambassadeurs',
  'Les fonctionnalités que vous me demanderez (oui, vraiment)',
];

const commitments = [
  {
    icon: Ear,
    title: 'L\'écoute avant tout',
    desc: 'Chaque message envoyé via la page contact est lu, par moi. Les idées, critiques et bugs remontés par les étudiants décident de ce que je développe ensuite.',
  },
  {
    icon: Eye,
    title: 'Une transparence totale',
    desc: 'Woppy est gratuit pendant la phase de lancement et ne prélève aucune commission. Si cela change un jour, vous serez prévenus avant, avec des chiffres clairs. Pas de frais cachés.',
  },
  {
    icon: GraduationCap,
    title: 'Le respect du statut étudiant',
    desc: 'Un job étudiant doit rester un complément, pas un piège. Woppy propose des missions courtes et rappelle les règles du travail étudiant (quota de 650 heures, impact fiscal) pour que chacun garde la main sur sa situation.',
  },
  {
    icon: ShieldCheck,
    title: 'La confiance des deux côtés',
    desc: 'Les profils et les avis sont publics, les avis sont modérés et seules les missions réellement terminées peuvent être évaluées. Un particulier doit pouvoir faire confiance, un étudiant doit être respecté.',
  },
  {
    icon: Lock,
    title: 'Des données protégées',
    desc: 'Vos données ne sont ni vendues ni louées. Elles servent uniquement à faire fonctionner la plateforme, dans le respect du RGPD.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      <style>{`
        
        .about-root, .about-root * { font-family: 'DM Sans', system-ui, sans-serif; }
        .about-root h1, .about-root h2, .about-root h3, .about-root .font-sora { font-family: var(--font-bricolage),system-ui, sans-serif; }
      `}</style>

      <div className="about-root">
        {/* ── Hero ── */}
        <section className="px-5 pt-16 pb-14 md:pt-24 md:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
              style={{ background: 'rgba(138,107,254,0.1)', color: VIOLET }}
            >
              <Sparkles size={14} /> À propos de Woppy
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-ink leading-tight tracking-tight mb-5">
              Une plateforme pensée pour les étudiants,
              <span style={{ color: VIOLET }}> construite à leur écoute.</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed max-w-2xl mx-auto">
              Woppy met en relation des étudiants à la recherche de petits jobs flexibles avec des
              particuliers qui ont besoin d&apos;un coup de main, près de chez eux. Voici comment
              le projet est né, pourquoi il continue, et ce que je m&apos;engage à faire.
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-5 pb-24 space-y-6">
          {/* ── Origine ── */}
          <article className="bg-white border border-line/70 rounded-2xl p-7 md:p-9">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(138,107,254,0.1)' }}>
                <Code2 size={20} style={{ color: VIOLET }} />
              </div>
              <h2 className="text-2xl font-bold text-ink">D&apos;où vient Woppy</h2>
            </div>
            <div className="space-y-4 text-ink-2 leading-relaxed">
              <p>
                Au départ, Woppy était un projet développé pour un client : un porteur d&apos;idée
                qui voulait créer une plateforme simple pour connecter les étudiants et les
                particuliers en Belgique.
              </p>
              <p>
                J&apos;ai conçu et développé l&apos;intégralité de la plateforme : le site, la base de
                données, la messagerie en temps réel, les notifications, le système d&apos;avis,
                l&apos;espace d&apos;administration et l&apos;application mobile. Chaque ligne de code
                de Woppy a été écrite ici, en Belgique.
              </p>
            </div>
          </article>

          {/* ── Reprise ── */}
          <article className="bg-white border border-line/70 rounded-2xl p-7 md:p-9">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(138,107,254,0.1)' }}>
                <RotateCcw size={20} style={{ color: VIOLET }} />
              </div>
              <h2 className="text-2xl font-bold text-ink">Pourquoi je reprends les rênes</h2>
            </div>
            <div className="space-y-4 text-ink-2 leading-relaxed">
              <p>
                Avec le temps, je n&apos;ai plus eu aucun retour de la part du client à l&apos;origine
                du projet. Pendant ce temps, Woppy, lui, tournait : de vraies missions ont été
                réalisées et les premiers particuliers ont laissé leur avis.
              </p>
              <p>
                Laisser tomber la plateforme aurait été injuste envers les étudiants et les
                particuliers qui lui avaient déjà fait confiance. J&apos;ai donc décidé de reprendre
                le projet en main et de le porter moi-même.
              </p>
              <p>
                Ma ligne directrice est simple : faire avancer Woppy <strong className="text-ink">dans le bon sens</strong>,
                pas le plus vite possible, et toujours en partant de ce dont les étudiants ont
                réellement besoin.
              </p>
            </div>
          </article>

          {/* ── État actuel ── */}
          <article className="bg-white border border-line/70 rounded-2xl p-7 md:p-9">
            <h2 className="text-2xl font-bold text-ink mb-2">Où en est Woppy, honnêtement</h2>
            <p className="text-muted mb-7 leading-relaxed">
              Pas de promesses en l&apos;air : voici ce qui fonctionne déjà et ce qui arrive.
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl p-5" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p className="font-sora font-bold text-emerald-700 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Disponible aujourd&apos;hui
                </p>
                <ul className="space-y-2.5">
                  {working.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'rgba(138,107,254,0.06)', border: '1px solid rgba(138,107,254,0.2)' }}>
                <p className="font-sora font-bold mb-4 flex items-center gap-2" style={{ color: VIOLET }}>
                  <Clock size={18} /> En préparation
                </p>
                <ul className="space-y-2.5">
                  {coming.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: VIOLET }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted leading-relaxed">
              Pendant la phase de lancement, l&apos;utilisation de Woppy est gratuite et le paiement
              de chaque mission se fait directement entre le particulier et l&apos;étudiant, une fois
              la mission terminée.
            </p>
          </article>

          {/* ── Engagements ── */}
          <section className="pt-6">
            <h2 className="text-2xl md:text-3xl font-bold text-ink mb-2 text-center">
              Mes engagements envers les étudiants
            </h2>
            <p className="text-muted text-center mb-8 max-w-xl mx-auto">
              Ce sont les règles que je me fixe pour chaque décision prise sur Woppy.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {commitments.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className={`bg-white border border-line/70 rounded-2xl p-6 ${i === commitments.length - 1 ? 'sm:col-span-2' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(138,107,254,0.1)' }}>
                    <Icon size={18} style={{ color: VIOLET }} />
                  </div>
                  <h3 className="font-bold text-ink mb-2">{title}</h3>
                  <p className="text-sm text-ink-2 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted text-center mt-5">
              Pour vérifier ta situation de job étudiant (heures restantes, impact fiscal) :{' '}
              <a
                href="https://www.studentatwork.be/fr/quota-heures-et-impact.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-brand"
              >
                Student@Work
              </a>
              , la plateforme officielle.
            </p>
          </section>

          {/* ── Mot du fondateur + CTA ── */}
          <section className="rounded-2xl p-8 md:p-10 text-white" style={{ background: 'linear-gradient(135deg, #7357f6 0%, #6a4fe0 100%)' }}>
            <Heart size={22} className="mb-4 opacity-90" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ta voix compte vraiment</h2>
            <p className="leading-relaxed text-white/90 mb-3">
              Woppy n&apos;est pas une grosse entreprise avec des équipes marketing. C&apos;est un projet
              porté par une seule personne, qui veut construire quelque chose d&apos;utile, avec
              les étudiants plutôt que pour eux.
            </p>
            <p className="leading-relaxed text-white/90 mb-8">
              Une idée, un problème, une mission qui s&apos;est mal passée, une fonctionnalité qui
              te manque ? Écris-moi. C&apos;est comme ça que Woppy avance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white font-semibold px-6 py-3 rounded-2xl hover:bg-brand-soft transition-colors"
                style={{ color: '#6a4fe0' }}
              >
                <MessageCircle size={17} /> Donner mon avis
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 font-semibold px-6 py-3 rounded-2xl hover:bg-white/10 transition-colors"
              >
                Voir les missions <ArrowRight size={17} />
              </Link>
            </div>
            <div className="pt-6 border-t border-white/20">
              <p className="font-sora font-bold">Ryan Deschuyteneer</p>
              <p className="text-sm text-white/75">Fondateur et développeur de Woppy</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}