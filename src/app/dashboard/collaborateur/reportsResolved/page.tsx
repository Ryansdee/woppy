'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { ArrowLeft, Ban, CheckCircle2, Flag, Loader2, ThumbsUp, Trash2 } from 'lucide-react';
import StaffShell from '@/components/staff/StaffShell';

interface ReportResolved {
  id: string;
  reporterId: string;
  senderId: string;
  chatId: string;
  text: string;
  decision: string;
  resolvedBy: string;
  resolvedAt?: { toDate?: () => Date };
}

const DECISIONS = {
  not_offensive: { icon: ThumbsUp, label: 'Pas offensif', badge: 'border-green-200 bg-green-50 text-green-700' },
  deleted: { icon: Trash2, label: 'Message supprimé', badge: 'border-line bg-paper-2 text-ink-2' },
  blocked: { icon: Ban, label: 'Auteur bloqué', badge: 'border-red-200 bg-red-50 text-danger' },
} as const;

type Filter = 'all' | keyof typeof DECISIONS;

export default function ReportsResolvedPage() {
  return (
    <StaffShell
      title="Historique de modération"
      description="Signalements traités et décision prise pour chacun."
      actions={
        <Link href="/dashboard/collaborateur" className="btn btn-outline">
          <ArrowLeft size={16} /> Signalements en cours
        </Link>
      }
    >
      {() => <History />}
    </StaffShell>
  );
}

function History() {
  const [reports, setReports] = useState<ReportResolved[] | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'reportsResolved'), orderBy('resolvedAt', 'desc')),
      (snap) => setReports(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReportResolved, 'id'>) }))),
      () => setReports([])
    );
  }, []);

  /* Noms des personnes citées */
  useEffect(() => {
    if (!reports) return;
    const missing = [...new Set(reports.flatMap((r) => [r.reporterId, r.senderId, r.resolvedBy]))].filter(
      (id) => id && !(id in names)
    );
    if (!missing.length) return;
    Promise.all(
      missing.map(async (id) => {
        const d = (await getDoc(doc(db, 'users', id))).data();
        const name = d ? d.displayName || [d.firstName, d.lastName].filter(Boolean).join(' ') : '';
        return [id, name || 'Utilisateur inconnu'] as const;
      })
    ).then((entries) => setNames((prev) => ({ ...prev, ...Object.fromEntries(entries) })));
  }, [reports, names]);

  const nameOf = (id: string) => names[id] ?? '…';
  const count = (f: Filter) => (f === 'all' ? reports?.length ?? 0 : reports?.filter((r) => r.decision === f).length ?? 0);
  const shown = filter === 'all' ? reports : reports?.filter((r) => r.decision === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Tout' },
    ...Object.entries(DECISIONS).map(([key, d]) => ({ key: key as Filter, label: d.label })),
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`btn ${filter === f.key ? 'btn-primary' : 'btn-outline'}`}
          >
            {f.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${filter === f.key ? 'bg-paper/15' : 'bg-paper-2'}`}>{count(f.key)}</span>
          </button>
        ))}
      </div>

      <section className="mt-6 space-y-3">
        {shown === null && (
          <p className="flex items-center gap-2 py-10 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Chargement…
          </p>
        )}
        {shown?.length === 0 && (
          <div className="card flex flex-col items-center gap-3 py-14 text-center">
            <CheckCircle2 size={28} className="text-success" />
            <p className="text-ink-2">{filter === 'all' ? 'Aucun signalement traité pour l’instant.' : 'Aucun signalement pour ce filtre.'}</p>
          </div>
        )}
        {shown?.map((r) => {
          const d = DECISIONS[r.decision as keyof typeof DECISIONS];
          const Icon = d?.icon ?? Flag;
          return (
            <article key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
                <p>
                  <span className="text-muted">Signalé par </span>
                  <span className="font-semibold">{nameOf(r.reporterId)}</span>
                  <span className="text-muted"> · message de </span>
                  <span className="font-semibold">{nameOf(r.senderId)}</span>
                </p>
                <span className={`chip ${d?.badge ?? ''}`}>
                  <Icon size={12} /> {d?.label ?? 'Traité'}
                </span>
              </div>
              <blockquote className="mt-3 whitespace-pre-line rounded-xl bg-paper-2 p-4 text-ink-2">{r.text}</blockquote>
              <p className="mt-3 text-xs text-muted">
                Traité par <span className="font-semibold text-ink-2">{nameOf(r.resolvedBy)}</span>
                {r.resolvedAt?.toDate && ` · ${r.resolvedAt.toDate().toLocaleString('fr-BE', { dateStyle: 'medium', timeStyle: 'short' })}`}
                <span className="ml-2 font-mono">chat {r.chatId}</span>
              </p>
            </article>
          );
        })}
      </section>
    </>
  );
}
