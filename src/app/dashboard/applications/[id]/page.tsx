"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, CheckCircle2, Download, Eye, Loader2, Mail, MapPin } from "lucide-react";
import StaffShell from "@/components/staff/StaffShell";

type Application = {
  id: string;
  fullName?: string;
  email?: string;
  message?: string;
  careerId?: string;
  cvUrl?: string | null;
  status?: string;
  createdAt?: { seconds: number };
};

type Career = { title?: string; location?: string; type?: string };

export default function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <StaffShell
      adminOnly
      title="Candidature"
      actions={
        <Link href="/dashboard/applications" className="btn btn-outline">
          <ArrowLeft size={16} /> Toutes les candidatures
        </Link>
      }
    >
      {() => <ApplicationDetails id={id} />}
    </StaffShell>
  );
}

function ApplicationDetails({ id }: { id: string }) {
  const [application, setApplication] = useState<Application | null>(null);
  const [career, setCareer] = useState<Career | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading");
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const appSnap = await getDoc(doc(db, "applications", id));
        if (!appSnap.exists()) {
          setState("missing");
          return;
        }
        const data = { id, ...(appSnap.data() as Omit<Application, "id">) };
        setApplication(data);
        if (data.careerId) {
          const careerSnap = await getDoc(doc(db, "careers", data.careerId));
          if (careerSnap.exists()) setCareer(careerSnap.data() as Career);
        }
        setState("ok");
      } catch {
        setState("error");
      }
    })();
  }, [id]);

  async function markAsSeen() {
    setMarking(true);
    try {
      await updateDoc(doc(db, "applications", id), { status: "seen" });
      setApplication((prev) => (prev ? { ...prev, status: "seen" } : prev));
    } finally {
      setMarking(false);
    }
  }

  if (state === "loading") {
    return (
      <p className="flex items-center gap-2 py-10 text-sm text-muted">
        <Loader2 size={16} className="animate-spin" /> Chargement…
      </p>
    );
  }

  if (state !== "ok" || !application) {
    return (
      <div className="card p-10 text-center">
        <p className="text-ink-2">
          {state === "missing" ? "Cette candidature n’existe pas ou a été supprimée." : "Impossible de charger la candidature."}
        </p>
      </div>
    );
  }

  const seen = application.status === "seen";
  const date = application.createdAt
    ? new Date(application.createdAt.seconds * 1000).toLocaleString("fr-BE", { dateStyle: "long", timeStyle: "short" })
    : "—";
  const mailSubject = encodeURIComponent(`Votre candidature${career?.title ? ` – ${career.title}` : ""}`);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="display text-2xl">{application.fullName || "Sans nom"}</h2>
              {application.email && (
                <a href={`mailto:${application.email}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                  <Mail size={13} /> {application.email}
                </a>
              )}
              <p className="mt-1 text-sm text-muted">Reçue le {date}</p>
            </div>
            <span className={`chip ${seen ? "!border-green-200 !bg-green-50 !text-green-700" : "!border-amber-200 !bg-amber-50 !text-amber-700"}`}>
              {seen ? "Vue" : "Nouvelle"}
            </span>
          </div>

          <h3 className="eyebrow mt-6">Message</h3>
          <p className="mt-2 whitespace-pre-line rounded-xl bg-paper-2 p-4 leading-relaxed text-ink-2">
            {application.message || "Aucun message."}
          </p>
        </section>

        {application.cvUrl && (
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h3 className="font-semibold">CV</h3>
              <a href={application.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                <Download size={14} /> Télécharger
              </a>
            </div>
            <iframe src={application.cvUrl} title="CV du candidat" className="h-[600px] w-full" />
          </section>
        )}
      </div>

      <aside className="space-y-4">
        <section className="card p-5">
          <h3 className="eyebrow">Offre concernée</h3>
          {career ? (
            <>
              <p className="mt-2 font-display text-lg font-semibold">{career.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                {career.location && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {career.location}</span>}
                {career.type && <span className="chip">{career.type}</span>}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">Offre supprimée.</p>
          )}
        </section>

        <section className="card space-y-2 p-5">
          {seen ? (
            <p className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 size={16} /> Candidature déjà vue
            </p>
          ) : (
            <button onClick={markAsSeen} disabled={marking} className="btn btn-primary w-full">
              {marking ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />} Marquer comme vue
            </button>
          )}
          {application.email && (
            <a href={`mailto:${application.email}?subject=${mailSubject}`} className="btn btn-outline w-full">
              <Mail size={16} /> Répondre par email
            </a>
          )}
        </section>
      </aside>
    </div>
  );
}
