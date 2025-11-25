"use client";

import { FormEvent, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Briefcase,
  MapPin,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JobsCareerDashboardPage() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("CDI");
  const [description, setDescription] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        title,
        location,
        type,
        description,
        applyUrl: applyUrl || null,
        active,
        createdAt: serverTimestamp(),
      });

      setSuccessMsg("Offre créée avec succès ! Elle est maintenant visible sur /careers");
      setTitle("");
      setLocation("");
      setType("CDI");
      setDescription("");
      setApplyUrl("");
      setActive(true);

      // Auto-hide success message after 5s
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (error) {
      console.error(error);
      setErrorMsg("Une erreur est survenue lors de la création de l'offre.");
    } finally {
      setLoading(false);
    }
  };

  const contractTypes = [
    { value: "CDI", label: "CDI", color: "from-blue-500 to-cyan-500" },
    { value: "CDD", label: "CDD", color: "from-purple-500 to-pink-500" },
    { value: "Stage", label: "Stage", color: "from-orange-500 to-red-500" },
    { value: "Freelance", label: "Freelance", color: "from-green-500 to-emerald-500" },
    { value: "Étudiant", label: "Étudiant", color: "from-[#8a6bfe] to-[#6b4fd9]" },
    { value: "Autre", label: "Autre", color: "from-gray-600 to-gray-800" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header avec gradient Woppy */}
      <div className="bg-gradient-to-r from-[#6b4fd9] via-[#8a6bfe] to-[#7b5bef] text-white shadow-xl">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Jobs & Careers</h1>
              <p className="text-purple-100">
                Créez et publiez des offres d'emploi pour Woppy
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Publication automatique</h3>
            <p className="text-sm text-gray-700">
              Les offres créées ici seront automatiquement affichées sur la page publique{' '}
              <strong className="text-[#8a6bfe]">/careers</strong>. Assurez-vous de remplir tous les champs requis.
            </p>
          </div>
        </motion.div>

        {/* Messages de feedback */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 mb-6 shadow-lg flex items-start gap-4"
            >
              <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Succès !</p>
                <p className="text-sm text-green-50">{successMsg}</p>
              </div>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-6 mb-6 shadow-lg flex items-start gap-4"
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Erreur</p>
                <p className="text-sm text-red-50">{errorMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulaire */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl text-black shadow-md border border-gray-100 p-8 space-y-6"
        >
          {/* Titre */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#8a6bfe]" />
              Titre du poste *
            </label>
            <input
              type="text"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8a6bfe] focus:border-[#8a6bfe] transition-all"
              placeholder="Ex : Développeur·se Full-Stack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8a6bfe]" />
              Lieu *
            </label>
            <input
              type="text"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8a6bfe] focus:border-[#8a6bfe] transition-all"
              placeholder="Ex : Louvain-la-Neuve, Bruxelles, Remote…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Type de contrat - Cards sélectionnables */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Type de contrat *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {contractTypes.map((contract) => (
                <button
                  key={contract.value}
                  type="button"
                  onClick={() => setType(contract.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-center font-medium ${
                    type === contract.value
                      ? `bg-gradient-to-br ${contract.color} text-white border-transparent shadow-lg scale-105`
                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#8a6bfe] hover:shadow-md'
                  }`}
                >
                  {contract.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8a6bfe]" />
              Description *
            </label>
            <textarea
              className="w-full min-h-[180px] rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8a6bfe] focus:border-[#8a6bfe] transition-all resize-none"
              placeholder="Décris le poste, les missions, le profil recherché, les compétences requises…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2">
              {description.length} caractères
            </p>
          </div>

          {/* URL de candidature */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#8a6bfe]" />
              Lien de candidature
              <span className="text-xs font-normal text-gray-500">(optionnel)</span>
            </label>
            <input
              type="url"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8a6bfe] focus:border-[#8a6bfe] transition-all"
              placeholder="Ex : https://forms.gle/... ou mailto:jobs@woppy.be"
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
            />
          </div>

          {/* Active - Toggle moderne */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {active ? (
                  <Eye className="w-5 h-5 text-[#8a6bfe]" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-bold text-gray-900">Visibilité de l'offre</p>
                  <p className="text-sm text-gray-600">
                    {active
                      ? "L'offre sera visible sur la page /careers"
                      : "L'offre sera cachée et non accessible au public"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`relative w-14 h-8 rounded-full transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9]'
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    active ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8a6bfe] to-[#6b4fd9] px-6 py-4 text-base font-bold text-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publication en cours...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Publier l'offre
                </>
              )}
            </button>
          </div>

          {/* Champs requis note */}
          <p className="text-xs text-gray-500 text-center pt-2">
            Les champs marqués d'un astérisque (*) sont obligatoires
          </p>
        </motion.form>

        {/* Preview section (optionnel) */}
        {title && description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#8a6bfe]" />
              Aperçu de l'offre
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{title}</h4>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className={`px-3 py-1 bg-gradient-to-r ${
                    contractTypes.find(c => c.value === type)?.color
                  } text-white rounded-full text-sm font-semibold`}>
                    {type}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location}
                  </span>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{description}</p>
              </div>

              {applyUrl && (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#8a6bfe] hover:underline text-sm font-medium"
                >
                  <LinkIcon className="w-4 h-4" />
                  Lien de candidature
                </a>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}