"use client";

import { useState, useEffect } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  MapPin, Euro, Calendar, Clock, ImageIcon, Users,
  Loader2, X, ArrowLeft, CheckCircle, Info, Upload,
} from "lucide-react";
<<<<<<< HEAD
import Link from "next/link";

const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5";
const inputCls = `
  w-full px-4 py-2.5 text-sm rounded-xl
  border border-slate-200 bg-white text-slate-800
  placeholder:text-slate-400
  focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400
  transition-all
`;

type DateMode = "exact" | "range";
type RateMode = "hourly" | "fixed";
=======
import { user } from "firebase-functions/v1/auth";
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd

export default function CreateAnnoncePage() {
  const [loading, setLoading]               = useState(false);
  const [photos, setPhotos]                 = useState<File[]>([]);
  const [preview, setPreview]               = useState<string[]>([]);
  const [suggestions, setSuggestions]       = useState<any[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [coords, setCoords]                 = useState<{ lat: number; lon: number } | null>(null);
  const [success, setSuccess]               = useState(false);
  const [dateMode, setDateMode]             = useState<DateMode>("exact");
  const [rateMode, setRateMode]             = useState<RateMode>("hourly");
  const [rateError, setRateError]           = useState(false);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    date: "",
    dateFrom: "",
    dateTo: "",
    duree: "",
    lieu: "",
    remuneration: "",
    maxApplicants: 1,
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  /* ── address autocomplete ── */
  useEffect(() => {
    const q = form.lieu.trim();
    if (!q || q.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      setIsLoadingAddress(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=be&limit=5`);
        setSuggestions(await res.json());
      } catch {}
      setIsLoadingAddress(false);
    }, 300);
    return () => clearTimeout(t);
  }, [form.lieu]);

  const selectAddress = (s: any) => {
    setForm({ ...form, lieu: s.display_name });
    setCoords({ lat: Number(s.lat), lon: Number(s.lon) });
    setSuggestions([]);
  };

  /* ── photos ── */
  const handleSelectPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos(p => [...p, ...files]);
    setPreview(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
  };
  const removePhoto = (i: number) => {
    setPhotos(p => p.filter((_, idx) => idx !== i));
    setPreview(p => p.filter((_, idx) => idx !== i));
  };

  /* ── rate validation ── */
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set("remuneration")(e);
    // Pour le tarif horaire : minimum 12 €/h
    // Pour le tarif fixe : pas de minimum
    if (rateMode === "hourly") {
      setRateError(Number(e.target.value) < 12 && e.target.value !== "");
    } else {
      setRateError(false);
    }
  };

  // Réinitialise l'erreur quand on change de mode
  const handleRateModeChange = (mode: RateMode) => {
    setRateMode(mode);
    setRateError(false);
    setForm(f => ({ ...f, remuneration: "" }));
  };

  /* ── cost estimate ── */
  const cost = form.remuneration
    ? rateMode === "hourly" && form.duree
      ? Number(form.remuneration) * Number(form.duree) * form.maxApplicants
      : rateMode === "fixed"
      ? Number(form.remuneration) * form.maxApplicants
      : null
    : null;

  /* ── submit ── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (rateMode === "hourly" && Number(form.remuneration) < 12) { setRateError(true); return; }

    setLoading(true);
    try {
      const u = auth.currentUser;
      if (!u) { alert("Vous devez être connecté."); setLoading(false); return; }

      const uploaded: string[] = [];
<<<<<<< HEAD
      for (const file of photos) {
        const r = ref(storage, `annonceImages/${u.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(r, file);
        uploaded.push(await getDownloadURL(r));
=======

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
>>>>>>> fb6d96296a98b12427d98bea6fed32d1966906fd
      }

      const dateValue = dateMode === "exact"
        ? form.date
        : `Du ${form.dateFrom} au ${form.dateTo}`;

      await addDoc(collection(db, "annonces"), {
        titre: form.titre,
        description: form.description,
        date: dateValue,
        dateMode,
        dateFrom: dateMode === "range" ? form.dateFrom : null,
        dateTo:   dateMode === "range" ? form.dateTo   : null,
        duree: Number(form.duree) || null,
        lieu: form.lieu,
        coords: coords ?? null,
        remuneration: Number(form.remuneration),
        rateMode,                                    // ← "hourly" ou "fixed"
        statut: "ouverte",
        photos: uploaded,
        maxApplicants: Number(form.maxApplicants),
        currentApplicants: 0,
        applicants: [],
        userId: u.uid,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => { window.location.href = "/jobs"; }, 1800);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création.");
    }
    setLoading(false);
  };

  /* ── success screen ── */
  if (success) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={24} className="text-emerald-500" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1" style={{ fontFamily: 'Sora, system-ui' }}>Annonce publiée</h2>
        <p className="text-sm text-slate-500">Redirection en cours…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&display=swap');`}</style>

      <div className="min-h-screen bg-slate-50">

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-3">
            <Link href="/jobs" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div className="w-px h-4 bg-slate-200" />
            <h1 className="text-sm font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Sora, system-ui' }}>
              Publier une annonce
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-10">

          {/* ── Info banner ── */}
          <div className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 mb-8">
            <Info size={14} className="text-violet-500 shrink-0 mt-0.5" />
            <p className="text-xs text-violet-700 leading-relaxed">
              Ton annonce sera visible par tous les étudiants vérifiés sur Woppy.
              Sois précis dans ta description pour attirer les meilleurs candidats.
            </p>
          </div>

          <form onSubmit={submit}>
            <div className="space-y-4">

              {/* ── La mission ── */}
              <Section label="La mission">
                <div>
                  <label className={labelCls}>Titre</label>
                  <input className={inputCls} value={form.titre} onChange={set("titre")}
                    placeholder="Ex : Aide pour déménagement" required />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea className={inputCls + " resize-none"} rows={4}
                    value={form.description} onChange={set("description")}
                    placeholder="Décris précisément le travail, les outils nécessaires, les conditions…" required />
                </div>
              </Section>

              {/* ── Quand ── */}
              <Section label="Quand">
                <div>
                  <label className={labelCls}>Type de disponibilité</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    {(["exact", "range"] as DateMode[]).map((m, i) => (
                      <button key={m} type="button" onClick={() => setDateMode(m)}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${
                          dateMode === m ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}>
                        <Calendar size={12} /> {m === "exact" ? "Date précise" : "Intervalle"}
                      </button>
                    ))}
                  </div>
                </div>

                {dateMode === "exact" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}><span className="flex items-center gap-1.5"><Calendar size={11} /> Date</span></label>
                      <input type="date" className={inputCls} value={form.date} onChange={set("date")} required={dateMode === "exact"} />
                    </div>
                    <div>
                      <label className={labelCls}><span className="flex items-center gap-1.5"><Clock size={11} /> Durée (heures)</span></label>
                      <input type="number" min={0.5} step={0.5} className={inputCls} value={form.duree} onChange={set("duree")} placeholder="3" required />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Du</label>
                        <input type="date" className={inputCls} value={form.dateFrom} onChange={set("dateFrom")} required={dateMode === "range"} />
                      </div>
                      <div>
                        <label className={labelCls}>Au</label>
                        <input type="date" className={inputCls} value={form.dateTo} onChange={set("dateTo")} min={form.dateFrom || undefined} required={dateMode === "range"} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}><span className="flex items-center gap-1.5"><Clock size={11} /> Durée estimée (heures)</span></label>
                      <input type="number" min={0.5} step={0.5} className={inputCls} value={form.duree} onChange={set("duree")} placeholder="3" required />
                    </div>
                    {form.dateFrom && form.dateTo && (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border border-violet-100 rounded-xl">
                        <Calendar size={12} className="text-violet-500 shrink-0" />
                        <span className="text-xs text-violet-700">
                          Du <strong>{new Date(form.dateFrom).toLocaleDateString("fr-BE", { day: "numeric", month: "long" })}</strong>
                          {" "}au <strong>{new Date(form.dateTo).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              {/* ── Où ── */}
              <Section label="Où">
                <div className="relative">
                  <label className={labelCls}><span className="flex items-center gap-1.5"><MapPin size={11} /> Adresse</span></label>
                  <div className="relative">
                    <input className={inputCls} value={form.lieu} onChange={set("lieu")}
                      placeholder="Louvain-la-Neuve, Rue de…" required />
                    {isLoadingAddress && <Loader2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />}
                  </div>
                  {suggestions.length > 0 && (
                    <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-lg overflow-hidden">
                      {suggestions.map((s, i) => (
                        <button type="button" key={i} onClick={() => selectAddress(s)}
                          className={`w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors ${i < suggestions.length - 1 ? "border-b border-slate-100" : ""}`}>
                          {s.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                  {coords && (
                    <p className="mt-1.5 text-[11px] text-emerald-600 flex items-center gap-1">
                      <CheckCircle size={10} /> Position géolocalisée
                    </p>
                  )}
                </div>
              </Section>

              {/* ── Rémunération ── */}
              <Section label="Rémunération">

                {/* Toggle tarif horaire / fixe */}
                <div>
                  <label className={labelCls}>Type de tarif</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    <button type="button" onClick={() => handleRateModeChange("hourly")}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${
                        rateMode === "hourly" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}>
                      <Clock size={12} /> Tarif horaire
                    </button>
                    <button type="button" onClick={() => handleRateModeChange("fixed")}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${
                        rateMode === "fixed" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}>
                      <Euro size={12} /> Tarif fixe
                    </button>
                  </div>

                  {/* Explication contextuelle */}
                  <p className="mt-2 text-[11px] text-slate-400">
                    {rateMode === "hourly"
                      ? "Ex : 15 €/h · La rémunération totale est calculée selon la durée de la mission."
                      : "Ex : 30 € pour monter un meuble · Le montant est fixe quelle que soit la durée."
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      <span className="flex items-center gap-1.5">
                        <Euro size={11} /> {rateMode === "hourly" ? "Tarif horaire" : "Montant fixe"}
                      </span>
                    </label>
                    <div className="relative">
                      <input type="number" min={rateMode === "hourly" ? 12 : 1} step={0.5}
                        className={inputCls + " pr-16 " + (rateError ? "border-red-400 focus:ring-red-400/30 focus:border-red-400" : "")}
                        value={form.remuneration}
                        onChange={handleRateChange}
                        placeholder={rateMode === "hourly" ? "14" : "30"}
                        required />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 whitespace-nowrap">
                        {rateMode === "hourly" ? "€/h" : "€ fixe"}
                      </span>
                    </div>
                    {rateMode === "hourly" && rateError && (
                      <p className="mt-1.5 text-[11px] text-red-500">Le tarif minimum légal est de 12 €/h</p>
                    )}
                    {rateMode === "hourly" && !rateError && (
                      <p className="mt-1.5 text-[11px] text-slate-400">Minimum légal : 12 €/h</p>
                    )}
                    {rateMode === "fixed" && (
                      <p className="mt-1.5 text-[11px] text-slate-400">Montant total versé à l'étudiant</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}><span className="flex items-center gap-1.5"><Users size={11} /> Étudiants</span></label>
                    <input type="number" min={1} max={20} className={inputCls}
                      value={form.maxApplicants}
                      onChange={e => setForm({ ...form, maxApplicants: Number(e.target.value) })} required />
                  </div>
                </div>

                {/* Cost estimate */}
                {cost !== null && !rateError && (
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-500">
                      Coût estimé total
                      {rateMode === "hourly" && form.duree && (
                        <span className="text-slate-400"> ({form.duree}h × {form.remuneration} €{form.maxApplicants > 1 ? ` × ${form.maxApplicants} étudiants` : ""})</span>
                      )}
                      {rateMode === "fixed" && form.maxApplicants > 1 && (
                        <span className="text-slate-400"> ({form.remuneration} € × {form.maxApplicants} étudiants)</span>
                      )}
                    </span>
                    <span className="font-bold text-sm text-slate-900" style={{ fontFamily: 'Sora, system-ui' }}>
                      {cost.toLocaleString("fr-BE")} €
                    </span>
                  </div>
                )}
              </Section>

              {/* ── Photos du service ── */}
              <Section label="Photos du service (optionnel)">
                <p className="text-xs text-slate-400 -mt-1 mb-1">Ajoute des photos pour aider les étudiants à mieux comprendre la mission.</p>
                <label className="flex flex-col items-center justify-center gap-3 w-full py-8 rounded-xl
                                   border-2 border-dashed border-slate-200 bg-slate-50
                                   hover:border-violet-300 hover:bg-violet-50/30 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                    <Upload size={18} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600 group-hover:text-violet-600 transition-colors">Cliquer pour ajouter des photos</p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP — plusieurs fichiers acceptés</p>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleSelectPhotos} className="hidden" />
                </label>
                {preview.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {preview.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
                        <img src={url} className="w-full h-full object-cover" alt={`preview ${i}`} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                        <button type="button" onClick={() => removePhoto(i)}
                          className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-500">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    <label className="relative aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/30 flex items-center justify-center cursor-pointer transition-all group">
                      <Upload size={14} className="text-slate-400 group-hover:text-violet-400 transition-colors" />
                      <input type="file" accept="image/*" multiple onChange={handleSelectPhotos} className="hidden" />
                    </label>
                  </div>
                )}
              </Section>

              {/* ── Submit ── */}
              <button type="submit" disabled={loading || rateError}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold
                           rounded-xl transition-all shadow-sm shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                style={{ fontFamily: 'Sora, system-ui' }}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Publication en cours…</> : "Publier l'annonce"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-50">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}