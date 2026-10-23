"use client";

import { use, useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  X, MapPin, Briefcase, Upload, Check, AlertCircle,
  ArrowLeft, Send, FileText, Clock,
} from "lucide-react";
import Link from "next/link";

const auth = getAuth();
const storage = getStorage();

/* ─── Auto-formatter ─────────────────────────────────────────
   Detects common patterns in job descriptions and renders them
   with appropriate hierarchy: section titles, bullet lists, bold,
   and normal paragraphs.
──────────────────────────────────────────────────────────────── */
function formatDescription(text: string): React.ReactNode[] {
  if (!text) return [];
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (key: string) => {
    if (bulletBuffer.length === 0) return;
    nodes.push(
      <ul key={key} style={{ margin: "0 0 18px", paddingLeft: 0, listStyle: "none" }}>
        {bulletBuffer.map((b, i) => (
          <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
            <span style={{ marginTop: 7, width: 5, height: 5, borderRadius: "50%", background: "#7357f6", flexShrink: 0 }} />
            <span style={{ fontSize: 15, color: "#3d3d48", lineHeight: 1.65 }}>{b}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  /* Heuristic rules */
  const isSectionTitle = (l: string) => {
    const trimmed = l.trim();
    if (!trimmed) return false;
    // All-caps line, or ends with ':', or short line (≤ 50 chars) followed by empty / bullet
    return (
      /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝ\s\d]{4,}$/.test(trimmed) ||
      trimmed.endsWith(":") ||
      (trimmed.length <= 52 && /^[A-ZÀÁÂ]/.test(trimmed) && !trimmed.includes(","))
    );
  };
  const isBullet = (l: string) =>
    /^[\-\*\•\–\—✓✔►▸▶·]\s/.test(l.trim()) || /^\d+[.)]\s/.test(l.trim());

  lines.forEach((raw, idx) => {
    const line = raw.trim();

    if (!line) {
      flushBullets(`flush-${idx}`);
      return;
    }

    if (isBullet(line)) {
      const cleaned = line.replace(/^[\-\*\•\–\—✓✔►▸▶·\d.)]\s+/, "");
      bulletBuffer.push(cleaned);
      return;
    }

    flushBullets(`flush-${idx}`);

    if (isSectionTitle(line)) {
      const label = line.endsWith(":") ? line.slice(0, -1) : line;
      nodes.push(
        <h3 key={idx} style={{
          fontFamily: "var(--font-bricolage),system-ui",
          fontWeight: 700,
          fontSize: 14,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "#7357f6",
          marginBottom: 10,
          marginTop: nodes.length > 0 ? 28 : 0,
          paddingBottom: 8,
          borderBottom: "1px solid #f1eeff",
        }}>
          {label}
        </h3>
      );
      return;
    }

    // Bold inline detection (**text** or __text__)
    const hasBold = /\*\*(.+?)\*\*|__(.+?)__/.test(line);
    if (hasBold) {
      const parts = line.split(/(\*\*[^*]+\*\*|__[^_]+__)/);
      nodes.push(
        <p key={idx} style={{ fontSize: 15, color: "#3d3d48", lineHeight: 1.7, marginBottom: 12 }}>
          {parts.map((p, i) => {
            const m = p.match(/^\*\*(.+)\*\*$/) || p.match(/^__(.+)__$/);
            return m ? <strong key={i} style={{ color: "#111118", fontWeight: 700 }}>{m[1]}</strong> : p;
          })}
        </p>
      );
      return;
    }

    nodes.push(
      <p key={idx} style={{ fontSize: 15, color: "#3d3d48", lineHeight: 1.75, marginBottom: 12 }}>
        {line}
      </p>
    );
  });

  flushBullets("flush-end");
  return nodes;
}

/* ─── Input style helper ────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e6e6eb",
  background: "#ffffff",
  fontSize: 14,
  color: "#111118",
  outline: "none",
  transition: "border-color 0.15s",
  fontFamily: "'DM Sans', system-ui",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "#6b6b78",
  marginBottom: 7,
};

/* ─── Page ──────────────────────────────────────────────────── */
export default function CareerDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [job, setJob]               = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOpen, setIsOpen]         = useState(false);
  const [fullName, setFullName]     = useState("");
  const [email, setEmail]           = useState("");
  const [message, setMessage]       = useState("");
  const [cv, setCv]                 = useState<File | null>(null);
  const [sending, setSending]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "careers", id));
      if (snap.exists()) setJob(snap.data());
      setLoading(false);
    })();
  }, [id]);

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    if (!currentUser) {
      setError("Vous devez être connecté pour postuler.");
      setSending(false);
      return;
    }
    try {
      let cvUrl = null;
      if (cv) {
        const storageRef = ref(storage, `cv/${currentUser.uid}/${Date.now()}-${cv.name}`);
        await uploadBytes(storageRef, cv);
        cvUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "applications"), {
        applicantId: currentUser.uid,
        careerId: id,
        fullName, email, message, cvUrl,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false); setSuccess(false);
        setFullName(""); setEmail(""); setMessage(""); setCv(null);
      }, 3500);
    } catch (err) {
      console.error(err);
      setError("Impossible d'envoyer la candidature. Veuillez réessayer.");
    }
    setSending(false);
  }

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e6e6eb", borderTopColor: "#7357f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 13, color: "#6b6b78", fontFamily: "'DM Sans',system-ui" }}>Chargement…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!job) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fff0f0", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <AlertCircle style={{ width: 22, height: 22, color: "#ef4444" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-bricolage),system-ui", fontWeight: 700, fontSize: 20, color: "#111118", marginBottom: 8 }}>Offre introuvable</h2>
        <p style={{ fontSize: 14, color: "#6b6b78" }}>Cette offre n'existe pas ou a été supprimée.</p>
        <Link href="/careers" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 20, fontSize: 13, fontWeight: 600, color: "#7357f6", textDecoration: "none" }}>
          <ArrowLeft style={{ width: 13, height: 13 }} /> Retour aux offres
        </Link>
      </div>
    </div>
  );

  const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    "CDI": { bg: "#eef2ff", text: "#4338ca" }, "Temps plein": { bg: "#eef2ff", text: "#4338ca" },
    "CDD": { bg: "#f0fdf4", text: "#15803d" }, "Temps partiel": { bg: "#f0fdf4", text: "#15803d" },
    "Stage": { bg: "#fff7ed", text: "#c2410c" }, "Freelance": { bg: "#fdf4ff", text: "#9333ea" },
  };
  const ts = TYPE_COLORS[job.type] ?? { bg: "#f6f6f8", text: "#6b6b78" };
  const formatted = formatDescription(job.description ?? "");

  return (
    <>
      <style>{`
        
        body { background: #ffffff !important; margin: 0; }
        * { box-sizing: border-box; font-family: 'DM Sans', system-ui; }
        h1,h2,h3 { font-family: var(--font-bricolage),system-ui; }
        .apply-btn { transition: background 0.15s, box-shadow 0.15s, transform 0.15s; }
        .apply-btn:hover { background: #7357f6 !important; box-shadow: 0 8px 24px rgba(138,107,254,0.3) !important; transform: translateY(-1px); }
        .modal-overlay { animation: fadeIn 0.15s ease; }
        .modal-card { animation: slideUp 0.2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        input:focus, textarea:focus { border-color: #7357f6 !important; box-shadow: 0 0 0 3px rgba(138,107,254,0.12); }
        .cv-drop:hover { border-color: #7357f6 !important; background: #f8f6ff !important; }
        .back-link { transition: color 0.12s; }
        .back-link:hover { color: #7357f6 !important; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#ffffff" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Back */}
          <Link href="/careers" className="back-link" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 600, color: "#6b6b78",
            textDecoration: "none", marginBottom: 28,
          }}>
            <ArrowLeft style={{ width: 13, height: 13 }} /> Toutes les offres
          </Link>

          {/* ── Job header card ── */}
          <div style={{ background: "#fff", border: "1px solid #f6f6f8", borderRadius: 20, padding: "28px 32px", marginBottom: 16 }}>

            {/* Type + location row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: ts.bg, color: ts.text }}>
                {job.type}
              </span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#e6e6eb" }} />
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#6b6b78" }}>
                <MapPin style={{ width: 12, height: 12 }} />{job.location}
              </span>
              {job.salary && (
                <>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#e6e6eb" }} />
                  <span style={{ fontSize: 13, color: "#6b6b78" }}>{job.salary}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: "var(--font-bricolage),system-ui", fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.2rem)", color: "#111118", letterSpacing: "-0.025em", marginBottom: 24, lineHeight: 1.2 }}>
              {job.title}
            </h1>

            {/* CTA row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => setIsOpen(true)} className="apply-btn" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12,
                background: "#7357f6", color: "#fff",
                fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(138,107,254,0.25)",
              }}>
                <Send style={{ width: 14, height: 14 }} /> Postuler maintenant
              </button>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b6b78" }}>
                <Clock style={{ width: 11, height: 11 }} /> Réponse sous 5 jours ouvrables
              </span>
            </div>
          </div>

          {/* ── Description card ── */}
          <div style={{ background: "#fff", border: "1px solid #f6f6f8", borderRadius: 20, padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f6f6f8" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f1eeff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase style={{ width: 14, height: 14, color: "#7357f6" }} />
              </div>
              <h2 style={{ fontFamily: "var(--font-bricolage),system-ui", fontWeight: 700, fontSize: 16, color: "#111118" }}>
                Description du poste
              </h2>
            </div>

            <div>{formatted}</div>
          </div>

          {/* ── Bottom CTA ── */}
          <div style={{
            marginTop: 20, padding: "22px 28px", borderRadius: 16,
            background: "linear-gradient(135deg,#f1eeff 0%,#faf5ff 100%)",
            border: "1px solid #d9d0fd",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <p style={{ fontFamily: "var(--font-bricolage),system-ui", fontWeight: 700, fontSize: 15, color: "#111118", marginBottom: 4 }}>
                Ce poste vous intéresse ?
              </p>
              <p style={{ fontSize: 13, color: "#6b6b78" }}>Envoyez votre candidature en moins de 2 minutes.</p>
            </div>
            <button onClick={() => setIsOpen(true)} className="apply-btn" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 22px", borderRadius: 11,
              background: "#7357f6", color: "#fff",
              fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer",
              boxShadow: "0 4px 14px rgba(138,107,254,0.25)",
            }}>
              <Send style={{ width: 13, height: 13 }} /> Postuler
            </button>
          </div>
        </div>
      </main>

      {/* ── Modal ── */}
      {isOpen && (
        <div className="modal-overlay" style={{
          position: "fixed", inset: 0, background: "rgba(15,15,20,0.55)",
          backdropFilter: "blur(4px)", display: "flex",
          alignItems: "center", justifyContent: "center", padding: 16, zIndex: 9999,
        }}>
          <div className="modal-card" style={{
            background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520,
            maxHeight: "92vh", overflowY: "auto",
            boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
          }}>

            {/* Modal header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f6f6f8", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#7357f6", marginBottom: 4 }}>
                  Candidature
                </p>
                <h2 style={{ fontFamily: "var(--font-bricolage),system-ui", fontWeight: 700, fontSize: 17, color: "#111118", lineHeight: 1.3 }}>
                  {job.title}
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ padding: 7, borderRadius: 9, background: "#f6f6f8", border: "1px solid #f6f6f8", cursor: "pointer", color: "#6b6b78", flexShrink: 0 }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "24px" }}>
              {success ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 60, height: 60, borderRadius: 18, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <Check style={{ width: 24, height: 24, color: "#22c55e" }} />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-bricolage),system-ui", fontWeight: 700, fontSize: 18, color: "#111118", marginBottom: 8 }}>
                    Candidature envoyée !
                  </h3>
                  <p style={{ fontSize: 14, color: "#6b6b78", lineHeight: 1.6 }}>
                    Merci ! Nous reviendrons vers vous très bientôt.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitApplication} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {error && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10 }}>
                      <AlertCircle style={{ width: 14, height: 14, color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Nom complet *</label>
                      <input style={inputStyle} placeholder="Jean Dupont" required value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        onFocus={e => e.target.style.borderColor = "#7357f6"}
                        onBlur={e => e.target.style.borderColor = "#e6e6eb"} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input style={inputStyle} type="email" placeholder="jean@mail.com" required value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={e => e.target.style.borderColor = "#7357f6"}
                        onBlur={e => e.target.style.borderColor = "#e6e6eb"} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Message de motivation *</label>
                    <textarea
                      style={{ ...inputStyle, minHeight: 120, resize: "none", lineHeight: 1.6 }}
                      placeholder="Parlez-nous de vous et de votre motivation…"
                      required value={message}
                      onChange={e => setMessage(e.target.value)}
                      onFocus={e => e.target.style.borderColor = "#7357f6"}
                      onBlur={e => e.target.style.borderColor = "#e6e6eb"}
                    />
                    <p style={{ fontSize: 11, color: "#6b6b78", marginTop: 5, textAlign: "right" }}>{message.length} caractères</p>
                  </div>

                  <div>
                    <label style={labelStyle}>CV (PDF)</label>
                    <input type="file" accept="application/pdf" id="cv-upload"
                      onChange={e => setCv(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
                    <label htmlFor="cv-upload" className="cv-drop" style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                      border: `2px dashed ${cv ? "#7357f6" : "#e6e6eb"}`,
                      background: cv ? "#f8f6ff" : "#ffffff",
                      transition: "all 0.15s",
                    }}>
                      {cv
                        ? <><FileText style={{ width: 15, height: 15, color: "#7357f6" }} /><span style={{ fontSize: 13, fontWeight: 600, color: "#7357f6" }}>{cv.name}</span></>
                        : <><Upload style={{ width: 14, height: 14, color: "#6b6b78" }} /><span style={{ fontSize: 13, color: "#6b6b78" }}>Cliquez pour ajouter votre CV</span></>
                      }
                    </label>
                  </div>

                  <button type="submit" disabled={sending} style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px", borderRadius: 12, border: "none",
                    background: sending ? "#c4b8ff" : "#7357f6",
                    color: "#fff", fontWeight: 700, fontSize: 14,
                    cursor: sending ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                    marginTop: 4,
                  }}>
                    {sending
                      ? <><div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Envoi…</>
                      : <><Send style={{ width: 14, height: 14 }} /> Envoyer ma candidature</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}