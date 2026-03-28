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

const TYPE_STYLES: Record<string, string> = {
  "Temps plein":   "bg-indigo-50 text-indigo-700",
  "Temps partiel": "bg-green-50 text-green-700",
  "Stage":         "bg-orange-50 text-orange-700",
  "Freelance":     "bg-fuchsia-50 text-fuchsia-600",
  "CDI":           "bg-indigo-50 text-indigo-700",
  "CDD":           "bg-green-50 text-green-700",
};
function typeClass(type: string) {
  return TYPE_STYLES[type] ?? "bg-stone-100 text-gray-500";
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 rounded-2xl animate-pulse bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100" />
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="text-center px-6 py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
      <div className="w-12 h-12 rounded-2xl bg-violet-50 mx-auto mb-4 flex items-center justify-center">
        <Briefcase className="w-5 h-5 text-violet-400" />
      </div>
      <p className="font-['Sora',system-ui] font-bold text-lg text-[#1e1e26] mb-2">
        Aucun poste disponible
      </p>
      <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
        Pas d'offres ouvertes pour l'instant. De nouvelles opportunités arrivent régulièrement — revenez bientôt !
      </p>
    </div>
  );
}

export default function CareersList() {
  const [jobs, setJobs]     = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

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
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex flex-col gap-3">
        {jobs.map((job, index) => (
          <div
            key={job.id}
            className="group bg-white border border-[#eeece8] rounded-2xl p-5 flex flex-col gap-3 hover:bg-[#faf9ff] hover:border-stone-200 hover:shadow-[0_2px_20px_rgba(138,107,254,0.08)] transition-all duration-150"
            style={{ animation: `rowIn 0.4s ease-out ${index * 0.07}s both` }}
          >
            {/* Top : type badge + "Nouveau" */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-['DM_Sans',system-ui] font-semibold px-2.5 py-1 rounded-full ${typeClass(job.type)}`}>
                {job.type}
              </span>
              {index === 0 && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold font-['DM_Sans',system-ui] uppercase tracking-[0.06em] px-2 py-1 rounded-full bg-violet-50 text-violet-400 border border-violet-200">
                  <Zap className="w-2 h-2" /> Nouveau
                </span>
              )}
            </div>

            {/* Title + description */}
            <div>
              <p className="font-['Sora',system-ui] font-bold text-[15px] text-[#1e1e26] group-hover:text-violet-500 transition-colors duration-150 mb-1">
                {job.title}
              </p>
              <p className="text-[12px] font-['DM_Sans',system-ui] text-gray-400 leading-relaxed line-clamp-2">
                {job.description}
              </p>
            </div>

            {/* Bottom : location + CTA */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-stone-300 shrink-0" />
                <span className="text-[12px] font-['DM_Sans',system-ui] text-gray-500">
                  {job.location}
                </span>
              </div>
              <Link
                href={`/careers/${job.id}`}
                className="inline-flex items-center gap-1.5 text-[12px] font-['DM_Sans',system-ui] font-semibold px-3.5 py-2 rounded-xl border transition-all duration-150 no-underline bg-violet-50 text-violet-400 border-violet-200 group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-500"
              >
                Voir l'offre
                <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-['DM_Sans',system-ui] text-stone-300">
          {jobs.length} offre{jobs.length > 1 ? "s" : ""} ouverte{jobs.length > 1 ? "s" : ""}
        </span>
        <span className="text-xs font-['DM_Sans',system-ui] text-stone-300">
          Mis à jour en temps réel
        </span>
      </div>
    </>
  );
}