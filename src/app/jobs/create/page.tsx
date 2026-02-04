"use client";

import { useState, useEffect } from "react";
import { db, storage, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  MapPin,
  Euro,
  Calendar,
  Clock,
  Image as ImageIcon,
  Users,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { user } from "firebase-functions/v1/auth";

export default function CreateAnnoncePage() {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    date: "",
    duree: "",
    lieu: "",
    remuneration: "",
    maxApplicants: 1,
  });

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );

  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  /* ----------------------------- AUTOCOMPLETE ----------------------------- */
  useEffect(() => {
    const q = form.lieu.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingAddress(true);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=be&limit=5`
        );

        const data = await res.json();
        setSuggestions(data);
      } catch (_) {}

      setIsLoadingAddress(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [form.lieu]);

  const selectAddress = (s: any) => {
    setForm({ ...form, lieu: s.display_name });
    setCoords({ lat: Number(s.lat), lon: Number(s.lon) });
    setSuggestions([]);
  };

  /* ----------------------------- IMAGE UPLOAD ----------------------------- */
  const handleSelectPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    setPhotos((p) => [...p, ...files]);

    const previews = files.map((f) => URL.createObjectURL(f));
    setPreview((p) => [...p, ...previews]);
  };

  const removePhoto = (i: number) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPreview((p) => p.filter((_, idx) => idx !== i));
  };

  /* ----------------------------- SUBMIT ----------------------------- */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // upload des photos
      const uploaded: string[] = [];

      const u = auth.currentUser;
      if (!u) {
        alert("Vous devez être connecté.");
        setLoading(false);
        return;
      }

      for (const file of photos) {
        const storageRef = ref(
          storage,
          `annonceImages/${u.uid}/${file.name}`
        );
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploaded.push(url);
      }

        await addDoc(collection(db, "annonces"), {
          titre: form.titre,
          description: form.description,
          date: form.date,
          duree: Number(form.duree),
          lieu: form.lieu,
          coords: coords ? coords : null,
          remuneration: Number(form.remuneration),

          statut: "ouverte",

          photos: uploaded,

          maxApplicants: Number(form.maxApplicants),
          currentApplicants: 0,
          applicants: [],

          userId: u.uid,        // <= ICI !!!
          createdAt: serverTimestamp(),
        });

      alert("Annonce créée !");
      window.location.href = "/jobs";
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la création.");
    }

    setLoading(false);
  };

  /* ----------------------------- UI ----------------------------- */

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 text-gray-900">
      <h1 className="text-3xl font-bold mb-6">
        Publier une annonce
      </h1>

      <form onSubmit={submit} className="space-y-6">

        {/* TITRE */}
        <div>
          <label className="font-medium text-sm">Titre</label>
          <input
            className="w-full mt-1 px-4 py-3 rounded-xl border bg-white"
            value={form.titre}
            onChange={(e) =>
              setForm({ ...form, titre: e.target.value })
            }
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="font-medium text-sm">
            Description du travail
          </label>
          <textarea
            className="w-full mt-1 px-4 py-3 rounded-xl border bg-white resize-none"
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            required
          />
        </div>

        {/* DATE */}
        <div>
          <label className="font-medium text-sm flex items-center gap-2">
            <Calendar size={16} /> Date du service
          </label>
          <input
            type="date"
            className="w-full mt-1 px-4 py-3 rounded-xl border bg-white"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
            required
          />
        </div>

        {/* DUREE */}
        <div>
          <label className="font-medium text-sm flex items-center gap-2">
            <Clock size={16} /> Durée estimée (heures)
          </label>
          <input
            type="number"
            className="w-full mt-1 px-4 py-3 rounded-xl border bg-white"
            value={form.duree}
            onChange={(e) =>
              setForm({ ...form, duree: e.target.value })
            }
            required
          />
        </div>

        {/* ADRESSE + AUTOCOMPLETE */}
        <div className="relative">
          <label className="font-medium text-sm flex items-center gap-2">
            <MapPin size={16} /> Adresse
          </label>
          <input
            className="w-full mt-1 px-4 py-3 rounded-xl border bg-white"
            value={form.lieu}
            onChange={(e) =>
              setForm({ ...form, lieu: e.target.value })
            }
            placeholder="Louvain-la-Neuve…"
            required
          />

          {isLoadingAddress && (
            <div className="absolute right-3 top-10 animate-spin">
              <Loader2 size={18} />
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="absolute z-20 w-full bg-white shadow-xl rounded-xl mt-2 border">
              {suggestions.map((s: any, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => selectAddress(s)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-xl"
                >
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* REMUNERATION */}
        <div>
          <label className="font-medium text-sm flex items-center gap-2">
            <Euro size={16} /> Rémunération (€ / heure)
          </label>
          <input
            type="number"
            className="w-full mt-1 px-4 py-3 rounded-xl border bg-white"
            value={form.remuneration}
            onChange={(e) =>
              setForm({ ...form, remuneration: e.target.value })
            }
            required
          />
        </div>

        {/* NOMBRE D'ÉTUDIANTS */}
        <div>
          <label className="font-medium text-sm flex items-center gap-2">
            <Users size={16} /> Étudiants recherchés
          </label>
          <input
            type="number"
            min={1}
            max={20}
            className="w-full mt-1 px-4 py-3 rounded-xl border bg-white"
            value={form.maxApplicants}
            onChange={(e) =>
              setForm({
                ...form,
                maxApplicants: Number(e.target.value),
              })
            }
            required
          />
        </div>

        {/* UPLOAD PHOTOS */}
        <div>
          <label className="font-medium text-sm flex items-center gap-2">
            <ImageIcon size={16} /> Photos du travail
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleSelectPhotos}
            className="mt-2"
          />

          {/* PREVIEW */}
          {preview.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {preview.map((url, i) => (
                <div
                  key={i}
                  className="relative w-full h-24 bg-gray-100 rounded-xl overflow-hidden"
                >
                  <img
                    src={url}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 shadow"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#8a6bfe] text-white font-semibold rounded-xl shadow-lg hover:bg-[#7a5bee] transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          Publier
        </button>
      </form>
    </div>
  );
}
