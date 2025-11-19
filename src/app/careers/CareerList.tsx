"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MapPin, Briefcase, ExternalLink, Sparkles } from "lucide-react";

interface Career {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  applyUrl?: string;
}

export default function CareersList() {
  const [jobs, setJobs] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "careers"),
      where("active", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setJobs(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Career, "id">),
        }))
      );
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 h-64 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
          <Briefcase className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun poste disponible
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Nous n'avons pas d'offres ouvertes pour le moment, mais revenez bientôt ! 
          De nouvelles opportunités sont ajoutées régulièrement.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {jobs.map((job, index) => (
        <div
          key={job.id}
          className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1"
          style={{
            animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
          }}
        >
          {index === 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              Nouveau
            </div>
          )}

          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
              {job.title}
            </h2>

            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
              {job.type}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{job.location}</span>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed text-sm mb-6 line-clamp-3">
            {job.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">

            <Link
              href={`/careers/${job.id}`}
              className="text-sm text-gray-700 gap-2 px-6 py-3 hover:text-[#7b5bff] border-gray-100 font-medium rounded transition-colors hover:border hover:border-[#7b5bff] hover:bg-[#7b5bff] hover:text-white flex items-center gap-1"
            >
              En savoir plus →
            </Link>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
