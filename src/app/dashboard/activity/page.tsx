"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Calendar, ChevronRight, FileText, GraduationCap, MapPin, User } from "lucide-react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { collection, query, where, getDocs, getDoc, doc, type DocumentData } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { formatRate, shortPlace } from "@/lib/annonce";
import { Badge, EmptyState, Loading, Page, PageHeader, Stat, Tabs } from "@/components/ui";

type Annonce = DocumentData & { id: string };
type Tone = "info" | "brand" | "success" | "warning";

/* Les actions (accepter, confirmer la fin) se font sur la fiche de l'annonce,
   où la confirmation des deux parties est gérée. */
export default function ActivityPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isStudent, setIsStudent] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"jobs" | "annonces">("jobs");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState({ pending: [] as Annonce[], selected: [] as Annonce[], done: [] as Annonce[] });
  const [ads, setAds] = useState({ open: [] as Annonce[], progress: [] as Annonce[], done: [] as Annonce[] });

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { window.location.href = "/auth/login"; return; }
      setUser(u);
      let student = false;
      try {
        student = (await getDoc(doc(db, "users", u.uid))).data()?.hasStudentProfile === true;
      } catch {}
      setIsStudent(student);
      if (!student) setTab("annonces");
    });
  }, []);

  useEffect(() => {
    if (!user || isStudent === null) return;
    const uid = user.uid;
    const list = (snap: { docs: { id: string; data: () => DocumentData }[] }): Annonce[] => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    (async () => {
      try {
        if (isStudent) {
          const cSnap = await getDocs(query(collection(db, "candidatures"), where("candidatId", "==", uid)));
          const applied = (await Promise.all(cSnap.docs.map(async (d) => {
            const s = await getDoc(doc(db, "annonces", d.data().annonceId));
            return s.exists() ? { id: s.id, ...s.data() } : null;
          }))).filter((a): a is Annonce => a !== null);
          const mine = list(await getDocs(query(collection(db, "annonces"), where("acceptedUserId", "==", uid))));
          setJobs({
            pending: applied.filter((a) => !a.acceptedUserId),
            selected: mine.filter((a) => a.statut !== "fini"),
            done: mine.filter((a) => a.statut === "fini"),
          });
        }
        const published = list(await getDocs(query(collection(db, "annonces"), where("userId", "==", uid))));
        setAds({
          open: published.filter((a) => a.statut === "ouverte"),
          progress: published.filter((a) => a.statut !== "fini" && a.statut !== "ouverte"),
          done: published.filter((a) => a.statut === "fini"),
        });
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [user, isStudent]);

  if (!user || isStudent === null) return <Loading full />;

  return (
    <Page>
      <PageHeader
        title="Mon activité"
        description="Vos candidatures et vos annonces."
        actions={<Link href="/jobs/create" className="btn btn-primary">Publier une annonce</Link>}
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "jobs", label: "Mes missions", icon: Briefcase },
          { value: "annonces", label: "Mes annonces", icon: FileText },
        ]}
      />

      <div className="mt-6">
        {loading ? (
          <Loading />
        ) : tab === "jobs" ? (
          !isStudent ? (
            <div className="card">
              <EmptyState
                icon={GraduationCap}
                title="Profil étudiant requis"
                description="Activez votre profil étudiant pour postuler aux missions."
                action={<Link href="/dashboard/profile" className="btn btn-primary">Activer mon profil</Link>}
              />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <Stat label="En attente" value={jobs.pending.length} />
                <Stat label="Sélectionné" value={jobs.selected.length} />
                <Stat label="Terminées" value={jobs.done.length} />
              </div>
              <Group title="Candidatures en attente" items={jobs.pending} badge={{ label: "En attente", tone: "info" }} empty="Aucune candidature en attente." />
              <Group title="Missions où je suis sélectionné" items={jobs.selected} badge={{ label: "Sélectionné", tone: "brand" }} empty="Aucune mission en cours." />
              <Group title="Missions terminées" items={jobs.done} badge={{ label: "Terminée", tone: "success" }} empty="Aucune mission terminée." />
            </div>
          )
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Ouvertes" value={ads.open.length} />
              <Stat label="En cours" value={ads.progress.length} />
              <Stat label="Terminées" value={ads.done.length} />
            </div>
            <Group
              title="Annonces ouvertes"
              items={ads.open}
              badge={{ label: "Ouverte", tone: "success" }}
              empty="Aucune annonce ouverte."
              emptyAction={<Link href="/jobs/create" className="btn btn-outline btn-sm">Publier une annonce</Link>}
            />
            <Group title="Annonces en cours" items={ads.progress} badge={{ label: "En cours", tone: "warning" }} empty="Aucune annonce en cours." showAccepted />
            <Group title="Annonces terminées" items={ads.done} badge={{ label: "Terminée", tone: "success" }} empty="Aucune annonce terminée." showAccepted />
          </div>
        )}
      </div>
    </Page>
  );
}

function Group({ title, items, badge, empty, emptyAction, showAccepted }: {
  title: string;
  items: Annonce[];
  badge: { label: string; tone: Tone };
  empty: string;
  emptyAction?: React.ReactNode;
  showAccepted?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <Badge>{items.length}</Badge>
      </div>
      <div className="card divide-y divide-line">
        {items.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted">
            {empty} {emptyAction}
          </div>
        ) : (
          items.map((a) => <Row key={a.id} annonce={a} badge={badge} showAccepted={showAccepted} />)
        )}
      </div>
    </section>
  );
}

function Row({ annonce, badge, showAccepted }: { annonce: Annonce; badge: { label: string; tone: Tone }; showAccepted?: boolean }) {
  const name = annonce.acceptedUserName as string | undefined;
  return (
    <Link href={`/jobs/${annonce.id}`} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-paper-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium group-hover:text-brand">{annonce.titre || "Mission"}</p>
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {annonce.lieu && <span className="inline-flex min-w-0 items-center gap-1"><MapPin size={13} className="shrink-0" /><span className="truncate">{shortPlace(annonce.lieu)}</span></span>}
          {annonce.date && <span className="inline-flex items-center gap-1"><Calendar size={13} /> {annonce.date}</span>}
          {annonce.remuneration != null && <span>{formatRate(annonce.remuneration, annonce.rateMode)}</span>}
          {showAccepted && name && <span className="inline-flex items-center gap-1"><User size={13} /> {name}</span>}
        </p>
      </div>
      <ChevronRight size={16} className="shrink-0 text-muted" />
    </Link>
  );
}
