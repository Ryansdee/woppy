'use client';

import { useEffect, useState } from 'react';
import {
  collection, query, orderBy, addDoc, getDocs,
  where, serverTimestamp, writeBatch, doc,
} from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import {
  Calendar, Sparkles, GitCommit, RefreshCw,
  ExternalLink, ChevronRight, ChevronDown, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const GITHUB_OWNER  = 'Ryansdee';
const GITHUB_REPO   = 'woppy';

/* ── Tag par préfixe conventionnel ── */
function parseCommit(msg: string): { tag: string; cls: string } {
  const m = msg.trim().toLowerCase();
  if (m.startsWith('feat'))  return { tag: 'Nouveauté',   cls: 'bg-violet-50 text-violet-700 border-violet-200' };
  if (m.startsWith('fix'))   return { tag: 'Correctif',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (m.startsWith('perf'))  return { tag: 'Performance', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (m.startsWith('style')) return { tag: 'Interface',   cls: 'bg-pink-50 text-pink-700 border-pink-200' };
  if (m.startsWith('chore')) return { tag: 'Maintenance', cls: 'bg-slate-100 text-slate-600 border-slate-200' };
  if (m.startsWith('docs'))  return { tag: 'Doc',         cls: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (m.startsWith('refactor')) return { tag: 'Refacto',  cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
  return { tag: 'Mise à jour', cls: 'bg-violet-50 text-violet-700 border-violet-200' };
}

const FILE_STATUS: Record<string, { label: string; cls: string }> = {
  added:    { label: 'A', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  modified: { label: 'M', cls: 'bg-blue-50 border-blue-200 text-blue-700' },
  removed:  { label: 'D', cls: 'bg-red-50 border-red-200 text-red-700' },
  renamed:  { label: 'R', cls: 'bg-amber-50 border-amber-200 text-amber-700' },
};

/* ══════════════════════════════════════════════════════════ */
export default function UpdatesPage() {
  const [snapshot, loading] = useCollection(
    query(collection(db, 'updates'), orderBy('commitDate', 'desc'))
  );
  const [syncing, setSyncing]       = useState(false);
  const [syncMsg, setSyncMsg]       = useState('');
  const [syncType, setSyncType]     = useState<'idle'|'success'|'already'|'error'>('idle');
  const [expanded, setExpanded]     = useState<Record<string, boolean>>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]       = useState(true);
  const [page, setPage]             = useState(1);

  useEffect(() => { syncAll(false); }, []);

  /* ── Sync tous les commits (toutes pages) ── */
  async function syncAll(manual = true) {
    setSyncing(true);
    setSyncType('idle');
    setSyncMsg('Récupération des commits…');

    let totalNew = 0;
    let currentPage = 1;
    let hasNext = true;

    try {
      while (hasNext) {
        setSyncMsg(`Page ${currentPage} en cours…`);

        const res = await fetch(`/api/github-sync?page=${currentPage}`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        const commits: any[] = data.commits ?? [];
        hasNext = data.hasNext;

        if (commits.length === 0) break;

        /* Vérifie les SHA déjà en base par batch */
        const shas = commits.map((c: any) => c.sha);
        const existing = await getDocs(
          query(collection(db, 'updates'), where('commitSha', 'in', shas))
        );
        const existingShas = new Set(existing.docs.map(d => d.data().commitSha));

        /* Nouveaux commits à ajouter */
        const newCommits = commits.filter((c: any) => !existingShas.has(c.sha));

        if (newCommits.length === 0) {
          // Tous les commits de cette page sont déjà en base
          // Si on est à la page 1, on peut arrêter (historique déjà complet)
          if (currentPage === 1 && manual === false) {
            hasNext = false;
          } else {
            hasNext = false; // arrête — le reste est déjà synced
          }
          break;
        }

        /* Écrit en batch Firestore (max 500 par batch) */
        const batch = writeBatch(db);
        for (const c of newCommits) {
          const message = c.commit?.message?.split('\n')[0] ?? '';
          const { tag, cls } = parseCommit(message);
          const ref = doc(collection(db, 'updates'));
          batch.set(ref, {
            commitSha:   c.sha,
            commitUrl:   c.html_url,
            title:       message,
            commitDate:  c.commit?.author?.date ?? new Date().toISOString(),
            date:        new Date(c.commit?.author?.date ?? Date.now())
              .toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' }),
            version:     c.sha?.slice(0, 7) ?? '',
            status:      tag,
            statusColor: cls,
            authorName:  c.commit?.author?.name ?? '',
            authorAvatar: c.author?.avatar_url ?? null,
            stats:       c.stats ?? null,
            files:       c.files ?? [],
            createdAt:   serverTimestamp(),
            source:      'github',
          });
          totalNew++;
        }
        await batch.commit();

        currentPage++;
        if (!hasNext) break;
      }

      if (totalNew === 0) {
        setSyncType('already');
        setSyncMsg('Déjà à jour — aucun nouveau commit');
      } else {
        setSyncType('success');
        setSyncMsg(`${totalNew} commit${totalNew > 1 ? 's' : ''} synchronisé${totalNew > 1 ? 's' : ''}`);
      }
    } catch (err: any) {
      console.error(err);
      setSyncType('error');
      setSyncMsg(`Erreur : ${err.message}`);
    }

    setSyncing(false);
  }

  const toggleExpand = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const docs = snapshot?.docs ?? [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        .mono { font-family: 'Geist Mono', 'Fira Code', monospace; }
      `}</style>

      <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/images/logo.png" alt="Woppy" width={24} height={24} className="rounded-xl" />
                <span className="font-bold text-sm text-violet-600" style={{ fontFamily: 'Sora, system-ui' }}>woppy</span>
              </Link>
              <span className="text-slate-300 mx-0.5">/</span>
              <span className="text-sm font-semibold text-slate-500">updates</span>
            </div>
            <button onClick={() => syncAll(true)} disabled={syncing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-all disabled:opacity-50">
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sync…' : 'Sync GitHub'}
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* ── Header ── */}
          <div className="mb-8">
            <h1 className="font-bold text-2xl text-slate-900 tracking-tight mb-1"
              style={{ fontFamily: 'Sora, system-ui' }}>
              Historique des commits
            </h1>
            <p className="text-sm text-slate-500">
              Tous les déploiements et modifications de Woppy, synchronisés depuis GitHub.
            </p>

            {/* Sync feedback */}
            {syncType !== 'idle' && (
              <div className={`mt-3 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
                syncType === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                syncType === 'already' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                syncType === 'error'   ? 'bg-red-50 text-red-700 border-red-200' : ''
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  syncType === 'success' ? 'bg-emerald-500' :
                  syncType === 'already' ? 'bg-slate-400' : 'bg-red-500'
                }`} />
                {syncing ? <><Loader2 size={11} className="animate-spin" /> {syncMsg}</> : syncMsg}
              </div>
            )}

            {syncing && (
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                <Loader2 size={11} className="animate-spin" /> {syncMsg}
              </div>
            )}

            {/* Compteur */}
            {!loading && docs.length > 0 && (
              <p className="mt-2 text-xs text-slate-400 mono">{docs.length} commits chargés</p>
            )}
          </div>

          {/* ── Liste ── */}
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center animate-pulse">
                <Sparkles size={16} className="text-white" />
              </div>
              <p className="text-sm text-slate-500">Chargement…</p>
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <GitCommit size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Aucun commit</p>
              <p className="text-xs text-slate-400 mb-4">Clique sur "Sync GitHub" pour importer l'historique.</p>
              <button onClick={() => syncAll(true)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition">
                <RefreshCw size={12} /> Synchroniser maintenant
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {docs.map(docSnap => {
                const u      = docSnap.data();
                const isOpen = expanded[docSnap.id] ?? false;
                const { tag, cls } = parseCommit(u.title ?? '');
                const hasFiles = u.files && u.files.length > 0;

                return (
                  <div key={docSnap.id}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-violet-200 transition-colors">

                    {/* ── Header ligne ── */}
                    <div className="flex items-center gap-3 px-5 py-4"
                      onClick={() => hasFiles && toggleExpand(docSnap.id)}
                      style={{ cursor: hasFiles ? 'pointer' : 'default' }}>

                      {/* Avatar auteur */}
                      {u.authorAvatar
                        ? <img src={u.authorAvatar} alt="" className="w-7 h-7 rounded-lg border border-slate-200 shrink-0" />
                        : <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                            <GitCommit size={13} className="text-violet-500" />
                          </div>
                      }

                      {/* Titre + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate"
                          style={{ fontFamily: 'Sora, system-ui' }}>
                          {u.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="mono text-[10px] text-slate-400">{u.version}</span>
                          <span className="text-slate-200">·</span>
                          <Calendar size={9} className="text-slate-400" />
                          <span className="text-[11px] text-slate-400">{u.date}</span>
                          {u.authorName && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="text-[11px] text-slate-400">{u.authorName}</span>
                            </>
                          )}
                          {u.stats && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="mono text-[10px] text-emerald-600 font-semibold">+{u.stats.additions}</span>
                              <span className="mono text-[10px] text-red-500 font-semibold">-{u.stats.deletions}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Badges + actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-flex ${u.statusColor || cls}`}>
                          {u.status ?? tag}
                        </span>
                        {u.commitUrl && (
                          <a href={u.commitUrl} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-slate-400 hover:text-violet-600 transition-colors">
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {hasFiles && (
                          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </div>

                    {/* ── Détail fichiers (collapsible) ── */}
                    {isOpen && hasFiles && (
                      <div className="border-t border-slate-50 px-5 py-4">

                        {/* Stats bar */}
                        {u.stats && (
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full"
                                style={{ width: `${Math.round((u.stats.additions / Math.max(u.stats.total, 1)) * 100)}%` }} />
                            </div>
                            <span className="mono text-[10px] text-slate-400 shrink-0">
                              {u.stats.additions}+ / {u.stats.deletions}− / {u.stats.total} total
                            </span>
                          </div>
                        )}

                        {/* Fichiers */}
                        <div className="space-y-0.5">
                          {u.files.map((file: any, i: number) => {
                            const fStatus = FILE_STATUS[file.status] ?? FILE_STATUS.modified;
                            const parts   = file.filename.split('/');
                            const fname   = parts.pop();
                            const fdir    = parts.join('/');
                            return (
                              <div key={i} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center border shrink-0 ${fStatus.cls}`}>
                                  {fStatus.label}
                                </span>
                                <span className="mono text-[11px] flex-1 truncate">
                                  {fdir && <span className="text-slate-400">{fdir}/</span>}
                                  <span className="text-slate-800 font-medium">{fname}</span>
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {file.additions > 0 && <span className="mono text-[10px] text-emerald-600 font-semibold">+{file.additions}</span>}
                                  {file.deletions > 0 && <span className="mono text-[10px] text-red-500 font-semibold">-{file.deletions}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Footer ── */}
          <p className="text-center text-xs text-slate-400 mt-10">
            Synchronisé depuis{' '}
            <a href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`}
              target="_blank" rel="noopener noreferrer"
              className="text-violet-600 hover:underline mono">
              {GITHUB_OWNER}/{GITHUB_REPO}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}