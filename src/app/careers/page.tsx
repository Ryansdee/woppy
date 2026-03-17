"use client";
import CareersList from "./CareerList";
import { Rocket, Users, Heart, Zap, ArrowDown, Mail } from "lucide-react";

export default function CareersPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .careers-page * { font-family: 'DM Sans', system-ui, sans-serif; box-sizing: border-box; }
        .careers-page h1, .careers-page h2, .careers-page h3 { font-family: 'Sora', system-ui; }
        body { background: #f9f8f5 !important; }

        .val-card { transition: transform 0.2s, box-shadow 0.2s; }
        .val-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(138,107,254,0.10); }

        .badge-pulse::before {
          content: '';
          display: inline-block;
          width: 7px; height: 7px;
          background: #8a6bfe;
          border-radius: 50%;
          margin-right: 8px;
          animation: bpulse 2s ease-in-out infinite;
        }
        @keyframes bpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(0.7)} }

        .hero-cta-primary { transition: background 0.15s, box-shadow 0.15s, transform 0.15s; }
        .hero-cta-primary:hover { background: #7558f0 !important; box-shadow: 0 8px 24px rgba(138,107,254,0.35) !important; transform: translateY(-1px); }
        .hero-cta-secondary { transition: border-color 0.15s, color 0.15s; }
        .hero-cta-secondary:hover { border-color: #8a6bfe !important; color: #8a6bfe !important; }

        .spontaneous-btn { transition: background 0.15s, transform 0.15s, box-shadow 0.15s; }
        .spontaneous-btn:hover { background: #f0eeff !important; color: #8a6bfe !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
      `}</style>

      <main className="careers-page" style={{ minHeight: "100vh", background: "#f9f8f5" }}>

        {/* ── Hero ── */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px 64px" }}>

          {/* Badge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <span className="badge-pulse" style={{
              display: "inline-flex", alignItems: "center",
              padding: "7px 16px", borderRadius: 999,
              background: "#f0eeff", border: "1px solid #d4c9fd",
              fontSize: 13, fontWeight: 600, color: "#8a6bfe",
            }}>
              On recrute
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            textAlign: "center",
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            fontWeight: 800,
            color: "#1a1a2e",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}>
            Rejoins l'équipe{" "}
            <span style={{
              background: "linear-gradient(135deg, #8a6bfe 0%, #b48aff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Woppy
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            textAlign: "center",
            fontSize: 17,
            color: "#6b7280",
            maxWidth: 520,
            margin: "0 auto 36px",
            lineHeight: 1.7,
          }}>
            Nous construisons la plateforme qui rend le travail flexible
            simple et accessible. Découvre nos postes ouverts.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="#postes" className="hero-cta-primary" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 12,
              background: "#8a6bfe", color: "#fff",
              fontWeight: 700, fontSize: 14, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(138,107,254,0.28)",
            }}>
              Voir les postes <ArrowDown style={{ width: 15, height: 15 }} />
            </a>
            <a href="#culture" className="hero-cta-secondary" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 12,
              background: "#fff", color: "#4b4b58",
              fontWeight: 600, fontSize: 14, textDecoration: "none",
              border: "1px solid #e2e0db",
            }}>
              Notre culture
            </a>
          </div>
        </section>

        {/* ── Valeurs ── */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 72px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {[
              {
                icon: <Users style={{ width: 18, height: 18, color: "#8a6bfe" }} />,
                iconBg: "#f0eeff",
                title: "Équipe passionnée",
                desc: "Travaille avec des personnes talentueuses qui partagent ta vision.",
              },
              {
                icon: <Zap style={{ width: 18, height: 18, color: "#f59e0b" }} />,
                iconBg: "#fffbeb",
                title: "Impact réel",
                desc: "Tes contributions façonnent directement l'avenir du travail flexible.",
              },
              {
                icon: <Heart style={{ width: 18, height: 18, color: "#ec4899" }} />,
                iconBg: "#fdf2f8",
                title: "Flexibilité totale",
                desc: "Remote-first, horaires flexibles et un vrai équilibre vie pro/perso.",
              },
            ].map((v) => (
              <div key={v.title} className="val-card" style={{
                background: "#fff",
                border: "1px solid #e8e6e1",
                borderRadius: 16,
                padding: "22px 24px",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: v.iconBg, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {v.icon}
                </div>
                <div>
                  <p style={{ fontFamily: "'Sora',system-ui", fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 5 }}>
                    {v.title}
                  </p>
                  <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Offres ── */}
        <section id="postes" style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 80px" }}>
          {/* Section header */}
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            marginBottom: 28, flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a6bfe", marginBottom: 6 }}>
                Postes ouverts
              </p>
              <h2 style={{ fontFamily: "'Sora',system-ui", fontWeight: 800, fontSize: 26, color: "#1a1a2e", letterSpacing: "-0.02em" }}>
                Trouve ton rôle
              </h2>
            </div>
            {/* Live indicator */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 999,
              background: "#f0fdf4", border: "1px solid #bbf7d0",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "bpulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>Mis à jour en direct</span>
            </div>
          </div>

          <CareersList />
        </section>

        {/* ── Candidature spontanée ── */}
        <section id="culture" style={{ background: "#1a1a2e", padding: "72px 24px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "rgba(138,107,254,0.15)", border: "1px solid rgba(138,107,254,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Mail style={{ width: 20, height: 20, color: "#a78bfa" }} />
            </div>
            <h2 style={{
              fontFamily: "'Sora',system-ui", fontWeight: 800, fontSize: 26,
              color: "#fff", marginBottom: 12, letterSpacing: "-0.02em",
            }}>
              Tu ne trouves pas ce que tu cherches ?
            </h2>
            <p style={{ fontSize: 15, color: "#9ca3af", marginBottom: 32, lineHeight: 1.7 }}>
              Envoie-nous une candidature spontanée. Nous sommes toujours à la
              recherche de talents exceptionnels qui partagent notre mission.
            </p>
            <a href="mailto:careers@woppy.com" className="spontaneous-btn" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: 12,
              background: "#fff", color: "#1a1a2e",
              fontWeight: 700, fontSize: 14, textDecoration: "none",
            }}>
              Candidature spontanée
              <Rocket style={{ width: 15, height: 15 }} />
            </a>
          </div>
        </section>

      </main>
    </>
  );
}