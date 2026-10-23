'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, getDocs, collection, query,
  where, orderBy, updateDoc, onSnapshot,
  deleteDoc, addDoc, serverTimestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import {
  Loader2, Check, X, ZoomIn, Flag, Trash2, Ban, ThumbsUp,
  UserCheck, History, CheckCircle2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import StaffShell from '@/components/staff/StaffShell';

interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  blocked?: boolean;
  studentProfile?: {
    cardURL?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
  };
}

interface ReportData {
  id: string;
  reporterId: string;
  senderId: string;
  text: string;
  chatId: string;
  messageId: string;
  createdAt?: { toDate?: () => Date };
}

type Decision = 'not_offensive' | 'deleted' | 'blocked';

const fullName = (u?: UserData) => (u ? [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Sans nom' : '…');

export default function CollaborateurPage() {
  return (
    <StaffShell
      title="Modération"
      description="Cartes étudiantes à vérifier et messages signalés par les utilisateurs."
      actions={
        <Link href="/dashboard/collaborateur/reportsResolved" className="btn btn-outline">
          <History size={16} /> Historique
        </Link>
      }
    >
      {({ user }) => <Moderation me={user} />}
    </StaffShell>
  );
}

function Moderation({ me }: { me: User }) {
  const [pendingCards, setPendingCards] = useState<UserData[] | null>(null);
  const [reports, setReports] = useState<ReportData[] | null>(null);
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tab, setTab] = useState<'reports' | 'cards'>('reports');

  /* Cartes en attente */
  useEffect(() => {
    getDocs(query(collection(db, 'users'), where('studentProfile.verificationStatus', '==', 'pending')))
      .then((snap) => setPendingCards(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserData, 'id'>) }))))
      .catch(() => setPendingCards([]));
  }, []);

  /* Signalements en temps réel, écouteur arrêté au démontage */
  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'reports'), orderBy('createdAt', 'desc')),
      (snap) => setReports(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReportData, 'id'>) }))),
      () => setReports([])
    );
  }, []);

  /* Noms des personnes impliquées dans les signalements */
  useEffect(() => {
    if (!reports) return;
    const missing = [...new Set(reports.flatMap((r) => [r.reporterId, r.senderId]))].filter((id) => id && !users[id]);
    if (!missing.length) return;
    Promise.all(
      missing.map(async (id) => {
        const snap = await getDoc(doc(db, 'users', id));
        return [id, { id, ...(snap.data() as Omit<UserData, 'id'> | undefined) }] as const;
      })
    ).then((entries) => setUsers((prev) => ({ ...prev, ...Object.fromEntries(entries) })));
  }, [reports, users]);

  const run = async (key: string, action: () => Promise<void>, success: string) => {
    setBusy(key);
    setNotice(null);
    try {
      await action();
      setNotice({ kind: 'ok', text: success });
    } catch {
      setNotice({ kind: 'error', text: 'L’action a échoué. Vérifiez vos droits et réessayez.' });
    } finally {
      setBusy(null);
    }
  };

  /* Chaque décision est archivée dans reportsResolved avant de fermer le signalement */
  const resolve = async (r: ReportData, decision: Decision) => {
    await addDoc(collection(db, 'reportsResolved'), {
      ...r,
      resolvedAt: serverTimestamp(),
      resolvedBy: me.uid,
      decision,
    });
    await deleteDoc(doc(db, 'reports', r.id));
  };

  const decideCard = (u: UserData, decision: 'verified' | 'rejected') => {
    if (!confirm(`${decision === 'verified' ? 'Accepter' : 'Refuser'} la carte de ${fullName(u)} ?`)) return;
    run(u.id, async () => {
      await updateDoc(doc(db, 'users', u.id), { 'studentProfile.verificationStatus': decision });
      setPendingCards((prev) => prev?.filter((p) => p.id !== u.id) ?? null);
    }, decision === 'verified' ? 'Carte acceptée.' : 'Carte refusée.');
  };

  const deleteMessage = (r: ReportData) => {
    if (!confirm('Supprimer ce message définitivement ?')) return;
    run(r.id, async () => {
      await deleteDoc(doc(db, 'chats', r.chatId, 'messages', r.messageId));
      await resolve(r, 'deleted');
    }, 'Message supprimé et signalement archivé.');
  };

  const blockSender = (r: ReportData) => {
    if (!confirm(`Bloquer ${fullName(users[r.senderId])} ?`)) return;
    run(r.id, async () => {
      await updateDoc(doc(db, 'users', r.senderId), { blocked: true });
      await resolve(r, 'blocked');
    }, 'Utilisateur bloqué et signalement archivé.');
  };

  const notOffensive = (r: ReportData) => {
    if (!confirm('Classer ce message comme non offensif ?')) return;
    run(r.id, () => resolve(r, 'not_offensive'), 'Signalement classé sans suite.');
  };

  const tabs = [
    { key: 'reports' as const, label: 'Signalements', icon: Flag, count: reports?.length ?? 0 },
    { key: 'cards' as const, label: 'Cartes étudiantes', icon: UserCheck, count: pendingCards?.length ?? 0 },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2" role="tablist">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`btn ${tab === key ? 'btn-primary' : 'btn-outline'}`}
          >
            <Icon size={16} /> {label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${tab === key ? 'bg-paper/15' : 'bg-paper-2'}`}>{count}</span>
          </button>
        ))}
      </div>

      {notice && (
        <p
          role="status"
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            notice.kind === 'ok' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* ── Signalements ── */}
      {tab === 'reports' && (
        <section className="mt-6 space-y-3">
          {reports === null && <Loading />}
          {reports?.length === 0 && <Empty text="Aucun signalement en attente." />}
          {reports?.map((r) => (
            <article key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
                <p>
                  <span className="text-muted">Signalé par </span>
                  <span className="font-semibold">{fullName(users[r.reporterId])}</span>
                  <span className="text-muted"> · message de </span>
                  <span className="font-semibold">{fullName(users[r.senderId])}</span>
                  {users[r.senderId]?.blocked && <span className="chip ml-2 !border-red-200 !text-danger">bloqué</span>}
                </p>
                <time className="text-xs text-muted">
                  {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('fr-BE') : '—'}
                </time>
              </div>
              <blockquote className="mt-3 whitespace-pre-line rounded-xl bg-paper-2 p-4 text-ink-2">{r.text}</blockquote>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button disabled={busy === r.id} onClick={() => notOffensive(r)} className="btn btn-outline">
                  <ThumbsUp size={15} /> Pas offensif
                </button>
                <button disabled={busy === r.id} onClick={() => deleteMessage(r)} className="btn btn-outline !text-danger hover:!border-danger">
                  <Trash2 size={15} /> Supprimer le message
                </button>
                <button disabled={busy === r.id} onClick={() => blockSender(r)} className="btn bg-danger text-white hover:bg-red-700">
                  <Ban size={15} /> Bloquer l’auteur
                </button>
                {busy === r.id && <Loader2 size={16} className="animate-spin text-muted" />}
                <span className="ml-auto font-mono text-[11px] text-muted">chat {r.chatId}</span>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* ── Cartes étudiantes ── */}
      {tab === 'cards' && (
        <section className="mt-6 space-y-3">
          <p className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-muted">
            Aucun parcours ne met encore un profil en attente : cette liste restera vide tant que l’envoi de la carte
            étudiante n’est pas construit (voir le rapport d’incident n° 9).
          </p>
          {pendingCards === null && <Loading />}
          {pendingCards?.length === 0 && <Empty text="Aucune carte en attente de vérification." />}
          {pendingCards?.map((u) => (
            <article key={u.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              {u.studentProfile?.cardURL ? (
                <button
                  onClick={() => setPreview(u.studentProfile!.cardURL!)}
                  className="group relative shrink-0 self-start overflow-hidden rounded-xl border border-line"
                  aria-label="Agrandir la carte"
                >
                  <Image src={u.studentProfile.cardURL} alt="Carte étudiante" width={160} height={100} className="object-cover" />
                  <span className="absolute inset-0 grid place-items-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="text-white" size={22} />
                  </span>
                </button>
              ) : (
                <div className="grid h-[100px] w-[160px] shrink-0 place-items-center rounded-xl border border-dashed border-line text-xs text-muted">
                  Pas d’image
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold">{fullName(u)}</p>
                <p className="mt-1 font-mono text-[11px] text-muted">{u.id}</p>
              </div>
              <div className="flex gap-2">
                <button disabled={busy === u.id} onClick={() => decideCard(u, 'verified')} className="btn btn-primary">
                  <Check size={15} /> Accepter
                </button>
                <button disabled={busy === u.id} onClick={() => decideCard(u, 'rejected')} className="btn btn-outline">
                  <X size={15} /> Refuser
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-ink/70 p-5 backdrop-blur-sm"
            onClick={() => setPreview(null)}
          >
            <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <Image src={preview} alt="Carte étudiante" width={1200} height={800} className="max-h-[85vh] w-full rounded-2xl object-contain" />
              <button
                onClick={() => setPreview(null)}
                aria-label="Fermer"
                className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full bg-white shadow-lg"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Loading() {
  return (
    <p className="flex items-center gap-2 py-10 text-sm text-muted">
      <Loader2 size={16} className="animate-spin" /> Chargement…
    </p>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-14 text-center">
      <CheckCircle2 size={28} className="text-success" />
      <p className="text-ink-2">{text}</p>
    </div>
  );
}
