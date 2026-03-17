"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MapPin, Briefcase, ArrowRight, Zap } from "lucide-react";

interface Career {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  applyUrl?: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "Temps plein":   { bg: "#eef2ff", text: "#4338ca" },
  "Temps partiel": { bg: "#f0fdf4", text: "#15803d" },
  "Stage":         { bg: "#fff7ed", text: "#c2410c" },
  "Freelance":     { bg: "#fdf4ff", text: "#9333ea" },
  "CDI":           { bg: "#eef2ff", text: "#4338ca" },
  "CDD":           { bg: "#f0fdf4", text: "#15803d" },
};
function typeStyle(type: string) {
  return TYPE_COLORS[type] ?? { bg: "#f5f4f1", text: "#6b7280" };
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          height: 76,
          borderRadius: 14,
          background: "linear-gradient(90deg,#f5f4f1 25%,#eceae6 50%,#f5f4f1 75%)",
          backgroundSize: "200% 100%",
          animation: `shimmer 1.4s ease-in-out ${i * 0.1}s infinite`,
          marginBottom: 6,
        }} />
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

/* ── Empty state ── */
function Empty() {
  return (
    <div style={{
      textAlign: "center",
      padding: "72px 24px",
      background: "#fafaf9",
      borderRadius: 20,
      border: "1px dashed #e2e0db",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: "#f0eeff", margin: "0 auto 16px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Briefcase style={{ width: 22, height: 22, color: "#8a6bfe" }} />
      </div>
      <p style={{ fontFamily: "'Sora',system-ui", fontWeight: 700, fontSize: 18, color: "#1e1e26", marginBottom: 8 }}>
        Aucun poste disponible
      </p>
      <p style={{ fontSize: 14, color: "#9ca3af", maxWidth: 340, margin: "0 auto", lineHeight: 1.6 }}>
        Pas d'offres ouvertes pour l'instant. De nouvelles opportunités arrivent régulièrement — revenez bientôt !
      </p>
    </div>
  );
}

/* ── Main ── */
export default function CareersList() {
  const [jobs, setJobs]     = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "careers"),
      where("active", "==", true),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Career, "id">) })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <Skeleton />;
  if (jobs.length === 0) return <Empty />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .job-row { transition: background 0.15s, box-shadow 0.15s; }
        .job-row:hover { background: #faf9ff !important; box-shadow: 0 2px 20px rgba(138,107,254,0.08) !important; }
        .job-cta { transition: opacity 0.15s, transform 0.15s; }
        .job-arrow { transition: transform 0.2s; }
        .job-row:hover .job-arrow { transform: translateX(3px); }
      `}</style>

      {/* Header row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "32px 1fr 140px 130px 140px",
        gap: 16,
        padding: "0 20px 10px",
        borderBottom: "1px solid #e8e6e1",
        marginBottom: 6,
      }}>
        {["#", "Poste", "Lieu", "Type", ""].map((h, i) => (
          <span key={i} style={{
            fontSize: 10,
            fontFamily: "'DM Sans',system-ui",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "#b0aea8",
            textAlign: i === 4 ? "right" : "left",
          }}>{h}</span>
        ))}
      </div>

      {/* Job rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {jobs.map((job, index) => {
          const ts = typeStyle(job.type);
          const isNew = index === 0;
          return (
            <div
              key={job.id}
              className="job-row"
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr 140px 130px 140px",
                gap: 16,
                alignItems: "center",
                padding: "16px 20px",
                borderRadius: 14,
                background: "#ffffff",
                border: "1px solid #eeece8",
                cursor: "default",
                animation: `rowIn 0.4s ease-out ${index * 0.07}s both`,
              }}
              onMouseEnter={() => setHovered(job.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Index */}
              <span style={{
                fontFamily: "'DM Sans',monospace",
                fontSize: 11,
                fontWeight: 600,
                color: "#d1cfc9",
              }}>
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Title + description */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontFamily: "'Sora',system-ui",
                    fontWeight: 700,
                    fontSize: 15,
                    color: hovered === job.id ? "#8a6bfe" : "#1e1e26",
                    transition: "color 0.15s",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {job.title}
                  </span>
                  {isNew && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 3,
                      fontSize: 9, fontWeight: 700, fontFamily: "'DM Sans',system-ui",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      padding: "2px 7px", borderRadius: 20,
                      background: "#f0eeff", color: "#8a6bfe",
                      border: "1px solid #d4c9fd",
                      flexShrink: 0,
                    }}>
                      <Zap style={{ width: 8, height: 8 }} /> Nouveau
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: 12,
                  fontFamily: "'DM Sans',system-ui",
                  color: "#9ca3af",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 420,
                }}>
                  {job.description}
                </p>
              </div>

              {/* Location */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin style={{ width: 12, height: 12, color: "#c0bdb8", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontFamily: "'DM Sans',system-ui", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {job.location}
                </span>
              </div>

              {/* Type badge */}
              <div>
                <span style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontFamily: "'DM Sans',system-ui",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: ts.bg,
                  color: ts.text,
                  whiteSpace: "nowrap",
                }}>
                  {job.type}
                </span>
              </div>

              {/* CTA */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link
                  href={`/careers/${job.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontFamily: "'DM Sans',system-ui",
                    fontWeight: 600,
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: hovered === job.id ? "#8a6bfe" : "#f0eeff",
                    color: hovered === job.id ? "#ffffff" : "#8a6bfe",
                    border: `1px solid ${hovered === job.id ? "#8a6bfe" : "#d4c9fd"}`,
                    textDecoration: "none",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}>
                  Voir l'offre
                  <ArrowRight style={{ width: 13, height: 13 }} className="job-arrow" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer count */}
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontFamily: "'DM Sans',system-ui", color: "#c0bdb8" }}>
          {jobs.length} offre{jobs.length > 1 ? "s" : ""} ouverte{jobs.length > 1 ? "s" : ""}
        </span>
        <span style={{ fontSize: 12, fontFamily: "'DM Sans',system-ui", color: "#c0bdb8" }}>
          Mis à jour en temps réel
        </span>
      </div>

      <style>{`
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}