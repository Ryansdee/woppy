"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc, getDoc, collection, query, where,
  getDocs, addDoc, serverTimestamp, updateDoc,
} from "firebase/firestore";
import {
  ChevronLeft, MapPin, Calendar, Clock, Euro, User,
  Loader2, AlertCircle, CheckCircle, MessageSquare,
  ArrowRight, GraduationCap, Briefcase, ChevronRight,
} from "lucide-react";

interface Annonce {
  id: string; titre: string; description: string; date: string;
  duree: number; lieu: string; remuneration: number;
  statut: "ouverte" | "en cours" | "fini";
  userId: string; createdAt?: any; photos: string[];
  acceptedUserId?: string; acceptedUserName?: string;
  taskCompletion?: { author?: boolean; student?: boolean };
}
interface Candidature {
  id: string; userId: string; statut: string; date: any;
  userName?: string; photoURL?: string;
}
interface AuteurUser { firstName?: string; lastName?: string; photoURL?: string; }

const STATUS_CFG = {
  ouverte:    { label: "Ouverte",   dot: "#22c55e", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  "en cours": { label: "En cours",  dot: "#f59e0b", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  fini:       { label: "Terminée",  dot: "#94a3b8", color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
};

export default function JobDetailPage() {
  const { id }  = useParams();
  const router  = useRouter();

  const [user, setUser]                         = useState<any>(null);
  const [annonce, setAnnonce]                   = useState<Annonce | null>(null);
  const [auteur, setAuteur]                     = useState<AuteurUser | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [candidatures, setCandidatures]         = useState<Candidature[]>([]);
  const [hasStudentProfile, setHasStudentProfile] = useState(false);
  const [alreadyApplied, setAlreadyApplied]     = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/auth/login"); return; }
      setUser(u);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) setHasStudentProfile(snap.data().hasStudentProfile === true);
      } catch {}
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    async function fetch() {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, "annonces", String(id)));
        if (snap.exists()) setAnnonce({ id: snap.id, ...snap.data(), photos: snap.data().photos ?? [] } as Annonce);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetch();
  }, [id]);

  useEffect(() => {
    if (!annonce?.userId) return;
    getDoc(doc(db, "users", annonce.userId)).then(snap => {
      if (snap.exists()) {
        const u = snap.data();
        setAuteur({
          firstName: u.firstName, lastName: u.lastName,
          photoURL: u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${u.firstName} ${u.lastName}`)}&background=7c5fe6&color=fff`
        });
      }
    });
  }, [annonce]);

  useEffect(() => {
    async function fetchCandidatures() {
      if (!annonce || !user || annonce.userId !== user.uid) return;
      try {
        const qSnap = await getDocs(query(collection(db, "candidatures"), where("annonceId", "==", annonce.id)));
        const list = await Promise.all(qSnap.docs.map(async d => {
          const c = d.data() as any;
          const uid = c.candidatId ?? c.userId;
          const uSnap = await getDoc(doc(db, "users", uid));
          let name = "Utilisateur", photo = "";
          if (uSnap.exists()) {
            const u = uSnap.data();
            name = `${u.firstName} ${u.lastName}`.trim();
            photo = u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c5fe6&color=fff`;
          }
          return { id: d.id, ...c, userId: uid, userName: name, photoURL: photo };
        }));
        setCandidatures(list);
      } catch (e) { console.error(e); }
    }
    fetchCandidatures();
  }, [annonce, user]);

  useEffect(() => {
    async function check() {
      if (!user || !annonce) return;
      const snap = await getDocs(query(collection(db, "candidatures"),
        where("annonceId", "==", annonce.id),
        where("candidatId", "==", user.uid)));
      setAlreadyApplied(!snap.empty);
    }
    check();
  }, [user, annonce]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center animate-pulse">
          <Briefcase size={18} className="text-white" />
        </div>
        <p className="text-sm text-slate-500">Chargement…</p>
      </div>
    </div>
  );

  if (!annonce) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
        <AlertCircle size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600">Annonce introuvable.</p>
      <Link href="/jobs" className="text-xs text-violet-600 hover:underline">Retour aux annonces</Link>
    </div>
  );

  const cfg       = STATUS_CFG[annonce.statut] || STATUS_CFG["ouverte"];
  const auteurNom = auteur?.firstName ? `${auteur.firstName} ${auteur.lastName || ""}`.trim() : "Utilisateur";
  const isOwner   = user?.uid === annonce.userId;
  const isAccepted = user?.uid === annonce.acceptedUserId;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&display=swap');`}</style>

      <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
            <Link href="/jobs" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0">
              <ChevronLeft size={18} />
            </Link>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <span className="text-sm font-semibold text-slate-900 truncate flex-1" style={{ fontFamily: 'Sora, system-ui' }}>
              {annonce.titre}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
              <span className="hidden sm:inline">{cfg.label}</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

          {/* Layout : colonne sur mobile, grid sur desktop */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">

            {/* ── Colonne principale ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Photos */}
              {annonce.photos.length > 0 && (
                <div className={`grid gap-2 ${annonce.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {annonce.photos.map((p, i) => (
                    <div key={i}
                      className={`relative overflow-hidden rounded-xl bg-slate-100
                        ${i === 0 && annonce.photos.length > 1 ? 'col-span-2' : ''}`}
                      style={{ height: i === 0 && annonce.photos.length > 1 ? 200 : 120 }}>
                      <Image src={p} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Titre */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 tracking-tight"
                  style={{ fontFamily: 'Sora, system-ui' }}>
                  {annonce.titre}
                </h1>
                <p className="text-xs text-slate-400">
                  {annonce.createdAt?.seconds
                    ? new Date(annonce.createdAt.seconds * 1000).toLocaleDateString("fr-BE", {
                        day: "numeric", month: "long", year: "numeric"
                      })
                    : "Date inconnue"}
                </p>
              </div>

              {/* Détails — visible sur mobile ici, caché sur desktop (sidebar) */}
              <div className="lg:hidden bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Détails</h2>
                {[
                  { icon: <Euro size={13} />, label: "Rémunération", value: `${annonce.remuneration} €/h`, bold: true },
                  { icon: <MapPin size={13} />, label: "Lieu", value: annonce.lieu },
                  { icon: <Calendar size={13} />, label: "Date", value: annonce.date },
                  { icon: <Clock size={13} />, label: "Durée", value: `${annonce.duree} heure${annonce.duree > 1 ? 's' : ''}` },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{item.label}</p>
                      <p className={`text-sm truncate ${item.bold ? 'font-bold text-violet-700' : 'font-medium text-slate-800'}`}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA mobile */}
              {!isOwner && !isAccepted && annonce.statut === "ouverte" && (
                <div className="lg:hidden">
                  <PostulerAnnonce
                    annonce={annonce} user={user}
                    hasStudentProfile={hasStudentProfile}
                    alreadyApplied={alreadyApplied}
                    setAlreadyApplied={setAlreadyApplied}
                  />
                </div>
              )}

              {isAccepted && (
                <div className="lg:hidden bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Candidature acceptée</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Tu as été sélectionné pour cette mission.</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description</h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{annonce.description}</p>
              </div>

              {/* Auteur — mobile */}
              {auteur && (
                <div className="lg:hidden bg-white rounded-2xl border border-slate-100 p-5">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Publié par</h2>
                  <div className="flex items-center gap-3">
                    <Image
                      src={auteur.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(auteurNom)}&background=7c5fe6&color=fff`}
                      alt={auteurNom} width={40} height={40}
                      className="rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{auteurNom}</p>
                      <p className="text-xs text-slate-400">Particulier</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Candidatures (owner) */}
              {isOwner && (
                <AuteurCandidatures
                  annonce={annonce}
                  candidatures={candidatures}
                  setAnnonce={setAnnonce}
                  setCandidatures={setCandidatures}
                />
              )}

              {/* Confirmation mission */}
              {(isOwner || isAccepted) && annonce.acceptedUserId && (
                <TaskCompletion annonce={annonce} user={user} setAnnonce={setAnnonce} />
              )}
            </div>

            {/* ── Sidebar desktop ── */}
            <div className="hidden lg:flex flex-col gap-4">

              {/* Détails */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Détails</h2>
                {[
                  { icon: <Euro size={14} />, label: "Rémunération", value: `${annonce.remuneration} €/h`, bold: true },
                  { icon: <MapPin size={14} />, label: "Lieu", value: annonce.lieu },
                  { icon: <Calendar size={14} />, label: "Date", value: annonce.date },
                  { icon: <Clock size={14} />, label: "Durée", value: `${annonce.duree} heure${annonce.duree > 1 ? 's' : ''}` },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{item.label}</p>
                      <p className={`text-sm text-slate-800 truncate ${item.bold ? 'font-bold text-violet-700' : 'font-medium'}`}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Auteur */}
              {auteur && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Publié par</h2>
                  <div className="flex items-center gap-3">
                    <Image
                      src={auteur.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(auteurNom)}&background=7c5fe6&color=fff`}
                      alt={auteurNom} width={40} height={40}
                      className="rounded-xl object-cover border border-slate-100"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{auteurNom}</p>
                      <p className="text-xs text-slate-400">Particulier</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA postuler */}
              {!isOwner && !isAccepted && annonce.statut === "ouverte" && (
                <PostulerAnnonce
                  annonce={annonce} user={user}
                  hasStudentProfile={hasStudentProfile}
                  alreadyApplied={alreadyApplied}
                  setAlreadyApplied={setAlreadyApplied}
                />
              )}

              {isAccepted && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Candidature acceptée</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Tu as été sélectionné pour cette mission.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── PostulerAnnonce ── */
function PostulerAnnonce({ annonce, user, hasStudentProfile, alreadyApplied, setAlreadyApplied }: {
  annonce: Annonce; user: any; hasStudentProfile: boolean;
  alreadyApplied: boolean; setAlreadyApplied: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!hasStudentProfile) return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-start gap-3 mb-3">
        <GraduationCap size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Profil étudiant requis</p>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Pour postuler, tu dois activer ton profil étudiant depuis ton tableau de bord.
          </p>
        </div>
      </div>
      <Link href="/dashboard/profile"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition">
        Activer mon profil étudiant <ArrowRight size={13} />
      </Link>
    </div>
  );

  if (alreadyApplied || success) return (
    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
      <CheckCircle size={16} className="text-violet-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-violet-800">Candidature envoyée</p>
        <p className="text-xs text-violet-600 mt-0.5">Le client recevra une notification.</p>
      </div>
    </div>
  );

  async function postuler() {
    if (!user) return;
    setLoading(true);
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
      setSuccess(true);
      setAlreadyApplied(true);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <p className="text-xs text-slate-400 mb-3">
        En postulant, le client recevra une notification et pourra consulter ton profil.
      </p>
      <button onClick={postuler} disabled={loading}
        className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ fontFamily: 'Sora, system-ui' }}>
        {loading
          ? <><Loader2 size={14} className="animate-spin" /> Envoi…</>
          : <>Postuler à cette annonce <ChevronRight size={14} /></>}
      </button>
    </div>
  );
}

/* ── AuteurCandidatures ── */
function AuteurCandidatures({ annonce, candidatures, setAnnonce, setCandidatures }: any) {
  const router = useRouter();

  async function accepter(c: Candidature) {
    try {
      await updateDoc(doc(db, "annonces", annonce.id), {
        statut: "en cours", acceptedUserId: c.userId,
        acceptedUserName: c.userName,
        taskCompletion: { author: false, student: false },
      });
      await updateDoc(doc(db, "candidatures", c.id), { statut: "acceptée" });
      await addDoc(collection(db, "notifications"), {
        toUser: c.userId, fromUser: annonce.userId, type: "acceptation",
        annonceId: annonce.id, message: "Votre candidature a été acceptée 🎉",
        createdAt: serverTimestamp(), read: false,
      });
      setAnnonce({
        ...annonce, statut: "en cours",
        acceptedUserId: c.userId, acceptedUserName: c.userName,
        taskCompletion: { author: false, student: false },
      });
    } catch (e) { console.error(e); }
  }

  async function openChat(targetId: string) {
    try {
      const snap = await getDocs(query(collection(db, "chats"),
        where("participants", "array-contains", annonce.userId)));
      let chatId: string | null = null;
      for (const d of snap.docs) {
        if (d.data().participants.includes(targetId)) { chatId = d.id; break; }
      }
      if (!chatId) {
        const newChat = await addDoc(collection(db, "chats"), {
          participants: [annonce.userId, targetId],
          annonceId: annonce.id, createdAt: serverTimestamp(),
          lastMessage: "", lastMessageTime: serverTimestamp(),
        });
        chatId = newChat.id;
      }
      router.push(`/messages?chatId=${chatId}`);
    } catch (e) { console.error(e); }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        Candidatures reçues
        {candidatures.length > 0 && (
          <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-[10px] font-bold normal-case">
            {candidatures.length}
          </span>
        )}
      </h3>

      {candidatures.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2">
            <User size={16} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">Aucune candidature pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidatures.map((c: Candidature) => (
            <div key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 min-w-0">
                <Image src={c.photoURL || ""} alt={c.userName || ""}
                  width={36} height={36}
                  className="rounded-xl object-cover border border-slate-200 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{c.userName}</p>
                  <span className="text-[11px] font-medium"
                    style={{ color: c.statut === "acceptée" ? "#15803d" : "#64748b" }}>
                    {c.statut === "acceptée" ? "✓ Acceptée" : "En attente"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openChat(c.userId)}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-violet-600 transition">
                  <MessageSquare size={14} />
                </button>
                <button onClick={() => accepter(c)}
                  disabled={annonce.acceptedUserId === c.userId}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    annonce.acceptedUserId === c.userId
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                      : "bg-violet-600 hover:bg-violet-700 text-white"
                  }`}>
                  {annonce.acceptedUserId === c.userId ? "Accepté" : "Accepter"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── TaskCompletion ── */
function TaskCompletion({ annonce, user, setAnnonce }: any) {
  const router    = useRouter();
  const isAuthor  = user.uid === annonce.userId;
  const isStudent = user.uid === annonce.acceptedUserId;
  const myDone    = isAuthor ? annonce.taskCompletion?.author : annonce.taskCompletion?.student;
  const otherDone = isAuthor ? annonce.taskCompletion?.student : annonce.taskCompletion?.author;

  async function confirm() {
    try {
      const update = {
        author:  annonce.taskCompletion?.author  || isAuthor,
        student: annonce.taskCompletion?.student || isStudent,
      };
      await updateDoc(doc(db, "annonces", annonce.id), { taskCompletion: update });
      setAnnonce({ ...annonce, taskCompletion: update });
      if (update.author && update.student) {
        await updateDoc(doc(db, "annonces", annonce.id), { statut: "fini" });
        if (isAuthor) router.push(`/review/${annonce.acceptedUserId}?annonceId=${annonce.id}`);
      }
    } catch (e) { console.error(e); }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Confirmer la mission</h3>
      <div className="space-y-2 mb-4">
        {[
          { label: isAuthor ? "Ma confirmation (client)" : "Confirmation du client", done: annonce.taskCompletion?.author },
          { label: isAuthor ? "Confirmation de l'étudiant" : "Ma confirmation (étudiant)", done: annonce.taskCompletion?.student },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2.5 text-sm">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              {item.done && <CheckCircle size={10} className="text-white" />}
            </div>
            <span className={item.done ? "text-emerald-700 font-medium" : "text-slate-500"}>{item.label}</span>
          </div>
        ))}
      </div>
      {myDone ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
          <CheckCircle size={14} className="text-emerald-500 shrink-0" />
          {otherDone ? "Mission terminée par les deux parties." : "En attente de la confirmation de l'autre partie."}
        </div>
      ) : (
        <button onClick={confirm}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2"
          style={{ fontFamily: 'Sora, system-ui' }}>
          <CheckCircle size={14} /> Confirmer la mission effectuée
        </button>
      )}
    </div>
  );
}