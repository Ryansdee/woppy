"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  doc, getDoc, collection, query, where,
  getDocs, addDoc, serverTimestamp, updateDoc, Timestamp,
} from "firebase/firestore";
import {
  Calendar, Check, CheckCircle2, Clock, GraduationCap, Loader2,
  MapPin, MessageSquare, Users,
} from "lucide-react";
import { formatRate } from "@/lib/annonce";
import { openChat } from "@/lib/chat";
import { Alert, Avatar, Badge, EmptyState, Loading, Page, PageHeader } from "@/components/ui";

interface Annonce {
  id: string; titre: string; description: string; date: string;
  duree: number; lieu: string; remuneration: number; rateMode?: string;
  statut: "ouverte" | "en cours" | "fini";
  userId: string; createdAt?: Timestamp; photos: string[];
  acceptedUserId?: string; acceptedUserName?: string;
  taskCompletion?: { author?: boolean; student?: boolean };
}
interface Candidature {
  id: string; userId: string; statut: string;
  userName: string; photoURL?: string;
}
interface Auteur { name: string; photoURL?: string }

const STATUS = {
  ouverte: { label: "Ouverte", tone: "success" },
  "en cours": { label: "En cours", tone: "warning" },
  fini: { label: "Terminée", tone: "neutral" },
} as const;

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [auteur, setAuteur] = useState<Auteur | null>(null);
  const [loading, setLoading] = useState(true);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [hasStudentProfile, setHasStudentProfile] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/auth/login"); return; }
      setUser(u);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setHasStudentProfile(snap.data()?.hasStudentProfile === true);
      } catch {}
    });
  }, [router]);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "annonces", String(id)))
      .then((snap) => {
        if (snap.exists()) setAnnonce({ id: snap.id, ...snap.data(), photos: snap.data().photos ?? [] } as Annonce);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!annonce?.userId) return;
    getDoc(doc(db, "users", annonce.userId)).then((snap) => {
      const u = snap.data();
      if (u) setAuteur({ name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "Utilisateur", photoURL: u.photoURL });
    }).catch(() => {});
  }, [annonce?.userId]);

  /* Candidatures reçues (visible par l'auteur seulement) */
  useEffect(() => {
    if (!annonce || !user || annonce.userId !== user.uid) return;
    (async () => {
      try {
        const qSnap = await getDocs(query(collection(db, "candidatures"), where("annonceId", "==", annonce.id)));
        const list = await Promise.all(qSnap.docs.map(async (d) => {
          const c = d.data();
          const uid: string = c.candidatId ?? c.userId;
          const u = (await getDoc(doc(db, "users", uid))).data();
          return {
            id: d.id,
            statut: c.statut,
            userId: uid,
            userName: u ? [u.firstName, u.lastName].filter(Boolean).join(" ") || "Utilisateur" : "Utilisateur",
            photoURL: u?.photoURL,
          };
        }));
        setCandidatures(list);
      } catch {}
    })();
  }, [annonce, user]);

  useEffect(() => {
    if (!user || !annonce) return;
    getDocs(query(collection(db, "candidatures"), where("annonceId", "==", annonce.id), where("candidatId", "==", user.uid)))
      .then((snap) => setAlreadyApplied(!snap.empty))
      .catch(() => {});
  }, [user, annonce]);

  if (loading) return <Loading full />;

  if (!annonce) {
    return (
      <Page narrow>
        <div className="card">
          <EmptyState
            title="Annonce introuvable"
            description="Elle a peut-être été supprimée."
            action={<Link href="/jobs" className="btn btn-outline">Retour aux annonces</Link>}
          />
        </div>
      </Page>
    );
  }

  const cfg = STATUS[annonce.statut] || STATUS.ouverte;
  const isOwner = user?.uid === annonce.userId;
  const isAccepted = user?.uid === annonce.acceptedUserId;
  const published = annonce.createdAt?.toDate?.().toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Page>
      <PageHeader
        back={{ href: "/jobs", label: "Annonces" }}
        title={annonce.titre}
        description={published ? `Publiée le ${published}` : undefined}
        actions={<Badge tone={cfg.tone} dot>{cfg.label}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Colonne latérale : en premier sur mobile ── */}
        <aside className="space-y-4 lg:order-2">
          <section className="card divide-y divide-line">
            <div className="p-5">
              <p className="text-sm text-muted">Rémunération</p>
              <p className="mt-1 text-2xl font-semibold">{formatRate(annonce.remuneration, annonce.rateMode)}</p>
            </div>
            <dl className="space-y-3 p-5 text-sm">
              <Detail icon={MapPin} label="Lieu" value={annonce.lieu || "—"} />
              <Detail icon={Calendar} label="Date" value={annonce.date || "—"} />
              <Detail icon={Clock} label="Durée" value={annonce.duree ? `${annonce.duree} heure${annonce.duree > 1 ? "s" : ""}` : "—"} />
            </dl>
            {auteur && (
              <div className="flex items-center gap-3 p-5">
                <Avatar name={auteur.name} src={auteur.photoURL} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{auteur.name}</p>
                  <p className="text-xs text-muted">Auteur de l&apos;annonce</p>
                </div>
              </div>
            )}
          </section>

          {!isOwner && !isAccepted && annonce.statut === "ouverte" && user && (
            <Apply annonce={annonce} user={user} hasStudentProfile={hasStudentProfile} alreadyApplied={alreadyApplied} onApplied={() => setAlreadyApplied(true)} />
          )}
          {isAccepted && <Alert tone="success">Votre candidature a été acceptée pour cette mission.</Alert>}
        </aside>

        {/* ── Colonne principale ── */}
        <div className="space-y-6 lg:order-1">
          {annonce.photos.length > 0 && (
            <div className={`grid gap-2 ${annonce.photos.length > 1 ? "grid-cols-2" : ""}`}>
              {annonce.photos.map((p, i) => (
                <div key={i} className={`relative overflow-hidden rounded-xl bg-paper-2 ${i === 0 && annonce.photos.length > 1 ? "col-span-2 h-64" : "h-40"}`}>
                  <Image src={p} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <section className="card p-5">
            <h2 className="text-[15px] font-semibold">Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-2">{annonce.description}</p>
          </section>

          {isOwner && (
            <Applicants
              annonce={annonce}
              candidatures={candidatures}
              onAccepted={(c) => {
                setAnnonce({ ...annonce, statut: "en cours", acceptedUserId: c.userId, acceptedUserName: c.userName, taskCompletion: { author: false, student: false } });
                setCandidatures((list) => list.map((x) => (x.id === c.id ? { ...x, statut: "acceptée" } : x)));
              }}
            />
          )}

          {(isOwner || isAccepted) && annonce.acceptedUserId && user && (
            <TaskCompletion annonce={annonce} user={user} setAnnonce={setAnnonce} />
          )}
        </div>
      </div>
    </Page>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-muted" />
      <div className="min-w-0">
        <dt className="text-muted">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  );
}

/* ── Postuler ── */
function Apply({ annonce, user, hasStudentProfile, alreadyApplied, onApplied }: {
  annonce: Annonce; user: User; hasStudentProfile: boolean; alreadyApplied: boolean; onApplied: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!hasStudentProfile) {
    return (
      <div className="card p-5">
        <div className="flex gap-3">
          <GraduationCap size={18} className="mt-0.5 shrink-0 text-brand" />
          <div>
            <p className="text-sm font-medium">Profil étudiant requis</p>
            <p className="mt-1 text-sm text-muted">Activez votre profil étudiant pour postuler.</p>
          </div>
        </div>
        <Link href="/dashboard/profile" className="btn btn-primary mt-4 w-full">Activer mon profil</Link>
      </div>
    );
  }

  if (alreadyApplied) return <Alert tone="success">Candidature envoyée. L&apos;auteur a été prévenu.</Alert>;

  async function apply() {
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "candidatures"), {
        annonceId: annonce.id, candidatId: user.uid,
        date: serverTimestamp(), statut: "en attente",
      });
      await addDoc(collection(db, "notifications"), {
        toUser: annonce.userId, fromUser: user.uid,
        type: "nouvelle_candidature", annonceId: annonce.id,
        message: "Un étudiant a postulé à votre annonce.",
        createdAt: serverTimestamp(), read: false,
      });
      onApplied();
    } catch {
      setError("La candidature n’a pas pu être envoyée. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-3 p-5">
      <button onClick={apply} disabled={loading} className="btn btn-primary btn-lg w-full">
        {loading ? <Loader2 size={16} className="animate-spin" /> : null} Postuler
      </button>
      <p className="text-center text-xs text-muted">L&apos;auteur recevra une notification et pourra voir votre profil.</p>
      {error && <Alert tone="danger">{error}</Alert>}
    </div>
  );
}

/* ── Candidatures reçues ── */
function Applicants({ annonce, candidatures, onAccepted }: {
  annonce: Annonce; candidatures: Candidature[]; onAccepted: (c: Candidature) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function accept(c: Candidature) {
    if (!confirm(`Accepter la candidature de ${c.userName} ?`)) return;
    setBusy(c.id);
    try {
      await updateDoc(doc(db, "annonces", annonce.id), {
        statut: "en cours", acceptedUserId: c.userId, acceptedUserName: c.userName,
        taskCompletion: { author: false, student: false },
      });
      await updateDoc(doc(db, "candidatures", c.id), { statut: "acceptée" });
      await addDoc(collection(db, "notifications"), {
        toUser: c.userId, fromUser: annonce.userId, type: "acceptation",
        annonceId: annonce.id, message: "Votre candidature a été acceptée.",
        createdAt: serverTimestamp(), read: false,
      });
      onAccepted(c);
    } catch {} finally {
      setBusy(null);
    }
  }

  async function messageApplicant(targetId: string) {
    try {
      router.push(`/messages?chatId=${await openChat(annonce.userId, targetId, annonce.id)}`);
    } catch {}
  }

  return (
    <section className="card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-[15px] font-semibold">Candidatures reçues</h2>
        <Badge>{candidatures.length}</Badge>
      </div>
      {candidatures.length === 0 ? (
        <EmptyState icon={Users} title="Aucune candidature pour l’instant" description="Vous serez prévenu dès qu’un étudiant postule." />
      ) : (
        <ul className="divide-y divide-line">
          {candidatures.map((c) => {
            const accepted = annonce.acceptedUserId === c.userId;
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <Avatar name={c.userName} src={c.photoURL} size={36} />
                <div className="min-w-0 flex-1">
                  <Link href={`/profile/${c.userId}`} className="truncate text-sm font-medium hover:underline">{c.userName}</Link>
                  <p className="text-xs text-muted">{accepted ? "Acceptée" : "En attente"}</p>
                </div>
                <button onClick={() => messageApplicant(c.userId)} className="btn btn-outline btn-sm">
                  <MessageSquare size={14} /> Message
                </button>
                {accepted ? (
                  <Badge tone="success"><Check size={12} /> Accepté</Badge>
                ) : (
                  annonce.statut === "ouverte" && (
                    <button onClick={() => accept(c)} disabled={busy === c.id} className="btn btn-primary btn-sm">
                      {busy === c.id && <Loader2 size={14} className="animate-spin" />} Accepter
                    </button>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ── Confirmation de fin de mission ── */
function TaskCompletion({ annonce, user, setAnnonce }: { annonce: Annonce; user: User; setAnnonce: (a: Annonce) => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isAuthor = user.uid === annonce.userId;
  const isStudent = user.uid === annonce.acceptedUserId;
  const myDone = isAuthor ? annonce.taskCompletion?.author : annonce.taskCompletion?.student;
  const otherDone = isAuthor ? annonce.taskCompletion?.student : annonce.taskCompletion?.author;

  async function confirmDone() {
    setBusy(true);
    try {
      const update = {
        author: Boolean(annonce.taskCompletion?.author || isAuthor),
        student: Boolean(annonce.taskCompletion?.student || isStudent),
      };
      const finished = update.author && update.student;
      await updateDoc(doc(db, "annonces", annonce.id), { taskCompletion: update, ...(finished ? { statut: "fini" } : {}) });
      setAnnonce({ ...annonce, taskCompletion: update, ...(finished ? { statut: "fini" as const } : {}) });
      if (finished && isAuthor) router.push(`/review/${annonce.acceptedUserId}?annonceId=${annonce.id}`);
    } catch {} finally {
      setBusy(false);
    }
  }

  const rows = [
    { label: isAuthor ? "Votre confirmation" : "Confirmation de l’auteur", done: annonce.taskCompletion?.author },
    { label: isAuthor ? "Confirmation de l’étudiant" : "Votre confirmation", done: annonce.taskCompletion?.student },
  ];

  return (
    <section className="card p-5">
      <h2 className="text-[15px] font-semibold">Fin de mission</h2>
      <p className="mt-1 text-sm text-muted">La mission est terminée quand les deux parties ont confirmé.</p>
      <ul className="mt-4 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className={r.done ? "text-success" : "text-line"} />
            <span className={r.done ? "font-medium" : "text-muted"}>{r.label}</span>
          </li>
        ))}
      </ul>
      {myDone ? (
        <p className="mt-4 text-sm text-muted">{otherDone ? "Mission terminée." : "En attente de l’autre partie."}</p>
      ) : (
        <button onClick={confirmDone} disabled={busy} className="btn btn-primary mt-4">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Confirmer la fin de mission
        </button>
      )}
    </section>
  );
}
