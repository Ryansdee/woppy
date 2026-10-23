'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import StaffShell from '@/components/staff/StaffShell';

type Interest = 'yes' | 'no' | 'maybe' | '' ;

interface MarketSurveyDoc {
  id: string;
  status?: string;
  age?: string | null;
  city?: string | null;
  searchFrequency?: string | null;
  jobTypes: string[];
  mainDifficulties: string[];
  interest: Interest;
  expectedFeatures: string[];
  customFeature?: string | null;
  devices: string[];
  discovery?: string | null;
  comment?: string | null;
  createdAt?: Timestamp | null;
}

export default function MarketSurveyDashboardPage() {
  return (
    <StaffShell adminOnly title="Enquête de marché" description="Réponses au formulaire d’enquête : intérêt, profil, fonctionnalités demandées.">
      {() => <MarketSurvey />}
    </StaffShell>
  );
}

function MarketSurvey() {
  const [data, setData] = useState<MarketSurveyDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'woppyMarketSurvey'),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: MarketSurveyDoc[] = snap.docs.map((doc) => {
          const d = doc.data() as any;

          return {
            id: doc.id,
            status: d.status ?? '',
            age: d.age ?? null,
            city: d.city ?? null,
            searchFrequency: d.searchFrequency ?? null,
            jobTypes: Array.isArray(d.jobTypes) ? d.jobTypes : [],
            mainDifficulties: Array.isArray(d.mainDifficulties)
              ? d.mainDifficulties
              : [],
            interest: (d.interest as Interest) ?? '',
            expectedFeatures: Array.isArray(d.expectedFeatures)
              ? d.expectedFeatures
              : [],
            customFeature: d.customFeature ?? null,
            devices: Array.isArray(d.devices) ? d.devices : [],
            discovery: d.discovery ?? null,
            comment: d.comment ?? null,
            createdAt: d.createdAt ?? null,
          };
        });

        setData(list);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur snapshot woppyMarketSurvey:', err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  // === MÉTRIQUES ===
  const stats = useMemo(() => {
    const total = data.length;
    let yes = 0;
    let no = 0;
    let maybe = 0;

    const byStatus: Record<string, number> = {};
    const featureCount: Record<string, number> = {};

    data.forEach((r) => {
      // Intérêt
      if (r.interest === 'yes') yes++;
      else if (r.interest === 'no') no++;
      else if (r.interest === 'maybe') maybe++;

      // Situation
      if (r.status) {
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      }

      // Features “pré-définies”
      r.expectedFeatures.forEach((f) => {
        featureCount[f] = (featureCount[f] || 0) + 1;
      });

      // On peut aussi compter les customFeature
      if (r.customFeature && r.customFeature.trim().length > 0) {
        featureCount[`[Custom] ${r.customFeature}`] =
          (featureCount[`[Custom] ${r.customFeature}`] || 0) + 1;
      }
    });

    const pct = (n: number) => (total ? Math.round((n * 100) / total) : 0);

    const topFeatures = Object.entries(featureCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);

    const statusEntries = Object.entries(byStatus).sort(
      (a, b) => b[1] - a[1],
    );

    return {
      total,
      yes,
      no,
      maybe,
      yesPct: pct(yes),
      noPct: pct(no),
      maybePct: pct(maybe),
      topFeatures,
      statusEntries,
    };
  }, [data]);

  const formatDate = (ts?: Timestamp | null) => {
    if (!ts) return '-';
    const d = ts.toDate();
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div>
        <p className="mb-6 text-sm text-muted">
          Total des réponses : <span className="font-semibold text-ink">{stats.total}</span>
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2 text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Chargement des réponses...</span>
            </div>
          </div>
        ) : (
          <>
            {/* SECTION : KPIs */}
            <section className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-2xl border border-line bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Intéressé par Woppy
                </p>
                <p className="mt-2 text-3xl font-semibold text-emerald-600">
                  {stats.yes}
                </p>
                <p className="text-xs text-muted mt-1">
                  {stats.yesPct}% des répondants
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Mitigé
                </p>
                <p className="mt-2 text-3xl font-semibold text-amber-600">
                  {stats.maybe}
                </p>
                <p className="text-xs text-muted mt-1">
                  {stats.maybePct}% des répondants
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Pas intéressé
                </p>
                <p className="mt-2 text-3xl font-semibold text-rose-600">
                  {stats.no}
                </p>
                <p className="text-xs text-muted mt-1">
                  {stats.noPct}% des répondants
                </p>
              </div>
            </section>

            {/* SECTION : PROFIL + FEATURES */}
            <section className="grid gap-4 lg:grid-cols-3 mb-8">
              {/* Profil par statut */}
              <div className="rounded-2xl border border-line bg-white p-4 lg:col-span-1">
                <h2 className="text-sm font-semibold mb-2">
                  Répartition par statut
                </h2>
                {stats.statusEntries.length === 0 ? (
                  <p className="text-xs text-muted">
                    Pas encore assez de données.
                  </p>
                ) : (
                  <ul className="space-y-1 text-xs">
                    {stats.statusEntries.map(([status, count]) => (
                      <li
                        key={status}
                        className="flex items-center justify-between border-b border-line pb-1 last:border-none"
                      >
                        <span className="capitalize text-ink">
                          {statusLabel(status)}
                        </span>
                        <span className="text-muted font-medium">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Top features */}
              <div className="rounded-2xl border border-line bg-white p-4 lg:col-span-2">
                <h2 className="text-sm font-semibold mb-2">
                  Features les plus demandées
                </h2>
                {stats.topFeatures.length === 0 ? (
                  <p className="text-xs text-muted">
                    Pas encore de réponses avec des fonctionnalités.
                  </p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {stats.topFeatures.map(([feature, count]) => (
                      <li
                        key={feature}
                        className="flex items-center justify-between rounded-xl bg-white border border-line px-3 py-2"
                      >
                        <span className="text-ink">
                          {feature}
                        </span>
                        <span className="text-brand font-semibold">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* SECTION : TABLEAU DES RÉPONSES */}
            <section className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">
                  Détail des réponses ({stats.total})
                </h2>
                <p className="text-[11px] text-muted">
                  Les plus récentes en premier
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted">
                        Statut
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted">
                        Ville
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted">
                        Intérêt
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted">
                        Job / difficultés
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted">
                        Features
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted">
                        Commentaire
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t border-line hover:bg-white"
                      >
                        <td className="align-top px-3 py-2 text-muted whitespace-nowrap">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="align-top px-3 py-2 text-ink whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="capitalize">
                              {statusLabel(r.status || '')}
                            </span>
                            {r.age && (
                              <span className="text-[11px] text-muted">
                                {r.age} ans
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="align-top px-3 py-2 text-muted whitespace-nowrap">
                          {r.city || '-'}
                        </td>
                        <td className="align-top px-3 py-2">
                          <InterestBadge interest={r.interest} />
                          {r.searchFrequency && (
                            <p className="text-[11px] text-muted mt-1">
                              Fréquence : {frequencyLabel(r.searchFrequency)}
                            </p>
                          )}
                        </td>
                        <td className="align-top px-3 py-2 text-ink">
                          {r.jobTypes.length > 0 && (
                            <p className="mb-1">
                              <span className="text-[11px] text-muted">
                                Types :
                              </span>{' '}
                              <span className="text-[11px]">
                                {r.jobTypes.join(', ')}
                              </span>
                            </p>
                          )}
                          {r.mainDifficulties.length > 0 && (
                            <ul className="list-disc list-inside text-[11px] text-muted space-y-0.5">
                              {r.mainDifficulties.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="align-top px-3 py-2 text-ink">
                          {r.expectedFeatures.length > 0 && (
                            <ul className="list-disc list-inside text-[11px] text-muted space-y-0.5">
                              {r.expectedFeatures.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          )}
                          {r.customFeature && (
                            <p className="mt-1 text-[11px] text-brand">
                              + {r.customFeature}
                            </p>
                          )}
                          {r.devices.length > 0 && (
                            <p className="mt-1 text-[10px] text-muted">
                              Devices : {r.devices.join(', ')}
                            </p>
                          )}
                        </td>
                        <td className="align-top px-3 py-2 text-muted max-w-xs">
                          {r.comment ? (
                            <p className="text-[11px] whitespace-pre-wrap">
                              {r.comment}
                            </p>
                          ) : (
                            <span className="text-[11px] text-muted">
                              —
                            </span>
                          )}
                          {r.discovery && (
                            <p className="mt-1 text-[10px] text-muted">
                              Via : {r.discovery}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}

                    {data.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-3 py-6 text-center text-sm text-muted"
                        >
                          Aucune réponse pour l&apos;instant.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/* === Composants utilitaires === */

function InterestBadge({ interest }: { interest: Interest }) {
  if (!interest) return <span className="text-xs text-muted">-</span>;

  const map: Record<
    Interest,
    { label: string; className: string }
  > = {
    '': { label: '-', className: 'bg-paper-2 text-muted' },
    yes: {
      label: 'Intéressé(e)',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    maybe: {
      label: 'Mitigé(e)',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    no: {
      label: 'Pas intéressé(e)',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  };

  const cfg = map[interest];

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function statusLabel(statusRaw: string) {
  switch (statusRaw) {
    case 'highschool':
      return 'Lycéen(ne)';
    case 'university':
      return 'Étudiant(e) supérieur';
    case 'apprentice':
      return 'Alternant(e) / apprentissage';
    case 'lookingJob':
      return 'En recherche de job';
    case 'employer':
      return 'Employeur / recruteur';
    case 'other':
      return 'Autre';
    default:
      return statusRaw || '-';
  }
}

function frequencyLabel(freqRaw: string) {
  switch (freqRaw) {
    case 'rarely':
      return 'Rarement';
    case 'sometimes':
      return 'De temps en temps';
    case 'often':
      return 'Souvent';
    case 'always':
      return 'Quasiment tous les jours';
    default:
      return '-';
  }
}
