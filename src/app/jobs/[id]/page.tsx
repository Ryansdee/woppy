"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  ChevronLeft,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Euro,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";

/* -------------------------------------------------------
   INTERFACES
-------------------------------------------------------- */

interface Annonce {
  id: string;
  titre: string;
  description: string;
  date: string;
  duree: number;
  lieu: string;
  remuneration: number;
  statut: "ouverte" | "en cours" | "fini";
  userId: string;
  createdAt?: any;
  photos: string[];
  acceptedUserId?: string;
  acceptedUserName?: string;
  taskCompletion?: { author?: boolean; student?: boolean };
}

interface Candidature {
  id: string;
  userId: string;
  statut: string;
  date: any;
  userName?: string;
  photoURL?: string;
}

interface AuteurUser {
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

/* -------------------------------------------------------
   PAGE
-------------------------------------------------------- */

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [auteur, setAuteur] = useState<AuteurUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);

  /* -------------------------------------------------------
     AUTH
  -------------------------------------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/auth/login");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  /* -------------------------------------------------------
     CHARGER ANNONCE
  -------------------------------------------------------- */
  useEffect(() => {
    async function fetchAnnonce() {
      if (!id) return;

      try {
        const ref = doc(db, "annonces", String(id));
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setAnnonce(null);
          return;
        }

        const data = snap.data() as any;

        // normalisation
        const photos = Array.isArray(data.photos) ? data.photos : [];

        setAnnonce({
          id: snap.id,
          ...data,
          photos,
        });
      } catch (err) {
        console.error("Erreur annonce :", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnonce();
  }, [id]);

  /* -------------------------------------------------------
     CHARGER AUTEUR
  -------------------------------------------------------- */
  useEffect(() => {
    async function fetchAuteur() {
      if (!annonce?.userId) return;

      try {
        const ref = doc(db, "users", annonce.userId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const u = snap.data();
          setAuteur({
            firstName: u.firstName,
            lastName: u.lastName,
            photoURL:
              u.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                `${u.firstName} ${u.lastName}`
              )}&background=8a6bfe&color=fff`,
          });
        }
      } catch (err) {
        console.error("Erreur auteur :", err);
      }
    }

    fetchAuteur();
  }, [annonce]);

  /* -------------------------------------------------------
     GÉOCODAGE ADRESSE
  -------------------------------------------------------- */
  useEffect(() => {
    async function geocodeAdresse() {
      if (!annonce?.lieu) return;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            annonce.lieu
          )}`
        );

        const data = await res.json();

        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          setPosition([lat, lon]);
        }
      } catch (err) {
        console.error("Erreur géocodage :", err);
      }
    }

    geocodeAdresse();
  }, [annonce]);

  /* -------------------------------------------------------
      CHARGER CANDIDATURES (si auteur)
  -------------------------------------------------------- */
  useEffect(() => {
  async function fetchCandidatures() {
    if (!annonce || !user || annonce.userId !== user.uid) return;

    try {
      const qSnap = await getDocs(
        query(collection(db, "candidatures"), where("annonceId", "==", annonce.id))
      );

      const list = await Promise.all(
        qSnap.docs.map(async (d) => {
          const c = d.data() as any;

          const userRef = doc(db, "users", c.userId);
          const userSnap = await getDoc(userRef);

          let name = "Utilisateur";
          let photo = "";

          if (userSnap.exists()) {
            const u = userSnap.data();
            name = `${u.firstName} ${u.lastName}`.trim();
            photo =
              u.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8a6bfe&color=fff`;
          }

          return {
            id: d.id,
            ...c,
            userName: name,
            photoURL: photo,
          };
        })
      );

      setCandidatures(list);
    } catch (e) {
      console.error("Erreur candidatures:", e);
    }
  }

  fetchCandidatures();
}, [annonce, user]);


  /* -------------------------------------------------------
     LOADER
  -------------------------------------------------------- */

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <Loader2 className="animate-spin text-[#8a6bfe]" size={40} />
      </div>
    );

  if (!annonce)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="text-red-500 w-10 h-10 mb-4" />
        <p className="text-gray-600">Annonce introuvable.</p>
      </div>
    );

  const photos = annonce.photos || [];
  const auteurNom =
    auteur?.firstName || auteur?.lastName
      ? `${auteur?.firstName || ""} ${auteur?.lastName || ""}`
      : "Utilisateur";

  /* -------------------------------------------------------
     UI – HEADER WOPPY VIOLET
  -------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5e5ff] via-white to-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="relative px-6 py-10 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white mb-10 shadow-lg rounded-b-3xl">
        <div className="max-w-4xl mx-auto relative z-10">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
          >
            <ChevronLeft size={20} /> Retour aux annonces
          </Link>

          <h1 className="text-4xl font-extrabold mb-4 drop-shadow-sm flex items-center gap-3">
            {annonce.titre}
            <Sparkles className="text-yellow-300 animate-pulse" size={26} />
          </h1>

          {/* Statut */}
          <div className="mt-2">
            {annonce.statut === "ouverte" && (
              <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-green-400/30 text-white border border-green-300/40 backdrop-blur">
                🟢 Ouverte
              </span>
            )}

            {annonce.statut === "en cours" && (
              <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-yellow-400/30 text-white border border-yellow-300/40 backdrop-blur">
                🟡 En cours
              </span>
            )}

            {annonce.statut === "fini" && (
              <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-red-400/30 text-white border border-red-300/40 backdrop-blur">
                🔴 Terminée
              </span>
            )}
          </div>
        </div>

        {/* Halo */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </header>

      {/* CONTENU */}
      <div className="max-w-4xl mx-auto px-6">

        {/* Galerie photos */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {photos.map((p, i) => (
              <div
                key={i}
                className="relative w-full h-40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition group"
              >
                <Image
                  src={p}
                  alt="photo"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
            ))}
          </div>
        )}
        {/* INFORMATIONS DE L’ANNONCE */}
        <div className="grid sm:grid-cols-2 gap-4 text-black mb-10">
          <InfoCard icon={<MapPin />} label={annonce.lieu} />
          <InfoCard icon={<Calendar />} label={annonce.date} />
          <InfoCard icon={<Clock />} label={`${annonce.duree}h`} />
          <InfoCard icon={<Euro />} label={`${annonce.remuneration} €/h`} />
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white rounded-2xl shadow p-6 mb-10 border border-gray-200">
          <h3 className="text-xl font-bold mb-3 text-[#8a6bfe]">
            Description du job
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {annonce.description}
          </p>
        </div>

        {/* INFORMATIONS AUTEUR */}
        {auteur && (
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow mb-10">
            <Image
              src={auteur.photoURL || ""}
              alt={auteurNom}
              width={70}
              height={70}
              className="rounded-full border object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">{auteurNom}</p>
              <p className="text-sm text-gray-500">
                Auteur de l’annonce
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            CANDIDATURES (si auteur)
        ------------------------------------------------------------ */}
        {user?.uid === annonce.userId && (
          <AuteurCandidatures
            annonce={annonce}
            candidatures={candidatures}
            setAnnonce={setAnnonce}
            setCandidatures={setCandidatures}
          />
        )}

        {/* ------------------------------------------------------------
            ÉTAT TÂCHE TERMINÉE
        ------------------------------------------------------------ */}
        {(user?.uid === annonce.userId ||
          user?.uid === annonce.acceptedUserId) &&
          annonce.acceptedUserId && (
            <TaskCompletion annonce={annonce} user={user} setAnnonce={setAnnonce} />
          )}

        {/* ------------------------------------------------------------
            BOUTON POSTULER (si étudiant non auteur)
        ------------------------------------------------------------ */}
        {user?.uid !== annonce.userId &&
          user?.uid !== annonce.acceptedUserId &&
          annonce.statut === "ouverte" && (
            <PostulerAnnonce
              annonce={annonce}
              user={user}
              setMessage={() => {}}
            />
          )}
      </div>
    </div>
  );
}

/* ===============================================================
   COMPONENT : InfoCard Woppy
=============================================================== */
function InfoCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 hover:shadow-lg transition-all">
      <div className="p-2 bg-[#8a6bfe]/10 text-[#8a6bfe] rounded-lg">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </div>
  );
}

/* ===============================================================
   COMPONENT : PostulerAnnonce
=============================================================== */
function PostulerAnnonce({
  annonce,
  user,
}: {
  annonce: Annonce;
  user: any;
  setMessage?: any;
}) {
  const [loading, setLoading] = useState(false);

  async function postuler() {
    if (!user) return alert("Connexion obligatoire.");
    setLoading(true);

    try {
      // Création candidature
      await addDoc(collection(db, "candidatures"), {
        annonceId: annonce.id,
        userId: user.uid,
        date: serverTimestamp(),
        statut: "en attente",
      });

      // Notification vers auteur
      await addDoc(collection(db, "notifications"), {
        toUser: annonce.userId,
        fromUser: user.uid,
        type: "nouvelle_candidature",
        annonceId: annonce.id,
        message: "Un étudiant a postulé à votre annonce.",
        createdAt: serverTimestamp(),
        read: false,
      });

      alert("Votre candidature a été envoyée 🎉");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la candidature.");
    }

    setLoading(false);
  }

  return (
    <div className="mt-8 text-center">
      <button
        onClick={postuler}
        disabled={loading}
        className="px-8 py-3 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white rounded-xl shadow-lg hover:shadow-xl transition font-semibold"
      >
        {loading ? "Envoi..." : "Postuler à cette annonce"}
      </button>
    </div>
  );
}

/* ===============================================================
   COMPONENT : Liste des candidatures (pour l'auteur)
=============================================================== */
function AuteurCandidatures({
  annonce,
  candidatures,
  setAnnonce,
  setCandidatures,
}: any) {
  const router = useRouter();

  async function accepter(c: Candidature) {
    try {
      // Acceptation candidature
      await updateDoc(doc(db, "annonces", annonce.id), {
        statut: "en cours",
        acceptedUserId: c.userId,
        acceptedUserName: c.userName,
        taskCompletion: { author: false, student: false },
      });

      await updateDoc(doc(db, "candidatures", c.id), {
        statut: "acceptée",
      });

      await addDoc(collection(db, "notifications"), {
        toUser: c.userId,
        fromUser: annonce.userId,
        type: "acceptation",
        annonceId: annonce.id,
        message: "Votre candidature a été acceptée 🎉",
        createdAt: serverTimestamp(),
        read: false,
      });

      setAnnonce({
        ...annonce,
        statut: "en cours",
        acceptedUserId: c.userId,
        acceptedUserName: c.userName,
        taskCompletion: { author: false, student: false },
      });

      alert("Candidat accepté !");
    } catch (err) {
      console.error(err);
      alert("Impossible d'accepter ce candidat");
    }
  }

  async function openChat(targetId: string) {
    try {
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", annonce.userId)
      );

      const snap = await getDocs(q);
      let chatFound = null;

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.participants.includes(targetId)) {
          chatFound = { id: docSnap.id };
          break;
        }
      }

      if (!chatFound) {
        const newChat = await addDoc(collection(db, "chats"), {
          participants: [annonce.userId, targetId],
          annonceId: annonce.id,
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          unreadCount: {
            [annonce.userId]: 0,
            [targetId]: 1,
          },
        });
        router.push(`/messages?chatId=${newChat.id}`);
      } else {
        router.push(`/messages?chatId=${chatFound.id}`);
      }
    } catch (err) {
      console.error("Erreur chat :", err);
    }
  }

  return (
    <div className="mt-10 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#8a6bfe]">
        <User size={20} /> Candidatures reçues
      </h3>

      {candidatures.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune candidature reçue.</p>
      ) : (
        <div className="space-y-4">
          {candidatures.map((c: Candidature) => (
            <div
              key={c.id}
              className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={c.photoURL || ""}
                  alt={c.userName || ""}
                  width={48}
                  height={48}
                  className="rounded-full border object-cover"
                />
                <div>
                  <p className="font-semibold">{c.userName}</p>
                  <p className="text-xs text-gray-500">{c.statut}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => accepter(c)}
                  disabled={annonce.acceptedUserId === c.userId}
                  className="bg-[#8a6bfe] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#7a5bee]"
                >
                  {annonce.acceptedUserId === c.userId
                    ? "Accepté"
                    : "Accepter"}
                </button>

                <button
                  onClick={() => openChat(c.userId)}
                  className="px-4 py-2 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white rounded-lg text-sm"
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===============================================================
   COMPONENT : TaskCompletion (tâche effectuée)
=============================================================== */
function TaskCompletion({ annonce, user, setAnnonce }: any) {
  const router = useRouter();

  const isAuthor = user.uid === annonce.userId;
  const isStudent = user.uid === annonce.acceptedUserId;

  async function confirm() {
    try {
      const update = {
        author: annonce.taskCompletion?.author || isAuthor,
        student: annonce.taskCompletion?.student || isStudent,
      };

      await updateDoc(doc(db, "annonces", annonce.id), {
        taskCompletion: update,
      });

      setAnnonce({
        ...annonce,
        taskCompletion: update,
      });

      if (update.author && update.student) {
        await updateDoc(doc(db, "annonces", annonce.id), {
          statut: "fini",
        });

        if (isAuthor) {
          router.push(
            `/review/${annonce.acceptedUserId}?annonceId=${annonce.id}`
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-10 text-center border-t pt-6">
      <button
        onClick={confirm}
        disabled={
          (isAuthor && annonce.taskCompletion?.author) ||
          (isStudent && annonce.taskCompletion?.student)
        }
        className="px-6 py-3 bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
      >
        Confirmer que la tâche est effectuée
      </button>
    </div>
  );
}
