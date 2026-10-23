"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StaffShell from "@/components/staff/StaffShell";
import {
  Users,
  Briefcase,
  Flag,
  Shield,
  TrendingUp,
  CheckCircle,
  Clock,
  Ban,
  Loader2,
  BarChart2,
  UserCheck,
  AlertTriangle,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Period = "30d" | "3m" | "1y";

const PERIOD_LABELS: Record<Period, string> = {
  "30d": "30 derniers jours",
  "3m": "3 derniers mois",
  "1y": "12 derniers mois",
};

const VIOLET = "#7357f6";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const DARK = "#111118";

function startOf(period: Period): Date {
  const d = new Date();
  if (period === "30d") d.setDate(d.getDate() - 30);
  else if (period === "3m") d.setMonth(d.getMonth() - 3);
  else d.setFullYear(d.getFullYear() - 1);
  return d;
}

function toDate(v: any): Date | null {
  if (!v) return null;
  if (typeof v === "number") return new Date(v);
  if (v.toDate) return v.toDate();
  if (v.seconds) return new Date(v.seconds * 1000);
  return new Date(v);
}

/* ── Chargement direct depuis Firestore (secours si la route API échoue) ── */
type AnalyticsData = {
  users: any[];
  annonces: any[];
  candidatures: any[];
  reports: any[];
  resolved: any[];
  reviews: any[];
};

const ANALYTICS_COLLECTIONS: { key: keyof AnalyticsData; name: string; sortBy?: string }[] = [
  { key: "users", name: "users" },
  { key: "annonces", name: "annonces", sortBy: "createdAt" },
  { key: "candidatures", name: "candidatures" },
  { key: "reports", name: "reports" },
  { key: "resolved", name: "reportsResolved", sortBy: "resolvedAt" },
  { key: "reviews", name: "reviews" },
];

async function loadAnalyticsDirect(): Promise<{ data: AnalyticsData; failed: string[] }> {
  const data = { users: [], annonces: [], candidatures: [], reports: [], resolved: [], reviews: [] } as AnalyticsData;
  const failed: string[] = [];
  await Promise.all(
    ANALYTICS_COLLECTIONS.map(async ({ key, name, sortBy }) => {
      try {
        const snap = await getDocs(collection(db, name));
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Tri en mémoire : un orderBy Firestore exclurait les documents sans ce champ
        if (sortBy) {
          docs.sort((a: any, b: any) => (toDate(b[sortBy])?.getTime() ?? 0) - (toDate(a[sortBy])?.getTime() ?? 0));
        }
        data[key] = docs;
      } catch {
        failed.push(name);
      }
    })
  );
  return { data, failed };
}

function monthLabel(date: Date) {
  return date.toLocaleString("fr-FR", { month: "short", year: "2-digit" });
}

function buildTimeline(docs: any[], period: Period, dateField = "createdAt") {
  const start = startOf(period);
  const is30d = period === "30d";
  const buckets: Record<string, number> = {};
  const steps = is30d ? 30 : 12;

  for (let i = 0; i < steps; i++) {
    const d = new Date(start);
    if (is30d) {
      d.setDate(d.getDate() + i);
      buckets[
        d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
      ] = 0;
    } else {
      d.setMonth(d.getMonth() + i);
      buckets[monthLabel(d)] = 0;
    }
  }

  docs.forEach((item) => {
    const date = toDate(item[dateField]);
    if (!date || date < start) return;
    const key = is30d
      ? date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
      : monthLabel(date);
    if (key in buckets) buckets[key] = (buckets[key] || 0) + 1;
  });

  return Object.entries(buckets).map(([label, value]) => ({ label, value }));
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-xl px-3 py-2 shadow-lg text-sm ">
      <p className="text-muted text-[11px] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name} : {p.value}
        </p>
      ))}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 bg-paper-2 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h2 className="font-[var(--font-bricolage),system-ui] font-bold text-[16px] text-[#111118]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-line ml-1" />
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <p className=" font-semibold text-[13px] text-ink-2 mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3">
      <div className={`${color} opacity-80`}>{icon}</div>
      <div>
        <p className={`font-[var(--font-bricolage),system-ui] font-bold text-xl ${color}`}>
          {value}
        </p>
        <p className="text-[11px] text-muted font-medium">{label}</p>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center text-muted">
      <BarChart2 className="w-8 h-8 mb-2" />
      <p className="text-xs">Aucune donnée</p>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <StaffShell title="Statistiques" description="Utilisateurs, annonces, candidatures et modération sur la période choisie.">
      {({ user }) => <Analytics user={user} />}
    </StaffShell>
  );
}

function Analytics({ user }: { user: User }) {
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [period, setPeriod] = useState<Period>("30d");

  const [users, setUsers] = useState<any[]>([]);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [resolved, setResolved] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);


  const applyData = (data: AnalyticsData) => {
    setUsers(data.users);
    setAnnonces(data.annonces);
    setCandidatures(data.candidatures);
    setReports(data.reports);
    setResolved(data.resolved);
    setReviews(data.reviews);
  };

  /* La route API (Firebase Admin) est essayée d'abord ; si elle n'est pas configurée,
     les collections sont lues directement avec les droits du compte connecté. */
  const fetchAnalytics = async () => {
    setFetching(true);
    setLoadError(false);
    setMissing([]);
    try {
      const t = await user.getIdToken();
      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      applyData(await res.json());
    } catch {
      const { data, failed } = await loadAnalyticsDirect();
      applyData(data);
      setMissing(failed);
      setLoadError(failed.length === ANALYTICS_COLLECTIONS.length);
    } finally {
      setFetching(false);
    }
  };

  /* Chargement une fois l'accès vérifié */
  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ── Computed ── */
  const start = startOf(period);
  const inPeriod = (item: any, field = "createdAt") => {
    const d = toDate(item[field]);
    return d && d >= start;
  };

  // Users
  const studentsAll = users.filter((u) => u.studentProfile);
  const studentsVerified = studentsAll.filter(
    (u) => u.studentProfile?.verificationStatus === "verified",
  );
  const studentsPending = studentsAll.filter(
    (u) => u.studentProfile?.verificationStatus === "pending",
  );
  const usersBlocked = users.filter((u) => u.blocked);
  const newUsers = users.filter((u) => inPeriod(u));

  const userPieData = [
    { name: "Vérifiés", value: studentsVerified.length, color: GREEN },
    { name: "En attente", value: studentsPending.length, color: AMBER },
    {
      name: "Non étudiants",
      value: users.length - studentsAll.length,
      color: VIOLET,
    },
    { name: "Bloqués", value: usersBlocked.length, color: RED },
  ].filter((d) => d.value > 0);

  // Annonces
  const annoncesInPeriod = annonces.filter((a) => inPeriod(a));
  const annoncesFini = annonces.filter((a) => a.statut === "fini");
  const annoncesActives = annonces.filter((a) => a.statut !== "fini");

  const annonceStatusData = [
    { name: "Actives", value: annoncesActives.length, color: VIOLET },
    { name: "Terminées", value: annoncesFini.length, color: GREEN },
  ];

  // Candidatures
  const candidaturesInPeriod = candidatures.filter((c) => inPeriod(c));
  const candidaturesAccepted = candidatures.filter(
    (c) => c.statut === "acceptee",
  );
  const candidaturesRejected = candidatures.filter(
    (c) => c.statut === "refusee",
  );
  const candidaturesPending = candidatures.filter(
    (c) => !c.statut || c.statut === "en_attente",
  );

  const candidatureBarData = [
    { name: "Acceptées", value: candidaturesAccepted.length, fill: GREEN },
    { name: "Refusées", value: candidaturesRejected.length, fill: RED },
    { name: "En attente", value: candidaturesPending.length, fill: AMBER },
  ];

  // Reviews
  const avgRating = reviews.length
    ? (
        reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      ).toFixed(1)
    : "—";

  // Reports
  const resolvedDecisions = [
    {
      name: "Pas offensif",
      value: resolved.filter((r) => r.decision === "not_offensive").length,
      color: GREEN,
    },
    {
      name: "Bloqués",
      value: resolved.filter((r) => r.decision === "blocked").length,
      color: RED,
    },
    {
      name: "Supprimés",
      value: resolved.filter((r) => r.decision === "deleted").length,
      color: DARK,
    },
  ].filter((d) => d.value > 0);

  const reportTimeline = buildTimeline(
    resolved.map((r) => ({ ...r, createdAt: r.resolvedAt })),
    period,
  );

// Revenus — annonces terminées avec duree + remuneration renseignées
const annoncesAvecData = annoncesFini.filter(
  a => a.duree && a.remuneration
);

const volumeTotal = annoncesAvecData.reduce(
  (sum, a) => sum + (a.duree * a.remuneration), 0
);

// Woppy ne prélève aucune commission : tout le volume revient aux étudiants
const netEtudiants = volumeTotal;

const heuresMoyennes = annoncesAvecData.length
  ? (annoncesAvecData.reduce((s, a) => s + a.duree, 0) / annoncesAvecData.length).toFixed(1)
  : '—';

  return (
    <>
          {/* Period selector */}
          <div className="flex">
            <div className="bg-white border border-line rounded-2xl p-1.5 flex gap-1">
              {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setPeriod(key)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150
                    ${
                      period === key
                        ? "bg-brand text-white shadow-sm"
                        : "text-muted hover:text-ink-2 hover:bg-paper-2"
                    }`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>

        {/* ── Content ── */}
        <div className="mt-6 space-y-8">
          {loadError && !fetching && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Impossible de charger les statistiques. Vérifiez votre connexion et réessayez.
            </div>
          )}
          {!loadError && missing.length > 0 && !fetching && (
            <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Données incomplètes : accès refusé à {missing.join(", ")}. Les chiffres concernés restent à zéro.
            </div>
          )}
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
              <p className="text-sm text-muted">Chargement des données...</p>
            </div>
          ) : (
            <>
              {/* ── KPI Strip ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Utilisateurs",
                    value: users.length,
                    sub: `+${newUsers.length} sur la période`,
                    icon: <Users className="w-4 h-4" />,
                    iconBg: "bg-brand-soft text-brand",
                  },
                  {
                    label: "Annonces créées",
                    value: annoncesInPeriod.length,
                    sub: `${annoncesFini.length} terminées au total`,
                    icon: <Briefcase className="w-4 h-4" />,
                    iconBg: "bg-amber-50 text-amber-500",
                  },
                  {
                    label: "Candidatures",
                    value: candidaturesInPeriod.length,
                    sub: `${candidaturesAccepted.length} acceptées au total`,
                    icon: <UserCheck className="w-4 h-4" />,
                    iconBg: "bg-green-50 text-green-500",
                  },
                  {
                    label: "Note moyenne",
                    value: avgRating,
                    sub: `${reviews.length} avis au total`,
                    icon: <Star className="w-4 h-4" />,
                    iconBg: "bg-pink-50 text-pink-500",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white border border-line rounded-2xl p-4"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${s.iconBg}`}
                    >
                      {s.icon}
                    </div>
                    <p className="font-[var(--font-bricolage),system-ui] font-bold text-2xl text-[#111118]">
                      {s.value}
                    </p>
                    <p className="text-[12px] font-semibold text-ink-2 mt-0.5">
                      {s.label}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Utilisateurs ── */}
              <div>
                <SectionHeader
                  icon={<Users className="w-4 h-4 text-brand" />}
                  title="Utilisateurs & vérifications"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <MiniStat
                    label="Étudiants vérifiés"
                    value={studentsVerified.length}
                    color="text-green-500"
                    icon={<CheckCircle className="w-3.5 h-3.5" />}
                  />
                  <MiniStat
                    label="En attente"
                    value={studentsPending.length}
                    color="text-amber-500"
                    icon={<Clock className="w-3.5 h-3.5" />}
                  />
                  <MiniStat
                    label="Bloqués"
                    value={usersBlocked.length}
                    color="text-red-500"
                    icon={<Ban className="w-3.5 h-3.5" />}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ChartCard title="Répartition des comptes">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={userPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {userPieData.map((e, i) => (
                            <Cell key={i} fill={e.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12, fontFamily: "DM Sans" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                  <ChartCard
                    title={`Nouveaux inscrits — ${PERIOD_LABELS[period]}`}
                  >
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart
                        data={buildTimeline(users, period)}
                        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="gUser"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={VIOLET}
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="95%"
                              stopColor={VIOLET}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f6f6f8" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#6b6b78" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#6b6b78" }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name="Inscrits"
                          stroke={VIOLET}
                          strokeWidth={2}
                          fill="url(#gUser)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
              </div>

              {/* ── Annonces & Candidatures ── */}
              <div>
                <SectionHeader
                  icon={<Briefcase className="w-4 h-4 text-amber-500" />}
                  title="Annonces & candidatures"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <MiniStat
                    label="Annonces actives"
                    value={annoncesActives.length}
                    color="text-brand"
                    icon={<TrendingUp className="w-3.5 h-3.5" />}
                  />
                  <MiniStat
                    label="Annonces terminées"
                    value={annoncesFini.length}
                    color="text-green-500"
                    icon={<CheckCircle className="w-3.5 h-3.5" />}
                  />
                  <MiniStat
                    label="Taux de complétion"
                    value={
                      annonces.length
                        ? `${Math.round((annoncesFini.length / annonces.length) * 100)}%`
                        : "—"
                    }
                    color="text-amber-500"
                    icon={<Star className="w-3.5 h-3.5" />}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <ChartCard
                    title={`Annonces créées — ${PERIOD_LABELS[period]}`}
                  >
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart
                        data={buildTimeline(annonces, period)}
                        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="gAnnonce"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={AMBER}
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="95%"
                              stopColor={AMBER}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f6f6f8" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#6b6b78" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#6b6b78" }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name="Annonces"
                          stroke={AMBER}
                          strokeWidth={2}
                          fill="url(#gAnnonce)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>
                  <ChartCard title="Statut des annonces">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={annonceStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {annonceStatusData.map((e, i) => (
                            <Cell key={i} fill={e.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12, fontFamily: "DM Sans" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
                <ChartCard title="Candidatures par statut">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={candidatureBarData}
                      margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f6f6f8"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#6b6b78" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#6b6b78" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="value"
                        name="Candidatures"
                        radius={[6, 6, 0, 0]}
                      >
                        {candidatureBarData.map((e, i) => (
                          <Cell key={i} fill={e.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* ── Revenus Woppy ── */}
              <div>
                <SectionHeader
                  icon={<TrendingUp className="w-4 h-4 text-brand" />}
                  title="Volume des missions"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <MiniStat
                    label="Volume total généré"
                    value={`${volumeTotal.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
                    color="text-brand"
                    icon={<TrendingUp className="w-3.5 h-3.5" />}
                  />
                  <MiniStat
                    label="Commission Woppy"
                    value="0 €"
                    color="text-muted"
                    icon={<Star className="w-3.5 h-3.5" />}
                  />
                  <MiniStat
                    label="Net étudiants"
                    value={`${netEtudiants.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
                    color="text-amber-500"
                    icon={<CheckCircle className="w-3.5 h-3.5" />}
                  />
                  <MiniStat
                    label="Heures moy. / mission"
                    value={`${heuresMoyennes}h`}
                    color="text-muted"
                    icon={<Clock className="w-3.5 h-3.5" />}
                  />
                </div>
              </div>

              {/* ── Modération ── */}
              <div>
                <SectionHeader
                  icon={<Flag className="w-4 h-4 text-red-500" />}
                  title="Modération"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <MiniStat
                    label="Signalements actifs"
                    value={reports.length}
                    color="text-red-500"
                    icon={<AlertTriangle className="w-3.5 h-3.5" />}
                  />
                  <MiniStat
                    label="Signalements résolus"
                    value={resolved.length}
                    color="text-green-500"
                    icon={<CheckCircle className="w-3.5 h-3.5" />}
                  />
                  <MiniStat
                    label="Taux de résolution"
                    value={
                      reports.length + resolved.length
                        ? `${Math.round((resolved.length / (reports.length + resolved.length)) * 100)}%`
                        : "—"
                    }
                    color="text-brand"
                    icon={<Shield className="w-3.5 h-3.5" />}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ChartCard title="Décisions prises">
                    {resolvedDecisions.length === 0 ? (
                      <EmptyChart />
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={resolvedDecisions}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {resolvedDecisions.map((e, i) => (
                              <Cell key={i} fill={e.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{
                              fontSize: 12,
                              fontFamily: "DM Sans",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </ChartCard>
                  <ChartCard title={`Résolutions — ${PERIOD_LABELS[period]}`}>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart
                        data={reportTimeline}
                        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="gReport"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={RED}
                              stopOpacity={0.12}
                            />
                            <stop
                              offset="95%"
                              stopColor={RED}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f6f6f8" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#6b6b78" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#6b6b78" }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name="Résolus"
                          stroke={RED}
                          strokeWidth={2}
                          fill="url(#gReport)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
              </div>
            </>
          )}
        </div>
    </>
  );
}
