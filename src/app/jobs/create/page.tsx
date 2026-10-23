"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, storage, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { Alert, Page, PageHeader, Section, Tabs } from "@/components/ui";

type DateMode = "exact" | "range";
type RateMode = "hourly" | "fixed";
type AddressSuggestion = { display_name: string; lat: string; lon: string };

/* Règle Woppy (et non minimum légal) pour le tarif horaire */
const MIN_HOURLY_RATE = 12;

const today = () => new Date().toISOString().slice(0, 10);

export default function CreateAnnoncePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [dateMode, setDateMode] = useState<DateMode>("exact");
  const [rateMode, setRateMode] = useState<RateMode>("hourly");

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
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /* Autocomplétion d'adresse (OpenStreetMap) */
  useEffect(() => {
    const q = form.lieu.trim();
    if (q.length < 2 || coords) return;
    const t = setTimeout(async () => {
      setIsLoadingAddress(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=be&limit=5`);
        setSuggestions(await res.json());
      } catch {
        setSuggestions([]);
      }
      setIsLoadingAddress(false);
    }, 300);
    return () => clearTimeout(t);
  }, [form.lieu, coords]);

  const selectAddress = (s: AddressSuggestion) => {
    setForm((f) => ({ ...f, lieu: s.display_name }));
    setCoords({ lat: Number(s.lat), lon: Number(s.lon) });
    setSuggestions([]);
  };

  const handleSelectPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos((p) => [...p, ...files]);
    setPreview((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };
  const removePhoto = (i: number) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPreview((p) => p.filter((_, idx) => idx !== i));
  };

  const visibleSuggestions = coords || form.lieu.trim().length < 2 ? [] : suggestions;

  const rateTooLow = rateMode === "hourly" && form.remuneration !== "" && Number(form.remuneration) < MIN_HOURLY_RATE;

  const cost = form.remuneration
    ? rateMode === "hourly" && form.duree
      ? Number(form.remuneration) * Number(form.duree) * form.maxApplicants
      : rateMode === "fixed"
        ? Number(form.remuneration) * form.maxApplicants
        : null
    : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || rateTooLow) return;
    setError("");

    const u = auth.currentUser;
    if (!u) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const uploaded: string[] = [];
      for (const file of photos) {
        const r = ref(storage, `annonceImages/${u.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(r, file);
        uploaded.push(await getDownloadURL(r));
      }

      const created = await addDoc(collection(db, "annonces"), {
        titre: form.titre.trim(),
        description: form.description.trim(),
        date: dateMode === "exact" ? form.date : `Du ${form.dateFrom} au ${form.dateTo}`,
        dateMode,
        dateFrom: dateMode === "range" ? form.dateFrom : null,
        dateTo: dateMode === "range" ? form.dateTo : null,
        duree: Number(form.duree) || null,
        lieu: form.lieu,
        coords: coords ?? null,
        remuneration: Number(form.remuneration),
        rateMode,
        statut: "ouverte",
        photos: uploaded,
        maxApplicants: Number(form.maxApplicants),
        currentApplicants: 0,
        applicants: [],
        userId: u.uid,
        createdAt: serverTimestamp(),
      });

      router.push(`/jobs/${created.id}`);
    } catch {
      setError("L’annonce n’a pas pu être publiée. Vérifiez votre connexion et réessayez.");
      setLoading(false);
    }
  };

  return (
    <Page narrow>
      <PageHeader
        back={{ href: "/jobs", label: "Annonces" }}
        title="Publier une annonce"
        description="Votre annonce sera visible par tous les étudiants inscrits. Plus elle est précise, plus les candidatures seront pertinentes."
      />

      <form onSubmit={submit} className="space-y-6">
        <Section title="La mission">
          <div className="space-y-4">
            <div>
              <label htmlFor="titre" className="label">Titre</label>
              <input id="titre" className="input" value={form.titre} onChange={set("titre")} placeholder="Ex. : aide pour un déménagement" required maxLength={100} />
            </div>
            <div>
              <label htmlFor="description" className="label">Description</label>
              <textarea id="description" className="input resize-y" rows={5} value={form.description} onChange={set("description")}
                placeholder="Le travail à faire, le matériel nécessaire, les conditions…" required />
            </div>
          </div>
        </Section>

        <Section title="Quand">
          <div className="space-y-4">
            <Tabs
              value={dateMode}
              onChange={setDateMode}
              items={[
                { value: "exact", label: "Date précise" },
                { value: "range", label: "Période" },
              ]}
            />
            {dateMode === "exact" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="label">Date</label>
                  <input id="date" type="date" min={today()} className="input" value={form.date} onChange={set("date")} required />
                </div>
                <div>
                  <label htmlFor="duree" className="label">Durée (heures)</label>
                  <input id="duree" type="number" min={0.5} step={0.5} className="input" value={form.duree} onChange={set("duree")} placeholder="3" required />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="from" className="label">Du</label>
                  <input id="from" type="date" min={today()} className="input" value={form.dateFrom} onChange={set("dateFrom")} required />
                </div>
                <div>
                  <label htmlFor="to" className="label">Au</label>
                  <input id="to" type="date" min={form.dateFrom || today()} className="input" value={form.dateTo} onChange={set("dateTo")} required />
                </div>
                <div>
                  <label htmlFor="duree-r" className="label">Durée (heures)</label>
                  <input id="duree-r" type="number" min={0.5} step={0.5} className="input" value={form.duree} onChange={set("duree")} placeholder="3" required />
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title="Où">
          <div className="relative">
            <label htmlFor="lieu" className="label">Adresse</label>
            <div className="relative">
              <input
                id="lieu"
                className="input pr-9"
                value={form.lieu}
                onChange={(e) => { setCoords(null); set("lieu")(e); }}
                placeholder="Rue, commune…"
                autoComplete="off"
                required
              />
              {isLoadingAddress && <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted" />}
            </div>
            {visibleSuggestions.length > 0 && (
              <ul className="card absolute z-20 mt-1 w-full divide-y divide-line overflow-hidden shadow-lg">
                {visibleSuggestions.map((s) => (
                  <li key={`${s.lat},${s.lon}`}>
                    <button type="button" onClick={() => selectAddress(s)} className="w-full px-3 py-2.5 text-left text-sm hover:bg-paper-2">
                      {s.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1.5 text-xs text-muted">
              {coords ? (
                <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 size={12} /> Adresse localisée : l’annonce apparaîtra sur la carte.</span>
              ) : (
                "Choisissez une adresse dans la liste pour que l’annonce apparaisse sur la carte."
              )}
            </p>
          </div>
        </Section>

        <Section title="Rémunération">
          <div className="space-y-4">
            <Tabs
              value={rateMode}
              onChange={(m) => { setRateMode(m); setForm((f) => ({ ...f, remuneration: "" })); }}
              items={[
                { value: "hourly", label: "Tarif horaire" },
                { value: "fixed", label: "Montant fixe" },
              ]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rate" className="label">{rateMode === "hourly" ? "Tarif horaire" : "Montant fixe"}</label>
                <div className="relative">
                  <input
                    id="rate"
                    type="number"
                    min={rateMode === "hourly" ? MIN_HOURLY_RATE : 1}
                    step={0.5}
                    className={`input pr-12 ${rateTooLow ? "!border-danger focus:!ring-danger/10" : ""}`}
                    value={form.remuneration}
                    onChange={set("remuneration")}
                    placeholder={rateMode === "hourly" ? "14" : "30"}
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">{rateMode === "hourly" ? "€/h" : "€"}</span>
                </div>
                <p className={`mt-1.5 text-xs ${rateTooLow ? "text-danger" : "text-muted"}`}>
                  {rateMode === "hourly" ? `Minimum sur Woppy : ${MIN_HOURLY_RATE} €/h` : "Montant total versé à l’étudiant, quelle que soit la durée."}
                </p>
              </div>
              <div>
                <label htmlFor="max" className="label">Nombre d’étudiants</label>
                <input id="max" type="number" min={1} max={20} className="input" value={form.maxApplicants}
                  onChange={(e) => setForm((f) => ({ ...f, maxApplicants: Number(e.target.value) }))} required />
              </div>
            </div>
            {cost !== null && !rateTooLow && (
              <div className="flex items-center justify-between rounded-lg bg-paper-2 px-4 py-3 text-sm">
                <span className="text-muted">Coût total estimé</span>
                <span className="font-semibold">{cost.toLocaleString("fr-BE")} €</span>
              </div>
            )}
          </div>
        </Section>

        <Section title="Photos" description="Facultatif : aidez les étudiants à visualiser la mission.">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {preview.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} className="h-full w-full object-cover" alt="" />
                <button type="button" onClick={() => removePhoto(i)} aria-label="Retirer la photo"
                  className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white text-ink shadow">
                  <X size={13} />
                </button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-muted transition-colors hover:border-brand hover:text-brand">
              <Upload size={18} />
              <span className="text-xs">Ajouter</span>
              <input type="file" accept="image/*" multiple onChange={handleSelectPhotos} className="sr-only" />
            </label>
          </div>
        </Section>

        {error && <Alert tone="danger">{error}</Alert>}

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => router.back()} className="btn btn-outline">Annuler</button>
          <button type="submit" disabled={loading || rateTooLow} className="btn btn-primary">
            {loading && <Loader2 size={16} className="animate-spin" />} {loading ? "Publication…" : "Publier l’annonce"}
          </button>
        </div>
      </form>
    </Page>
  );
}
