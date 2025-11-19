"use client";

import { use, useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { X, MapPin, Briefcase, Upload, Check, AlertCircle } from "lucide-react";

const auth = getAuth();
const storage = getStorage();

export default function CareerDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchJob() {
      const refDoc = doc(db, "careers", id);
      const snap = await getDoc(refDoc);

      if (snap.exists()) setJob(snap.data());
      setLoading(false);
    }

    fetchJob();
  }, [id]);

  // FORMULAIRE
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitApplication(e: any) {
    e.preventDefault();
    setSending(true);
    setError(null);

    if (!currentUser) {
      setError("Vous devez être connecté pour postuler.");
      setSending(false);
      return;
    }

    let cvUrl = null;

    try {
      if (cv) {
        const storageRef = ref(storage, `cv/${currentUser.uid}/${Date.now()}-${cv.name}`);
        await uploadBytes(storageRef, cv);
        cvUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "applications"), {
        applicantId: currentUser.uid,
        careerId: id,
        fullName,
        email,
        message,
        cvUrl,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setFullName("");
        setEmail("");
        setMessage("");
        setCv(null);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Impossible d'envoyer la candidature. Veuillez réessayer.");
    }

    setSending(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication(e);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Offre introuvable</h2>
          <p className="text-gray-600">Cette offre d'emploi n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-[#7b5bff] text-white p-3 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{job.location}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="w-full sm:w-auto bg-[#7b5bff] hover:bg-[#7b5bff] hover:cursor-pointer text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
          >
            Postuler maintenant
            <span className="text-xl">→</span>
          </button>
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Description du poste</h2>
          <div className="prose prose-gray max-w-none">
            <p className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
              {job.description}
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Candidature pour {job.title}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Candidature envoyée !
                  </h3>
                  <p className="text-gray-600">
                    Nous reviendrons vers vous très bientôt.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      className="w-full border border-gray-300 focus:border-black focus:ring-2 focus:ring-black/10 p-3 rounded-xl transition-all outline-none"
                      placeholder="Jean Dupont"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      className="w-full border border-gray-300 focus:border-black focus:ring-2 focus:ring-black/10 p-3 rounded-xl transition-all outline-none"
                      type="email"
                      placeholder="jean.dupont@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message de motivation *
                    </label>
                    <textarea
                      className="w-full border border-gray-300 focus:border-black focus:ring-2 focus:ring-black/10 p-3 rounded-xl min-h-[140px] transition-all outline-none resize-none"
                      placeholder="Parlez-nous de vous et de votre motivation..."
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CV (PDF)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setCv(e.target.files?.[0] ?? null)}
                        className="hidden"
                        id="cv-upload"
                      />
                      <label
                        htmlFor="cv-upload"
                        className="flex items-center justify-center gap-3 w-full border-2 border-dashed border-gray-300 hover:border-black p-4 rounded-xl cursor-pointer transition-all group"
                      >
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                        <span className="text-gray-600 group-hover:text-black font-medium transition-colors">
                          {cv ? cv.name : "Cliquez pour télécharger votre CV"}
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={sending}
                    className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed mt-6"
                  >
                    {sending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Envoi en cours...
                      </span>
                    ) : (
                      "Envoyer ma candidature"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}