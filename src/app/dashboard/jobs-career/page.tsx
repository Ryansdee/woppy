"use client";

import { FormEvent, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Briefcase, MapPin, FileText, Link as LinkIcon,
  CheckCircle, AlertCircle, Save, Eye, EyeOff,
  Loader2, ArrowRight, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Helpers ────────────────────────────────────────────── */
const CONTRACT_TYPES = [
  { value: "CDI",       color: "#4338ca", bg: "#eef2ff", border: "#c7d2fe" },
  { value: "CDD",       color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  { value: "Stage",     color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
  { value: "Freelance", color: "#9333ea", bg: "#fdf4ff", border: "#e9d5ff" },
  { value: "Étudiant",  color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  { value: "Autre",     color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
];

const FIELD_LABEL: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#9ca3af",
  marginBottom: 7,
  fontFamily: "'DM Sans', system-ui",
};

const INPUT_BASE: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e2e0db",
  background: "#faf9f7",
  fontSize: 14,
  color: "#1a1a2e",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  fontFamily: "'DM Sans', system-ui",
};

/* ─── formatDescription (preview) ───────────────────────── */
function PreviewDescription({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (k: string) => {
    if (!bullets.length) return;
    nodes.push(
      <ul key={k} style={{ margin: "0 0 14px", paddingLeft: 0, listStyle: "none" }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ display: "flex", gap: 9, marginBottom: 6 }}>
            <span style={{ marginTop: 7, width: 5, height: 5, borderRadius: "50%", background: "#8a6bfe", flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: "#4b4b58", lineHeight: 1.65 }}>{b}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };
  lines.forEach((raw, i) => {
    const l = raw.trim();
    if (!l) { flush(`f${i}`); return; }
    if (/^[\-\*\•\–✓►]\s/.test(l) || /^\d+[.)]\s/.test(l)) {
      bullets.push(l.replace(/^[\-\*\•\–✓►\d.)]\s+/, "")); return;
    }
    flush(`f${i}`);
    const isTitle = l.endsWith(":") || (l.length <= 52 && /^[A-ZÀÁÂ]/.test(l) && !l.includes(",")) || /^[A-Z\s]{4,}$/.test(l);
    if (isTitle) {
      nodes.push(<p key={i} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a6bfe", marginBottom: 8, marginTop: nodes.length ? 20 : 0 }}>{l.replace(/:$/, "")}</p>);
    } else {
      nodes.push(<p key={i} style={{ fontSize: 14, color: "#4b4b58", lineHeight: 1.75, marginBottom: 10 }}>{l}</p>);
    }
  });
  flush("end");
  return <>{nodes}</>;
}

/* ─── Page ───────────────────────────────────────────────── */
export default function JobsCareerDashboardPage() {
  const [title, setTitle]           = useState("");
  const [location, setLocation]     = useState("");
  const [type, setType]             = useState("CDI");
  const [description, setDescription] = useState("");
  const [applyUrl, setApplyUrl]     = useState("");
  const [active, setActive]         = useState(true);
  const [loading, setLoading]       = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    if (!title || !location || !type || !description) {
      setErrorMsg("Merci de remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }
    try {
      await addDoc(collection(db, "careers"), {
        title, location, type, description,
        applyUrl: applyUrl || null,
        active,
        createdAt: serverTimestamp(),
      });
      setSuccessMsg("Offre publiée ! Elle est maintenant visible sur /careers.");
      setTitle(""); setLocation(""); setType("CDI");
      setDescription(""); setApplyUrl(""); setActive(true);
      setShowPreview(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch {
      setErrorMsg("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const canPreview = title.length > 0 && description.length > 0;
  const selectedType = CONTRACT_TYPES.find(c => c.value === type) ?? CONTRACT_TYPES[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        body { background: #f9f8f5 !important; margin: 0; }
        * { box-sizing: border-box; font-family: 'DM Sans', system-ui; }
        h1,h2,h3 { font-family: 'Sora', system-ui; }
        input:focus, textarea:focus { border-color: #8a6bfe !important; box-shadow: 0 0 0 3px rgba(138,107,254,0.11) !important; }
        .contract-btn { transition: all 0.13s; }
        .contract-btn:hover { transform: translateY(-1px); }
        .submit-btn { transition: background 0.15s, box-shadow 0.15s, transform 0.15s; }
        .submit-btn:hover:not(:disabled) { background: #7558f0 !important; box-shadow: 0 8px 24px rgba(138,107,254,0.3) !important; transform: translateY(-1px); }
        .preview-toggle { transition: color 0.12s, background 0.12s; }
        .preview-toggle:hover { color: #8a6bfe !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e0db; border-radius: 4px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f9f8f5" }}>

        {/* ── Header ── */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e8e6e1" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#f0eeff", border: "1px solid #d4c9fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase style={{ width: 18, height: 18, color: "#8a6bfe" }} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Sora',system-ui", fontWeight: 800, fontSize: 20, color: "#1a1a2e", letterSpacing: "-0.02em", marginBottom: 2 }}>
                  Nouvelle offre d'emploi
                </h1>
                <p style={{ fontSize: 13, color: "#9ca3af" }}>
                  Publiée automatiquement sur <span style={{ color: "#8a6bfe", fontWeight: 600 }}>/careers</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 80px" }}>

          {/* ── Feedback ── */}
          <AnimatePresence>
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: 20 }}>
                <CheckCircle style={{ width: 15, height: 15, color: "#22c55e", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", marginBottom: 2 }}>Offre publiée !</p>
                  <p style={{ fontSize: 12, color: "#166534" }}>{successMsg}</p>
                </div>
              </motion.div>
            )}
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px", borderRadius: 12, background: "#fff5f5", border: "1px solid #fecaca", marginBottom: 20 }}>
                <AlertCircle style={{ width: 15, height: 15, color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 2 }}>Erreur</p>
                  <p style={{ fontSize: 12, color: "#b91c1c" }}>{errorMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main layout: form + preview side-by-side ── */}
          <div style={{ display: "grid", gridTemplateColumns: showPreview && canPreview ? "1fr 1fr" : "1fr", gap: 16, alignItems: "start" }}>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit}>
              <div style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 20, overflow: "hidden" }}>

                {/* Form header */}
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0ede8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#b0aea8" }}>
                    Informations du poste
                  </p>
                  {canPreview && (
                    <button type="button" className="preview-toggle"
                      onClick={() => setShowPreview(p => !p)}
                      style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: showPreview ? "#8a6bfe" : "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      {showPreview ? <EyeOff style={{ width: 13, height: 13 }} /> : <Eye style={{ width: 13, height: 13 }} />}
                      {showPreview ? "Masquer l'aperçu" : "Aperçu"}
                    </button>
                  )}
                </div>

                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* Title + Location row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={FIELD_LABEL}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Briefcase style={{ width: 10, height: 10 }} /> Titre du poste *
                        </span>
                      </label>
                      <input style={INPUT_BASE} placeholder="Développeur·se Full-Stack"
                        value={title} onChange={e => setTitle(e.target.value)} required
                        onFocus={e => { e.target.style.borderColor = "#8a6bfe"; e.target.style.boxShadow = "0 0 0 3px rgba(138,107,254,0.11)"; }}
                        onBlur={e => { e.target.style.borderColor = "#e2e0db"; e.target.style.boxShadow = "none"; }} />
                    </div>
                    <div>
                      <label style={FIELD_LABEL}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <MapPin style={{ width: 10, height: 10 }} /> Lieu *
                        </span>
                      </label>
                      <input style={INPUT_BASE} placeholder="Bruxelles, Remote…"
                        value={location} onChange={e => setLocation(e.target.value)} required
                        onFocus={e => { e.target.style.borderColor = "#8a6bfe"; e.target.style.boxShadow = "0 0 0 3px rgba(138,107,254,0.11)"; }}
                        onBlur={e => { e.target.style.borderColor = "#e2e0db"; e.target.style.boxShadow = "none"; }} />
                    </div>
                  </div>

                  {/* Contract type */}
                  <div>
                    <label style={FIELD_LABEL}>Type de contrat *</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {CONTRACT_TYPES.map(c => (
                        <button key={c.value} type="button" className="contract-btn"
                          onClick={() => setType(c.value)}
                          style={{
                            padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                            background: type === c.value ? c.bg : "#f9f8f5",
                            color: type === c.value ? c.color : "#9ca3af",
                            border: `1px solid ${type === c.value ? c.border : "#e2e0db"}`,
                            boxShadow: type === c.value ? `0 2px 8px ${c.bg}` : "none",
                          }}>
                          {c.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                      <label style={{ ...FIELD_LABEL, marginBottom: 0 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <FileText style={{ width: 10, height: 10 }} /> Description *
                        </span>
                      </label>
                      <span style={{ fontSize: 10, color: "#c0bdb8", fontFamily: "'DM Mono', monospace" }}>{description.length} car.</span>
                    </div>
                    <textarea
                      style={{ ...INPUT_BASE, minHeight: 200, resize: "vertical", lineHeight: 1.65 }}
                      placeholder={`Décris le poste...\n\nMissions :\n- Développer les fonctionnalités front-end\n- Participer aux code reviews\n\nProfil recherché :\n- 2+ ans d'expérience React\n- Bonne communication`}
                      value={description} onChange={e => setDescription(e.target.value)} required
                      onFocus={e => { e.target.style.borderColor = "#8a6bfe"; e.target.style.boxShadow = "0 0 0 3px rgba(138,107,254,0.11)"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e0db"; e.target.style.boxShadow = "none"; }}
                    />
                    <p style={{ fontSize: 11, color: "#c0bdb8", marginTop: 6 }}>
                      Astuce : les lignes en majuscules, se terminant par «&nbsp;:&nbsp;» ou les listes avec «&nbsp;-&nbsp;» seront automatiquement mises en forme.
                    </p>
                  </div>

                  {/* Apply URL */}
                  <div>
                    <label style={FIELD_LABEL}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <LinkIcon style={{ width: 10, height: 10 }} /> Lien de candidature
                        <span style={{ fontWeight: 400, color: "#c0bdb8", textTransform: "none", letterSpacing: 0 }}>— optionnel</span>
                      </span>
                    </label>
                    <input style={INPUT_BASE} type="url" placeholder="https://forms.gle/… ou mailto:jobs@woppy.be"
                      value={applyUrl} onChange={e => setApplyUrl(e.target.value)}
                      onFocus={e => { e.target.style.borderColor = "#8a6bfe"; e.target.style.boxShadow = "0 0 0 3px rgba(138,107,254,0.11)"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e0db"; e.target.style.boxShadow = "none"; }} />
                  </div>

                  {/* Visibility toggle */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, background: "#faf9f7", border: "1px solid #e8e6e1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: active ? "#f0eeff" : "#f5f4f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {active
                          ? <Eye style={{ width: 13, height: 13, color: "#8a6bfe" }} />
                          : <EyeOff style={{ width: 13, height: 13, color: "#c0bdb8" }} />}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>
                          {active ? "Offre visible" : "Offre masquée"}
                        </p>
                        <p style={{ fontSize: 11, color: "#9ca3af" }}>
                          {active ? "Publiée sur /careers dès soumission" : "Non visible au public"}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setActive(a => !a)}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                        background: active ? "#8a6bfe" : "#e2e0db",
                        position: "relative", transition: "background 0.2s", flexShrink: 0,
                      }}>
                      <span style={{
                        position: "absolute", top: 3, left: active ? 23 : 3,
                        width: 18, height: 18, borderRadius: "50%",
                        background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                        transition: "left 0.2s",
                      }} />
                    </button>
                  </div>

                </div>

                {/* Form footer */}
                <div style={{ padding: "16px 24px", borderTop: "1px solid #f0ede8", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <p style={{ fontSize: 11, color: "#c0bdb8" }}>* champs obligatoires</p>
                  <button type="submit" disabled={loading} className="submit-btn"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "11px 22px", borderRadius: 11, border: "none",
                      background: loading ? "#c4b8ff" : "#8a6bfe", color: "#fff",
                      fontFamily: "'Sora',system-ui", fontWeight: 700, fontSize: 14,
                      cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(138,107,254,0.25)",
                    }}>
                    {loading
                      ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Publication…</>
                      : <><Save style={{ width: 14, height: 14 }} /> Publier l'offre</>
                    }
                  </button>
                </div>
              </div>
            </form>

            {/* ── Preview panel ── */}
            <AnimatePresence>
              {showPreview && canPreview && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 20, overflow: "hidden", position: "sticky", top: 20 }}>

                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede8", display: "flex", alignItems: "center", gap: 7 }}>
                    <Eye style={{ width: 12, height: 12, color: "#8a6bfe" }} />
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a6bfe" }}>
                      Aperçu
                    </p>
                  </div>

                  <div style={{ padding: "20px" }}>
                    {/* Meta */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: selectedType.bg, color: selectedType.color }}>
                        {type}
                      </span>
                      {location && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9ca3af" }}>
                          <MapPin style={{ width: 10, height: 10 }} />{location}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 style={{ fontFamily: "'Sora',system-ui", fontWeight: 800, fontSize: 20, color: "#1a1a2e", letterSpacing: "-0.02em", marginBottom: 16, lineHeight: 1.25 }}>
                      {title}
                    </h2>

                    {/* Description formatted */}
                    <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                      <PreviewDescription text={description} />
                    </div>

                    {/* Apply URL */}
                    {applyUrl && (
                      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f0ede8" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#8a6bfe" }}>
                          <LinkIcon style={{ width: 11, height: 11 }} /> {applyUrl}
                        </span>
                      </div>
                    )}

                    {/* CTA mock */}
                    <div style={{ marginTop: 18 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, background: "#8a6bfe", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'Sora',system-ui" }}>
                        Postuler <ArrowRight style={{ width: 13, height: 13 }} />
                      </div>
                    </div>
                  </div>

                  {/* Visibility badge */}
                  <div style={{ padding: "12px 20px", background: "#faf9f7", borderTop: "1px solid #f0ede8", display: "flex", alignItems: "center", gap: 6 }}>
                    <Zap style={{ width: 11, height: 11, color: active ? "#22c55e" : "#c0bdb8" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: active ? "#15803d" : "#9ca3af" }}>
                      {active ? "Sera publiée immédiatement" : "Restera masquée"}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}