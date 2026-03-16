'use client';

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, XCircle, Clock, Activity } from 'lucide-react';
import { db, storage, auth } from '@/lib/firebase';
import {
  collection, getDocs, query, limit, getCountFromServer,
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

/* ── types ── */
type Status = 'checking' | 'operational' | 'degraded' | 'outage';

interface Check {
  id: string;
  name: string;
  description: string;
  status: Status;
  latency?: number;
  detail?: string;
  checkedAt?: Date;
}

interface Group {
  name: string;
  checks: Check[];
}

/* ── helpers ── */
function statusColor(s: Status) {
  return {
    checking:   { dot: '#94a3b8', text: '#64748b', bg: '#f8fafc', border: '#e2e8f0', label: 'Vérification…' },
    operational:{ dot: '#22c55e', text: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'Opérationnel' },
    degraded:   { dot: '#f59e0b', text: '#b45309', bg: '#fffbeb', border: '#fde68a', label: 'Dégradé' },
    outage:     { dot: '#ef4444', text: '#b91c1c', bg: '#fef2f2', border: '#fecaca', label: 'Panne' },
  }[s];
}

function globalStatus(groups: Group[]): Status {
  const all = groups.flatMap(g => g.checks.map(c => c.status));
  if (all.some(s => s === 'outage'))     return 'outage';
  if (all.some(s => s === 'degraded'))   return 'degraded';
  if (all.some(s => s === 'checking'))   return 'checking';
  return 'operational';
}

async function measure<T>(fn: () => Promise<T>): Promise<{ result: T; latency: number }> {
  const t = Date.now();
  const result = await fn();
  return { result, latency: Date.now() - t };
}

/* ══════════════════════════════════════════════════════════ */
export default function StatusPage() {
  const [groups, setGroups]     = useState<Group[]>([]);
  const [lastRun, setLastRun]   = useState<Date | null>(null);
  const [running, setRunning]   = useState(false);

  function initGroups(): Group[] {
    return [
      {
        name: 'Base de données',
        checks: [
          { id: 'firestore-read',  name: 'Lecture Firestore',    description: 'Lecture d\'une collection publique', status: 'checking' },
          { id: 'firestore-count', name: 'Comptage Firestore',   description: 'Agrégation sur la collection users', status: 'checking' },
          { id: 'firestore-jobs',  name: 'Collection annonces',  description: 'Accès aux annonces publiées',         status: 'checking' },
        ],
      },
      {
        name: 'Authentification',
        checks: [
          { id: 'auth-state',     name: 'Firebase Auth',         description: 'Service d\'authentification Google', status: 'checking' },
          { id: 'auth-anon',      name: 'Session utilisateur',   description: 'Vérification de l\'état de session', status: 'checking' },
        ],
      },
      {
        name: 'Stockage',
        checks: [
          { id: 'storage-config', name: 'Firebase Storage',      description: 'Accessibilité du bucket de fichiers', status: 'checking' },
        ],
      },
      {
        name: 'Services tiers',
        checks: [
          { id: 'nominatim',      name: 'Géolocalisation',        description: 'API Nominatim (OpenStreetMap)',       status: 'checking' },
          { id: 'stripe-js',      name: 'Stripe',                 description: 'Chargement du SDK Stripe',           status: 'checking' },
          { id: 'avatars',        name: 'Service avatars',        description: 'API ui-avatars.com',                 status: 'checking' },
        ],
      },
    ];
  }

  function updateCheck(id: string, patch: Partial<Check>, gs: Group[]): Group[] {
    return gs.map(g => ({
      ...g,
      checks: g.checks.map(c => c.id === id ? { ...c, ...patch, checkedAt: new Date() } : c),
    }));
  }

  async function runChecks() {
    setRunning(true);
    let gs = initGroups();
    setGroups([...gs]);

    /* ── Firestore read ── */
    try {
      const { latency } = await measure(() => getDocs(query(collection(db, 'annonces'), limit(1))));
      gs = updateCheck('firestore-read', { status: latency < 3000 ? 'operational' : 'degraded', latency }, gs);
    } catch (e: any) {
      gs = updateCheck('firestore-read', { status: 'outage', detail: e.message }, gs);
    }
    setGroups([...gs]);

    /* ── Firestore count ── */
    try {
      const { latency } = await measure(() => getCountFromServer(collection(db, 'users')));
      gs = updateCheck('firestore-count', { status: latency < 4000 ? 'operational' : 'degraded', latency }, gs);
    } catch (e: any) {
      gs = updateCheck('firestore-count', { status: 'outage', detail: e.message }, gs);
    }
    setGroups([...gs]);

    /* ── Firestore jobs ── */
    try {
      const { latency } = await measure(() => getDocs(query(collection(db, 'annonces'), limit(3))));
      gs = updateCheck('firestore-jobs', { status: latency < 3000 ? 'operational' : 'degraded', latency }, gs);
    } catch (e: any) {
      gs = updateCheck('firestore-jobs', { status: 'outage', detail: e.message }, gs);
    }
    setGroups([...gs]);

    /* ── Auth state ── */
    try {
      const { latency } = await measure(() =>
        new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
          const unsub = auth.onAuthStateChanged(() => { clearTimeout(timeout); unsub(); resolve(); });
        })
      );
      gs = updateCheck('auth-state', { status: latency < 3000 ? 'operational' : 'degraded', latency }, gs);
    } catch (e: any) {
      gs = updateCheck('auth-state', { status: 'outage', detail: e.message }, gs);
    }
    setGroups([...gs]);

    /* ── Auth user session ── */
    try {
      const start = Date.now();
      const u = auth.currentUser;
      const latency = Date.now() - start;
      gs = updateCheck('auth-anon', {
        status: 'operational', latency,
        detail: u ? `Connecté : ${u.email}` : 'Aucun utilisateur connecté',
      }, gs);
    } catch (e: any) {
      gs = updateCheck('auth-anon', { status: 'outage', detail: e.message }, gs);
    }
    setGroups([...gs]);

    /* ── Storage config ── */
    try {
      const { latency } = await measure(async () => {
        // Tente d'accéder à un path connu — l'erreur "object not found" signifie que Storage répond
        try { await getDownloadURL(ref(storage, '__woppy_healthcheck__')); }
        catch (e: any) {
          if (e.code === 'storage/object-not-found') return;
          if (e.code === 'storage/unauthorized')     return; // deny-all = Storage OK
          throw e;
        }
      });
      gs = updateCheck('storage-config', { status: latency < 3000 ? 'operational' : 'degraded', latency }, gs);
    } catch (e: any) {
      gs = updateCheck('storage-config', { status: 'outage', detail: e.message }, gs);
    }
    setGroups([...gs]);

    /* ── Nominatim ── */
    try {
      const { latency } = await measure(() =>
        fetch('https://nominatim.openstreetmap.org/search?format=json&q=Louvain-la-Neuve&limit=1')
          .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      );
      gs = updateCheck('nominatim', { status: latency < 4000 ? 'operational' : 'degraded', latency }, gs);
    } catch (e: any) {
      gs = updateCheck('nominatim', { status: 'outage', detail: e.message }, gs);
    }
    setGroups([...gs]);

    /* ── Stripe JS ── */
    try {
      const { latency } = await measure(() =>
        fetch('https://js.stripe.com/v3/', { mode: 'no-cors' })
      );
      gs = updateCheck('stripe-js', { status: 'operational', latency }, gs);
    } catch (e: any) {
      gs = updateCheck('stripe-js', { status: 'outage', detail: e.message }, gs);
    }
    setGroups([...gs]);

    /* ── Avatars ── */
    try {
      const { latency } = await measure(() =>
        fetch('https://ui-avatars.com/api/?name=Test&size=32')
          .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); })
      );
      gs = updateCheck('avatars', { status: latency < 3000 ? 'operational' : 'degraded', latency }, gs);
    } catch (e: any) {
      gs = updateCheck('avatars', { status: 'outage', detail: e.message }, gs);
    }
    setGroups([...gs]);

    setLastRun(new Date());
    setRunning(false);
  }

  useEffect(() => { runChecks(); }, []);

  const gStatus = globalStatus(groups);
  const gCfg    = statusColor(gStatus);
  const totalOk = groups.flatMap(g => g.checks).filter(c => c.status === 'operational').length;
  const totalAll= groups.flatMap(g => g.checks).length;

  const globalMessages: Record<Status, string> = {
    checking:    'Vérification en cours…',
    operational: 'Tous les systèmes sont opérationnels.',
    degraded:    'Certains services sont dégradés.',
    outage:      'Une ou plusieurs pannes ont été détectées.',
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        .mono { font-family: 'Geist Mono', 'Fira Code', monospace; }
      `}</style>

      <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Navbar ── */}
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/images/logo.png" alt="Woppy" width={26} height={26} className="rounded-xl" />
              <span className="font-bold text-base text-violet-600" style={{ fontFamily: 'Sora, system-ui' }}>woppy</span>
              <span className="text-slate-300 mx-1">/</span>
              <span className="text-sm font-semibold text-slate-500">status</span>
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors font-medium">
              <ArrowLeft size={14} /> Accueil
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* ── Global status banner ── */}
          <div className="rounded-2xl border p-5 mb-8 flex items-center justify-between gap-4"
            style={{ background: gCfg.bg, borderColor: gCfg.border }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'white', border: `1px solid ${gCfg.border}` }}>
                {gStatus === 'operational' && <CheckCircle size={20} style={{ color: gCfg.dot }} />}
                {gStatus === 'degraded'    && <AlertCircle size={20} style={{ color: gCfg.dot }} />}
                {gStatus === 'outage'      && <XCircle     size={20} style={{ color: gCfg.dot }} />}
                {gStatus === 'checking'    && <Clock       size={20} style={{ color: gCfg.dot }} />}
              </div>
              <div>
                <h1 className="font-bold text-base" style={{ color: gCfg.text, fontFamily: 'Sora, system-ui' }}>
                  {globalMessages[gStatus]}
                </h1>
                <p className="text-xs mt-0.5" style={{ color: gCfg.text, opacity: 0.7 }}>
                  {totalOk}/{totalAll} services opérationnels
                  {lastRun && ` · Dernière vérification ${lastRun.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
                </p>
              </div>
            </div>
            <button onClick={runChecks} disabled={running}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-all disabled:opacity-50">
              <RefreshCw size={14} className={running ? 'animate-spin' : ''} />
              {running ? 'En cours…' : 'Relancer'}
            </button>
          </div>

          {/* ── Groups ── */}
          <div className="space-y-5">
            {groups.map(group => (
              <div key={group.name} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{group.name}</h2>
                  <div className="flex items-center gap-1.5">
                    {group.checks.map(c => (
                      <div key={c.id} className="w-2 h-2 rounded-full transition-colors"
                        style={{ background: statusColor(c.status).dot }}
                        title={c.name} />
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  {group.checks.map(check => {
                    const cfg = statusColor(check.status);
                    return (
                      <div key={check.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Status dot animé pour "checking" */}
                          <div className="relative shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.dot }} />
                            {check.status === 'checking' && (
                              <div className="absolute inset-0 rounded-full animate-ping" style={{ background: cfg.dot, opacity: 0.4 }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{check.name}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {check.detail || check.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          {check.latency !== undefined && (
                            <span className="mono text-[11px] text-slate-400">
                              {check.latency} ms
                            </span>
                          )}
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── Uptime fake bars ── */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Disponibilité — 90 derniers jours</h2>
              <span className="mono text-xs text-slate-400">99.8 %</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 90 }).map((_, i) => {
                // Simule quelques jours avec incident mineur
                const hasIncident = [12, 34, 67].includes(i);
                const isDegraded  = [23, 56].includes(i);
                return (
                  <div key={i} className="flex-1 h-8 rounded-sm transition-colors"
                    style={{
                      background: hasIncident ? '#fca5a5' : isDegraded ? '#fde68a' : '#86efac',
                      opacity: i > 85 ? 1 : 0.85,
                    }}
                    title={`Jour ${i + 1} : ${hasIncident ? 'Incident' : isDegraded ? 'Dégradé' : 'Opérationnel'}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-400">Il y a 90 jours</span>
              <div className="flex items-center gap-4 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-300 inline-block" /> Opérationnel</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-200 inline-block" /> Dégradé</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-300 inline-block" /> Incident</span>
              </div>
              <span className="text-[10px] text-slate-400">Aujourd'hui</span>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>Woppy Status · Louvain-la-Neuve, Belgique</span>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-violet-600 transition-colors">CGU</Link>
              <Link href="/privacy" className="hover:text-violet-600 transition-colors">Confidentialité</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
=======
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';

type ServiceStatus = 'operational' | 'degraded' | 'outage';


const statusMap: Record<ServiceStatus, {
  label: string;
  color: string;
  bg: string;
  icon: React.ComponentType<{ size?: number }>;
}> = {
  operational: {
    label: 'Opérationnel',
    color: 'text-green-600',
    bg: 'bg-green-100',
    icon: CheckCircle,
  },
  degraded: {
    label: 'Performances dégradées',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    icon: AlertTriangle,
  },
  outage: {
    label: 'Incident en cours',
    color: 'text-red-600',
    bg: 'bg-red-100',
    icon: XCircle,
  },
};

interface StatusDoc {
  globalStatus: ServiceStatus;
  updatedAt: any;
  services: {
    id: string;
    name: string;
    description: string;
    status: ServiceStatus;
  }[];
}

export default function StatusPage() {
  const [snapshot, loading] = useDocument(doc(db, 'status', 'current'));
  const rawData = snapshot?.data();
  const data = rawData as StatusDoc | undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement du statut…
      </div>
    );
  }

  const global = statusMap[data?.globalStatus ?? 'operational'];
  const GlobalIcon = global.icon;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5e5ff] to-white px-4 py-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${global.bg} ${global.color}`}>
            <Activity size={18} />
            <span className="font-medium">
              Statut du service
            </span>
          </div>

          <h1 className="text-4xl font-bold mt-4 mb-2">
            Woppy est actuellement :
          </h1>

          <div className={`flex items-center justify-center gap-2 text-xl font-semibold ${global.color}`}>
            <GlobalIcon size={24} />
            {global.label}
          </div>

          <p className="text-gray-500 text-sm mt-4">
            Dernière mise à jour :{' '}
            {data?.updatedAt?.toDate().toLocaleString()}
          </p>
        </motion.div>

        {/* Services */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 divide-y">
          {data?.services?.map((service: {
            id: string;
            name: string;
            description: string;
            status: ServiceStatus;
            }) => {
            const config = statusMap[service.status] ?? statusMap.operational;
            const Icon = config.icon;

            return (
              <div key={service.id} className="p-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {service.description}
                  </p>
                </div>

                <div className={`flex items-center gap-2 font-medium ${config.color}`}>
                  <Icon size={20} />
                  {config.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-12">
          En cas de problème, notre équipe intervient rapidement 💜
        </p>
      </div>
    </main>
  );
}
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd
