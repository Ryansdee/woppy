"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  Star,
  User,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

/* ---------------------------------------------------------- */
/* ---------------------- PAGE ------------------------------ */
/* ---------------------------------------------------------- */

export default function ActivityPage() {
  const [tab, setTab] = useState<"jobs" | "annonces">("jobs");
  const [user, setUser] = useState<any>(null);

  // 🎯 DATA
  const [jobsPostules, setJobsPostules] = useState<any[]>([]);
  const [jobsSelectionnes, setJobsSelectionnes] = useState<any[]>([]);
  const [jobsTermines, setJobsTermines] = useState<any[]>([]);

  const [annoncesPubliees, setAnnoncesPubliees] = useState<any[]>([]);
  const [annoncesEnCours, setAnnoncesEnCours] = useState<any[]>([]);
  const [annoncesTerminees, setAnnoncesTerminees] = useState<any[]>([]);

  /* ------------------- AUTH ------------------- */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) window.location.href = "/auth/login";
      else setUser(u);
    });
    return () => unsubscribe();
  }, []);

  /* ------------------- FIRESTORE FETCH ------------------- */
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      const uid = user.uid;

      /* ---------------------------------------------------- */
      /* 📌 1. Jobs où j’ai postulé                           */
      /* ---------------------------------------------------- */
      const cQ = query(
        collection(db, "candidatures"),
        where("candidatId", "==", uid)
      );
      const cSnap = await getDocs(cQ);

      const postuleIds = cSnap.docs.map((d) => d.data().annonceId);

      const postules: any[] = [];
      for (const id of postuleIds) {
        const snap = await getDoc(doc(db, "annonces", id));
        if (snap.exists()) {
          const ad = snap.data();
          if (!ad.acceptedUserId) postules.push({ id, ...ad });
        }
      }

      setJobsPostules(postules);

      /* ---------------------------------------------------- */
      /* 📌 2. Jobs où je suis sélectionné                   */
      /* ---------------------------------------------------- */
      const selectedQ = query(
        collection(db, "annonces"),
        where("acceptedUserId", "==", uid),
        where("statut", "!=", "fini")
      );
      const selectedSnap = await getDocs(selectedQ);
      setJobsSelectionnes(
        selectedSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );

      /* ---------------------------------------------------- */
      /* 📌 3. Jobs terminés                                 */
      /* ---------------------------------------------------- */
      const finQ = query(
        collection(db, "annonces"),
        where("acceptedUserId", "==", uid),
        where("statut", "==", "fini")
      );
      const finSnap = await getDocs(finQ);
      setJobsTermines(finSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      /* ---------------------------------------------------- */
      /* 📌 4. Annonces publiées                             */
      /* ---------------------------------------------------- */
      const pubQ = query(
        collection(db, "annonces"),
        where("userId", "==", uid),
        where("statut", "==", "ouvert")
      );
      const pubSnap = await getDocs(pubQ);
      setAnnoncesPubliees(pubSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      /* ---------------------------------------------------- */
      /* 📌 5. Annonces en cours                             */
      /* ---------------------------------------------------- */
        // 1. Récupérer toutes les annonces du user
        const myAdsQ = query(
        collection(db, "annonces"),
        where("userId", "==", uid)
        );

        const myAdsSnap = await getDocs(myAdsQ);

        // 2. Filtrer côté client (Firestore happy)
        const enCours = myAdsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as any))
        .filter((a) => a.acceptedUserId && a.statut !== "fini");

        setAnnoncesEnCours(enCours);

      /* ---------------------------------------------------- */
      /* 📌 6. Annonces terminées                            */
      /* ---------------------------------------------------- */
      const doneQ = query(
        collection(db, "annonces"),
        where("userId", "==", uid),
        where("statut", "==", "fini")
      );
      const doneSnap = await getDocs(doneQ);
      setAnnoncesTerminees(doneSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    loadData();
  }, [user]);

  if (!user) return null;

  /* ---------------------------------------------------------- */
  /* ---------------------- RENDER ---------------------------- */
  /* ---------------------------------------------------------- */

  return (
    <div className="min-h-screen w-full px-6 sm:px-10 py-16 bg-gradient-to-br from-[#ede6ff] via-white to-[#e0d0ff]">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-extrabold text-[#7b5bff] mb-10">
          Mon activité
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-10">
          <button
            onClick={() => setTab("jobs")}
            className={`px-6 py-3 rounded-xl font-semibold border transition ${
              tab === "jobs"
                ? "bg-[#7b5bff] text-white"
                : "bg-white text-black border-[#d8c8ff]"
            }`}
          >
            Mes jobs
          </button>

          <button
            onClick={() => setTab("annonces")}
            className={`px-6 py-3 rounded-xl font-semibold border transition ${
              tab === "annonces"
                ? "bg-[#7b5bff] text-white"
                : "bg-white text-black border-[#d8c8ff]"
            }`}
          >
            Mes annonces
          </button>
        </div>

        {tab === "jobs" ? (
          <JobsView
            postules={jobsPostules}
            selectionnes={jobsSelectionnes}
            termines={jobsTermines}
            user={user}
          />
        ) : (
          <AnnoncesView
            publiees={annoncesPubliees}
            encours={annoncesEnCours}
            terminees={annoncesTerminees}
            user={user}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* ---------------- VIEW : MES JOBS ------------------------- */
/* ---------------------------------------------------------- */

function JobsView({ postules, selectionnes, termines, user }: any) {
  return (
    <div className="space-y-12">
      <Section title="Jobs où j’ai postulé" icon={<ClipboardList />} />
      {postules.length === 0 && <Empty text="Aucune candidature" />}
      {postules.map((a: any) => (
        <JobCard key={a.id} {...a} type="pending" />
      ))}

      <Section title="Jobs où j’ai été sélectionné" icon={<Clock />} />
      {selectionnes.length === 0 && <Empty text="Aucun job sélectionné" />}
      {selectionnes.map((a: any) => (
        <JobCard key={a.id} {...a} type="selected" user={user} />
      ))}

      <Section title="Jobs terminés" icon={<CheckCircle />} />
      {termines.length === 0 && <Empty text="Aucun job terminé" />}
      {termines.map((a: any) => (
        <JobCard key={a.id} {...a} type="done" user={user} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* ---------------- VIEW : MES ANNONCES --------------------- */
/* ---------------------------------------------------------- */

function AnnoncesView({ publiees, encours, terminees, user }: any) {
  return (
    <div className="space-y-12">
      <Section title="Annonces publiées" icon={<Briefcase />} />
      {publiees.length === 0 && <Empty text="Aucune annonce publiée" />}
      {publiees.map((a: any) => (
        <AnnonceCard key={a.id} {...a} type="open" user={user} />
      ))}

      <Section title="Annonces en cours" icon={<Users />} />
      {encours.length === 0 && <Empty text="Aucune annonce en cours" />}
      {encours.map((a: any) => (
        <AnnonceCard key={a.id} {...a} type="progress" user={user} />
      ))}

      <Section title="Annonces terminées" icon={<Star />} />
      {terminees.length === 0 && <Empty text="Aucune annonce terminée" />}
      {terminees.map((a: any) => (
        <AnnonceCard key={a.id} {...a} type="done" user={user} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* ---------------- COMPONENTS ------------------------------ */
/* ---------------------------------------------------------- */

function Empty({ text }: any) {
  return <div className="text-gray-500 italic">{text}</div>;
}

function Section({ title, icon }: any) {
  return (
    <div className="flex items-center gap-2 text-xl font-bold text-[#7b5bff]">
      {icon}
      {title}
    </div>
  );
}

/* ------------------------ JOB CARD ------------------------ */

async function markJobAsDone(id: string) {
  await updateDoc(doc(db, "annonces", id), {
    taskCompletion: true,
    statut: "fini",
  });
}

function JobCard({ id, title, date, location, type, user }: any) {
  const badge =
    type === "pending"
      ? "bg-gray-200 text-gray-700"
      : type === "selected"
      ? "bg-[#7b5bff] text-white"
      : "bg-green-500 text-white";

  const label =
    type === "pending"
      ? "En attente"
      : type === "selected"
      ? "Sélectionné"
      : "Terminé";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border shadow-sm"
    >
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className={`px-3 py-1 rounded-full ${badge}`}>{label}</span>
      </div>

      <div className="text-gray-500 mt-3">{location}</div>
      <div className="text-gray-500">{date}</div>

      {type === "selected" && (
        <button
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl"
          onClick={async () => {
            await markJobAsDone(id);
            window.location.reload();
          }}
        >
          Marquer terminé
        </button>
      )}
    </motion.div>
  );
}

/* --------------------- ANNONCE CARD ----------------------- */

async function markAnnonceAsDone(id: string) {
  await updateDoc(doc(db, "annonces", id), {
    statut: "fini",
  });
}

function AnnonceCard({
  id,
  title,
  date,
  location,
  type,
  acceptedUserId,
}: any) {
  const badge =
    type === "open"
      ? "bg-[#7b5bff] text-white"
      : type === "progress"
      ? "bg-blue-500 text-white"
      : "bg-green-500 text-white";

  const label =
    type === "open" ? "Ouverte" : type === "progress" ? "En cours" : "Terminée";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border shadow-sm"
    >
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className={`px-3 py-1 rounded-full ${badge}`}>{label}</span>
      </div>

      {acceptedUserId && (
        <div className="flex items-center gap-2 mt-3 text-gray-700">
          <User className="w-4 h-4 text-[#7b5bff]" />
          Étudiant sélectionné : {acceptedUserId}
        </div>
      )}

      <div className="text-gray-500 mt-3">{location}</div>
      <div className="text-gray-500">{date}</div>

      {type === "progress" && (
        <button
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl"
          onClick={async () => {
            await markAnnonceAsDone(id);
            window.location.reload();
          }}
        >
          Marquer comme terminé
        </button>
      )}
    </motion.div>
  );
}
