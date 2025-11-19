"use client";

import { FormEvent, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

      setSuccessMsg("Offre créée avec succès ✅");
      setTitle("");
      setLocation("");
      setType("CDI");
      setDescription("");
      setApplyUrl("");
      setActive(true);
    } catch (error) {
      console.error(error);
      setErrorMsg("Une erreur est survenue lors de la création de l’offre.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-black">
      <h1 className="text-3xl font-bold mb-2">Jobs &amp; Careers</h1>
      <p className="text-gray-600 mb-8">
        Crée ici les offres d’emploi Woppy. Elles seront automatiquement
        affichées sur la page publique <strong>/careers</strong>.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
      >
        {/* Titre */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Titre du poste *
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            placeholder="Ex : Développeur·se Full-Stack"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Lieu */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Lieu *
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            placeholder="Ex : Louvain-la-Neuve, Bruxelles, Remote…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Type de contrat */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Type de contrat *
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Freelance">Freelance</option>
            <option value="Étudiant">Étudiant</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description *
          </label>
          <textarea
            className="w-full min-h-[140px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            placeholder="Décris le poste, les missions, le profil recherché…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* URL de candidature */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Lien de candidature (optionnel)
          </label>
          <input
            type="url"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            placeholder="Ex : https://forms.gle/... ou mailto:jobs@woppy.be"
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
          />
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            className="h-4 w-4 border-gray-300 rounded"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <label htmlFor="active" className="text-sm text-gray-700">
            Offre active (visible sur le site)
          </label>
        </div>

        {/* Messages */}
        {successMsg && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {successMsg}
          </p>
        )}
        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {errorMsg}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
        >
          {loading ? "En cours..." : "Publier l’offre"}
        </button>
      </form>
    </main>
  );
}
