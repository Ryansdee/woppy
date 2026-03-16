'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, addDoc, getDocs, where, serverTimestamp } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import {
  Calendar, Sparkles, MessageCircle, Layout, ShieldCheck,
  Wrench, HelpCircle, GitCommit, RefreshCw, ExternalLink,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/* ── Config GitHub ── */
const GITHUB_OWNER = 'ton-username';   // ← remplace par ton username GitHub
const GITHUB_REPO  = 'woppy';          // ← remplace par ton repo
const GITHUB_BRANCH = 'main';          // ← ou 'master' selon ton repo

const iconMap: Record<string, any> = {
  message:  MessageCircle,
  mobile:   Layout,
  chat:     ShieldCheck,
  wrench:   Wrench,
  commit:   GitCommit,
};

/* ── Catégories de commit par préfixe ── */
function parseCommitMessage(msg: string): { title: string; tag: string; tagColor: string } {
  const m = msg.trim();
  if (m.startsWith('feat'))   return { title: m, tag: 'Nouveauté',   tagColor: 'bg-violet-50 text-violet-700 border-violet-200' };
  if (m.startsWith('fix'))    return { title: m, tag: 'Correctif',   tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (m.startsWith('perf'))   return { title: m, tag: 'Performance', tagColor: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (m.startsWith('style'))  return { title: m, tag: 'Interface',   tagColor: 'bg-pink-50 text-pink-700 border-pink-200' };
  if (m.startsWith('chore'))  return { title: m, tag: 'Maintenance', tagColor: 'bg-slate-100 text-slate-600 border-slate-200' };
  if (m.startsWith('docs'))   return { title: m, tag: 'Doc',         tagColor: 'bg-amber-50 text-amber-700 border-amber-200' };
  return { title: m, tag: 'Mise à jour', tagColor: 'bg-violet-50 text-violet-700 border-violet-200' };
}

export default function UpdatesPage() {
  const [snapshot, loading] = useCollection(
    query(collection(db, 'updates'), orderBy('date', 'desc'))
  );
  const [syncing, setSyncing]         = useState(false);
  const [syncStatus, setSyncStatus]   = useState<'idle' | 'success' | 'already' | 'error'>('idle');
  const [latestCommit, setLatestCommit] = useState<any>(null);

  /* ── Sync automatique au chargement ── */
  useEffect(() => { syncLatestCommit(false); }, []);

  async function syncLatestCommit(manual = true) {
    setSyncing(true);
    setSyncStatus('idle');
    try {
      /* 1. Récupère le dernier commit GitHub */
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${GITHUB_BRANCH}`,
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );
      if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
      const commit = await res.json();
      setLatestCommit(commit);

      const sha      = commit.sha as string;
      const message  = commit.commit.message.split('\n')[0]; // première ligne seulement
      const authorName = commit.commit.author.name;
      const authorAvatar = commit.author?.avatar_url ?? null;
      const commitDate = commit.commit.author.date;
      const commitUrl  = commit.html_url;

      /* 2. Vérifie si ce commit est déjà dans Firestore */
      const existing = await getDocs(
        query(collection(db, 'updates'), where('commitSha', '==', sha))
      );
      if (!existing.empty) {
        setSyncStatus('already');
        setSyncing(false);
        return;
      }

      /* 3. Ajoute l'entrée dans Firestore */
      const { tag, tagColor } = parseCommitMessage(message);
      await addDoc(collection(db, 'updates'), {
        commitSha:    sha,
        commitUrl,
        title:        message,
        date:         new Date(commitDate).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' }),
        version:      sha.slice(0, 7),
        status:       tag,
        statusColor:  tagColor,
        authorName,
        authorAvatar,
        sections: [
          {
            icon: 'commit',
            title: 'Modifications',
            items: [message],
          },
        ],
        createdAt: serverTimestamp(),
        source: 'github',
      });

      setSyncStatus('success');
    } catch (err) {
      console.error('GitHub sync error:', err);
      setSyncStatus('error');
    }
    setSyncing(false);
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Geist+Mono:wght@400;500&display=swap');
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
            <button onClick={() => syncLatestCommit(true)} disabled={syncing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-all disabled:opacity-50">
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Synchronisation…' : 'Sync GitHub'}
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* ── Page header ── */}
          <div className="mb-8">
            <h1 className="font-bold text-2xl text-slate-900 tracking-tight mb-1" style={{ fontFamily: 'Sora, system-ui' }}>
              Mises à jour
            </h1>
            <p className="text-sm text-slate-500">
              Historique des déploiements et améliorations de Woppy.
            </p>

            {/* Sync status feedback */}
            {syncStatus === 'success' && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Nouveau commit synchronisé depuis GitHub
              </div>
            )}
            {syncStatus === 'already' && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Déjà à jour — aucun nouveau commit
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Erreur de synchronisation — vérifie GITHUB_OWNER / GITHUB_REPO
              </div>
            )}

            {/* Latest commit preview */}
            {latestCommit && (
              <div className="mt-4 flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3">
                {latestCommit.author?.avatar_url && (
                  <img src={latestCommit.author.avatar_url} alt="" className="w-6 h-6 rounded-full border border-slate-200" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {latestCommit.commit.message.split('\n')[0]}
                  </p>
                  <p className="mono text-[10px] text-slate-400">
                    {latestCommit.sha.slice(0, 7)} · {latestCommit.commit.author.name}
                  </p>
                </div>
                <a href={latestCommit.html_url} target="_blank" rel="noopener noreferrer"
                  className="text-slate-400 hover:text-violet-600 transition-colors shrink-0">
                  <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>

          {/* ── Updates list ── */}
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center animate-pulse">
                <Sparkles size={16} className="text-white" />
              </div>
              <p className="text-sm text-slate-500">Chargement…</p>
            </div>
          ) : (
            <div className="space-y-4">
              {snapshot?.docs.map((doc) => {
                const u = doc.data();
                const Icon = iconMap[u.sections?.[0]?.icon] ?? HelpCircle;
                const { tagColor } = parseCommitMessage(u.title || '');

                return (
                  <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-violet-200 transition-colors">

                    {/* Card header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-500 shrink-0">
                          <GitCommit size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate" style={{ fontFamily: 'Sora, system-ui' }}>
                            {u.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar size={10} className="text-slate-400" />
                            <span className="text-[11px] text-slate-400">{u.date}</span>
                            {u.version && (
                              <>
                                <span className="text-slate-200">·</span>
                                <span className="mono text-[10px] text-slate-400">{u.version}</span>
                              </>
                            )}
                            {u.authorName && (
                              <>
                                <span className="text-slate-200">·</span>
                                {u.authorAvatar && (
                                  <img src={u.authorAvatar} alt="" className="w-4 h-4 rounded-full border border-slate-200 inline-block" />
                                )}
                                <span className="text-[11px] text-slate-400">{u.authorName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${u.statusColor || tagColor}`}>
                          {u.status}
                        </span>
                        {u.commitUrl && (
                          <a href={u.commitUrl} target="_blank" rel="noopener noreferrer"
                            className="text-slate-400 hover:text-violet-600 transition-colors">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Sections */}
                    {u.sections && u.sections.length > 0 && (
                      <div className="px-5 py-4 space-y-3">
                        {u.sections.map((section: any, i: number) => {
                          const SectionIcon = iconMap[section.icon] ?? HelpCircle;
                          return (
                            <div key={i}>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{section.title}</p>
                              <ul className="space-y-1.5">
                                {section.items.map((item: string, j: number) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                    <ChevronRight size={13} className="text-violet-400 shrink-0 mt-0.5" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {snapshot?.empty && (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                    <GitCommit size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Aucune mise à jour</p>
                  <p className="text-xs text-slate-400 mb-4">Configure GITHUB_OWNER et GITHUB_REPO puis clique sur "Sync GitHub".</p>
                  <button onClick={() => syncLatestCommit(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition">
                    <RefreshCw size={12} /> Synchroniser maintenant
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-10">
            Synchronisé depuis{' '}
            <a href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer"
              className="text-violet-600 hover:underline mono">{GITHUB_OWNER}/{GITHUB_REPO}</a>
          </p>
        </div>
      </div>
    </>
  );
}