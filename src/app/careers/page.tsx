"use client";
import CareersList from "./CareerList";
import { Rocket, Users, Heart, Zap, ArrowDown, Mail } from "lucide-react";

export default function CareersPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .badge-pulse::before {
          content: '';
          display: inline-block;
          width: 7px; height: 7px;
          background: #8a6bfe;
          border-radius: 50%;
          margin-right: 8px;
          animation: bpulse 2s ease-in-out infinite;
        }
        @keyframes bpulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(0.7); }
        }
        @keyframes livepulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(0.7); }
        }
      `}</style>

      <main className="min-h-screen bg-[#f9f8f5] font-['DM_Sans',system-ui,sans-serif]">

        {/* ── Hero ── */}
        <section className="max-w-[960px] mx-auto px-5 pt-14 pb-14 sm:pt-20 sm:pb-16">

          {/* Badge */}
          <div className="flex justify-center mb-7">
            <span className="badge-pulse inline-flex items-center px-4 py-[7px] rounded-full bg-violet-50 border border-violet-200 text-[13px] font-semibold text-violet-500">
              On recrute
            </span>
          </div>

          {/* Title */}
          <h1 className="font-['Sora',system-ui] text-center font-extrabold text-[2rem] sm:text-[3rem] lg:text-[4rem] leading-[1.15] tracking-[-0.03em] text-[#1a1a2e] mb-5">
            Rejoins l'équipe{" "}
            <span className="bg-gradient-to-br from-violet-500 to-violet-300 bg-clip-text text-transparent">
              Woppy
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-center text-[15px] sm:text-[17px] text-gray-500 max-w-[520px] mx-auto mb-9 leading-[1.7]">
            Nous construisons la plateforme qui rend le travail flexible
            simple et accessible. Découvre nos postes ouverts.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 flex-wrap">
            <a
              href="#postes"
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 text-white font-bold text-sm shadow-[0_4px_16px_rgba(138,107,254,0.28)] hover:bg-violet-600 hover:shadow-[0_8px_24px_rgba(138,107,254,0.35)] hover:-translate-y-px transition-all duration-150 no-underline"
            >
              Voir les postes <ArrowDown className="w-[15px] h-[15px]" />
            </a>
            <a
              href="#culture"
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#4b4b58] font-semibold text-sm border border-stone-200 hover:border-violet-400 hover:text-violet-500 transition-all duration-150 no-underline"
            >
              Notre culture
            </a>
          </div>
        </section>

        {/* ── Valeurs ── */}
        <section className="max-w-[960px] mx-auto px-5 pb-16 sm:pb-[72px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Users className="w-[18px] h-[18px] text-violet-500" />,
                iconBg: "bg-violet-50",
                title: "Équipe passionnée",
                desc: "Travaille avec des personnes talentueuses qui partagent ta vision.",
              },
              {
                icon: <Zap className="w-[18px] h-[18px] text-amber-400" />,
                iconBg: "bg-amber-50",
                title: "Impact réel",
                desc: "Tes contributions façonnent directement l'avenir du travail flexible.",
              },
              {
                icon: <Heart className="w-[18px] h-[18px] text-pink-400" />,
                iconBg: "bg-pink-50",
                title: "Flexibilité totale",
                desc: "Remote-first, horaires flexibles et un vrai équilibre vie pro/perso.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 flex gap-4 items-start hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(138,107,254,0.10)] transition-all duration-200"
              >
                <div className={`w-[38px] h-[38px] rounded-xl ${v.iconBg} flex items-center justify-center shrink-0`}>
                  {v.icon}
                </div>
                <div>
                  <p className="font-['Sora',system-ui] font-bold text-[14px] text-[#1a1a2e] mb-[5px]">
                    {v.title}
                  </p>
                  <p className="text-[13px] text-gray-400 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Offres ── */}
{/* ── Offres ── */}
<section id="postes" className="max-w-[960px] mx-auto px-5 pb-16 sm:pb-20">

  {/* Section header */}
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-violet-500 mb-1.5">
        Postes ouverts
      </p>
      <h2 className="font-['Sora',system-ui] font-extrabold text-[22px] sm:text-[26px] text-[#1a1a2e] tracking-[-0.02em]">
        Trouve ton rôle
      </h2>
    </div>

    {/* Live indicator */}
    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-200 self-start sm:self-auto">
      <span className="w-[7px] h-[7px] rounded-full bg-green-500 animate-[livepulse_2s_ease-in-out_infinite]" />
      <span className="text-[12px] font-semibold text-green-700">Mis à jour en direct</span>
    </div>
  </div>

  {/* ✅ Plus de wrapper overflow — la liste prend 100% naturellement */}
  <CareersList />

</section>    

        {/* ── Candidature spontanée ── */}
        <section id="culture" className="bg-[#1a1a2e] px-5 py-16 sm:py-[72px]">
          <div className="max-w-[640px] mx-auto text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-5 h-5 text-violet-300" />
            </div>
            <h2 className="font-['Sora',system-ui] font-extrabold text-[22px] sm:text-[26px] text-white mb-3 tracking-[-0.02em]">
              Tu ne trouves pas ce que tu cherches ?
            </h2>
            <p className="text-[14px] sm:text-[15px] text-gray-400 mb-8 leading-[1.7]">
              Envoie-nous une candidature spontanée. Nous sommes toujours à la
              recherche de talents exceptionnels qui partagent notre mission.
            </p>
            <a
              href="mailto:careers@woppy.com"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#1a1a2e] font-bold text-sm hover:bg-violet-50 hover:text-violet-500 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-all duration-150 no-underline"
            >
              Candidature spontanée
              <Rocket className="w-[15px] h-[15px]" />
            </a>
          </div>
        </section>

      </main>
    </>
  );
}