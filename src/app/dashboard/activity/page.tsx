"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, CheckCircle, Clock, Briefcase, Users,
  Star, User, MapPin, Calendar, Award, FileText, Zap,
  Loader2, GraduationCap, ArrowRight, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  collection, query, where, getDocs, getDoc,
  doc, updateDoc,
} from "firebase/firestore";

/* ── status config ── */
const JOB_STATUS = {
  pending:  { label: "En attente",  dot: "#60a5fa", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  selected: { label: "Sélectionné", dot: "#7c5fe6", color: "#5b21b6", bg: "#f5f3ff", border: "#ddd6fe" },
  done:     { label: "Terminé",     dot: "#22c55e", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
};
const AD_STATUS = {
  open:     { label: "Ouverte",     dot: "#7c5fe6", color: "#5b21b6", bg: "#f5f3ff", border: "#ddd6fe" },
  progress: { label: "En cours",    dot: "#f59e0b", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  done:     { label: "Terminée",    dot: "#22c55e", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
};

/* ══════════════════════════════════════════════════════════ */
export default function ActivityPage() {
  const [tab, setTab]       = useState<"jobs" | "annonces">("jobs");
  const [user, setUser]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStudent, setIsStudent] = useState(false);

  const [jobsPostules, setJobsPostules]       = useState<any[]>([]);
  const [jobsSelectionnes, setJobsSelectionnes] = useState<any[]>([]);
  const [jobsTermines, setJobsTermines]       = useState<any[]>([]);

  const [annoncesPubliees, setAnnoncesPubliees]   = useState<any[]>([]);
  const [annoncesEnCours, setAnnoncesEnCours]     = useState<any[]>([]);
  const [annoncesTerminees, setAnnoncesTerminees] = useState<any[]>([]);

  /* auth */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { window.location.href = "/auth/login"; return; }
      setUser(u);
      // Vérifie le statut étudiant
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) setIsStudent(snap.data().hasStudentProfile === true);
      } catch {}
    });
    return () => unsub();
  }, []);

  /* fetch */
  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      const uid = user.uid;
      try {
        /* candidatures (uniquement si étudiant) */
        if (isStudent) {
          const cSnap = await getDocs(query(collection(db, "candidatures"), where("candidatId", "==", uid)));
          const postules: any[] = [];
          for (const d of cSnap.docs) {
            const snap = await getDoc(doc(db, "annonces", d.data().annonceId));
            if (snap.exists()) {
              const ad = snap.data();
              if (!ad.acceptedUserId) postules.push({ id: snap.id, ...ad });
            }
          }
          setJobsPostules(postules);

          const selSnap = await getDocs(query(collection(db, "annonces"), where("acceptedUserId", "==", uid), where("statut", "!=", "fini")));
          setJobsSelectionnes(selSnap.docs.map(d => ({ id: d.id, ...d.data() })));

          const finSnap = await getDocs(query(collection(db, "annonces"), where("acceptedUserId", "==", uid), where("statut", "==", "fini")));
          setJobsTermines(finSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        /* annonces publiées */
        const pubSnap = await getDocs(query(collection(db, "annonces"), where("userId", "==", uid), where("statut", "==", "ouverte")));
        setAnnoncesPubliees(pubSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const mySnap = await getDocs(query(collection(db, "annonces"), where("userId", "==", uid)));
        setAnnoncesEnCours(mySnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(a => a.acceptedUserId && a.statut !== "fini"));

        const doneSnap = await getDocs(query(collection(db, "annonces"), where("userId", "==", uid), where("statut", "==", "fini")));
        setAnnoncesTerminees(doneSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user, isStudent]);

  if (!user) return null;

  /* kpis */
  const kpis = tab === "jobs"
    ? isStudent
      ? [
          { label: "Candidatures",  value: jobsPostules.length },
          { label: "Sélectionné",   value: jobsSelectionnes.length },
          { label: "Terminés",      value: jobsTermines.length },
        ]
      : []
    : [
        { label: "Publiées",  value: annoncesPubliees.length },
        { label: "En cours",  value: annoncesEnCours.length },
        { label: "Terminées", value: annoncesTerminees.length },
      ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&display=swap');`}</style>

      <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
            <h1 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Sora, system-ui' }}>
              Mon activité
            </h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ── Tabs ── */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-6 w-fit">
            {([["jobs", <Briefcase size={14} />, "Mes jobs"], ["annonces", <FileText size={14} />, "Mes annonces"]] as const).map(([key, icon, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === key ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}>
                {icon} {label}
              </button>
            ))}
          </div>

          {/* ── KPIs ── */}
          {kpis.length > 0 && (
            <div className="grid grid-cols-3 gap-px mb-6 rounded-xl overflow-hidden border border-slate-100"
              style={{ background: 'rgba(0,0,0,0.05)' }}>
              {kpis.map(k => (
                <div key={k.label} className="bg-white px-6 py-4">
                  <p className="text-xs text-slate-500 font-medium mb-1">{k.label}</p>
                  <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Sora, system-ui', letterSpacing: '-0.03em' }}>
                    {k.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Content ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={22} className="animate-spin text-violet-600" />
                <p className="text-sm text-slate-500">Chargement…</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {tab === "jobs" ? (
                <motion.div key="jobs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <JobsView
                    postules={jobsPostules} selectionnes={jobsSelectionnes} termines={jobsTermines}
                    user={user} isStudent={isStudent}
                  />
                </motion.div>
              ) : (
                <motion.div key="annonces" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <AnnoncesView publiees={annoncesPubliees} encours={annoncesEnCours} terminees={annoncesTerminees} user={user} />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* JOBS VIEW                                                  */
/* ══════════════════════════════════════════════════════════ */
function JobsView({ postules, selectionnes, termines, user, isStudent }: any) {

  // Profil non-étudiant → message d'activation
  if (!isStudent) return (
    <div className="bg-white rounded-2xl border border-slate-100 p-10 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-4">
        <GraduationCap size={24} className="text-violet-500" />
      </div>
      <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: 'Sora, system-ui' }}>
        Profil étudiant requis
      </h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-5">
        Tu n'as pas encore activé ton statut étudiant sur ton profil. Active-le pour pouvoir postuler aux missions disponibles sur Woppy.
      </p>
      <Link href="/dashboard/profile"
        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white
                   text-sm font-semibold rounded-xl transition shadow-sm shadow-violet-200">
        Activer mon profil étudiant <ArrowRight size={14} />
      </Link>
    </div>
  );

  return (
    <div className="space-y-8">
      <Group title="Candidatures en attente" icon={<ClipboardList size={14} />} count={postules.length}>
        {postules.length === 0
          ? <Empty text="Aucune candidature en attente." />
          : postules.map((a: any, i: number) => <JobCard key={a.id} annonce={a} type="pending" user={user} index={i} />)
        }
      </Group>

      <Group title="Missions où je suis sélectionné" icon={<Zap size={14} />} count={selectionnes.length}>
        {selectionnes.length === 0
          ? <Empty text="Tu n'es sélectionné sur aucune mission pour le moment." />
          : selectionnes.map((a: any, i: number) => <JobCard key={a.id} annonce={a} type="selected" user={user} index={i} />)
        }
      </Group>

      <Group title="Missions terminées" icon={<Award size={14} />} count={termines.length}>
        {termines.length === 0
          ? <Empty text="Aucune mission terminée pour le moment." />
          : termines.map((a: any, i: number) => <JobCard key={a.id} annonce={a} type="done" user={user} index={i} />)
        }
      </Group>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* ANNONCES VIEW                                             */
/* ══════════════════════════════════════════════════════════ */
function AnnoncesView({ publiees, encours, terminees, user }: any) {
  return (
    <div className="space-y-8">
      <Group title="Annonces publiées" icon={<Briefcase size={14} />} count={publiees.length}>
        {publiees.length === 0
          ? <Empty text="Aucune annonce publiée pour le moment." action={{ label: "Publier une annonce", href: "/jobs/create" }} />
          : publiees.map((a: any, i: number) => <AnnonceCard key={a.id} annonce={a} type="open" user={user} index={i} />)
        }
      </Group>

      <Group title="Annonces en cours" icon={<Users size={14} />} count={encours.length}>
        {encours.length === 0
          ? <Empty text="Aucune annonce en cours pour le moment." />
          : encours.map((a: any, i: number) => <AnnonceCard key={a.id} annonce={a} type="progress" user={user} index={i} />)
        }
      </Group>

      <Group title="Annonces terminées" icon={<Star size={14} />} count={terminees.length}>
        {terminees.length === 0
          ? <Empty text="Aucune annonce terminée pour le moment." />
          : terminees.map((a: any, i: number) => <AnnonceCard key={a.id} annonce={a} type="done" user={user} index={i} />)
        }
      </Group>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* SHARED COMPONENTS                                         */
/* ══════════════════════════════════════════════════════════ */

function Group({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-6 h-6 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-500">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Sora, system-ui' }}>{title}</h2>
        <span className="ml-auto text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Empty({ text, action }: { text: string; action?: { label: string; href: string } }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-200 px-6 py-8 text-center">
      <p className="text-sm text-slate-400 mb-3">{text}</p>
      {action && (
        <Link href={action.href}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition">
          {action.label} <ChevronRight size={11} />
        </Link>
      )}
    </div>
  );
}

/* ── Job card ── */
function JobCard({ annonce, type, user, index }: {
  annonce: any; type: keyof typeof JOB_STATUS; user: any; index: number;
}) {
  const [loading, setLoading] = useState(false);
  const cfg = JOB_STATUS[type];

  const markDone = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "annonces", annonce.id), { taskCompletion: true, statut: "fini" });
      window.location.reload();
    } catch (e) { console.error(e); setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group bg-white rounded-xl border border-slate-100 hover:border-violet-200
                 hover:shadow-[0_4px_20px_rgba(124,95,230,0.08)] transition-all duration-200"
    >
      <div className="flex items-start justify-between p-4">
        <div className="flex-1 min-w-0 mr-3">
          <Link href={`/jobs/${annonce.id}`}>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-violet-700 transition-colors truncate mb-1.5">
              {annonce.titre || annonce.title || "Mission"}
            </h3>
          </Link>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            {annonce.lieu && (
              <span className="flex items-center gap-1"><MapPin size={11} />{annonce.lieu}</span>
            )}
            {annonce.date && (
              <span className="flex items-center gap-1"><Calendar size={11} />{annonce.date}</span>
            )}
            {annonce.remuneration && (
              <span className="font-semibold text-violet-600">{annonce.remuneration} €/h</span>
            )}
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>
      </div>

      {type === "selected" && (
        <div className="px-4 pb-4">
          <button onClick={markDone} disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700
                       text-white text-xs font-bold rounded-lg transition disabled:opacity-60">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
            {loading ? "Enregistrement…" : "Marquer comme terminé"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ── Annonce card ── */
function AnnonceCard({ annonce, type, user, index }: {
  annonce: any; type: keyof typeof AD_STATUS; user: any; index: number;
}) {
  const [loading, setLoading] = useState(false);
  const [acceptedName, setAcceptedName] = useState<string | null>(null);
  const cfg = AD_STATUS[type];

  useEffect(() => {
    if (annonce.acceptedUserId) {
      getDoc(doc(db, "users", annonce.acceptedUserId)).then(snap => {
        if (snap.exists()) {
          const u = snap.data();
          setAcceptedName(`${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Étudiant');
        }
      });
    }
  }, [annonce.acceptedUserId]);

  const markDone = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "annonces", annonce.id), { statut: "fini" });
      window.location.reload();
    } catch (e) { console.error(e); setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group bg-white rounded-xl border border-slate-100 hover:border-violet-200
                 hover:shadow-[0_4px_20px_rgba(124,95,230,0.08)] transition-all duration-200"
    >
      <div className="flex items-start justify-between p-4">
        <div className="flex-1 min-w-0 mr-3">
          <Link href={`/jobs/${annonce.id}`}>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-violet-700 transition-colors truncate mb-1.5">
              {annonce.titre || annonce.title || "Annonce"}
            </h3>
          </Link>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            {annonce.lieu && (
              <span className="flex items-center gap-1"><MapPin size={11} />{annonce.lieu}</span>
            )}
            {annonce.date && (
              <span className="flex items-center gap-1"><Calendar size={11} />{annonce.date}</span>
            )}
            {annonce.remuneration && (
              <span className="font-semibold text-violet-600">{annonce.remuneration} €/h</span>
            )}
          </div>

          {/* Étudiant accepté */}
          {acceptedName && (
            <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 w-fit">
              <div className="w-4 h-4 rounded-md bg-violet-100 flex items-center justify-center">
                <User size={9} className="text-violet-600" />
              </div>
              {acceptedName}
            </div>
          )}
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>
      </div>

      {type === "progress" && (
        <div className="px-4 pb-4">
          <button onClick={markDone} disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700
                       text-white text-xs font-bold rounded-lg transition disabled:opacity-60">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
            {loading ? "Enregistrement…" : "Marquer comme terminée"}
          </button>
        </div>
      )}
    </motion.div>
  );
}