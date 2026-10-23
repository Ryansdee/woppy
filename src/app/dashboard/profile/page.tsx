'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  doc, getDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import NextImage from 'next/image';
import {
  Loader2, Save, Upload, Plus, Trash2, User, Calendar,
  Briefcase, GraduationCap, CheckCircle, Clock, MapPin, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';

/* ── types ── */
interface Experience {
  title: string; company: string;
  startDate: string; endDate: string; description: string;
}
interface UserProfile {
  availabilitySchedule: any;
  experiences?: Experience[];
  firstName?: string; lastName?: string;
  bio?: string; city?: string; photoURL?: string;
  hasStudentProfile?: boolean; isAvailable?: boolean;
  studentProfile?: {
    age?: string; description?: string;
    cardURL?: string; verificationStatus?: 'pending' | 'verified' | 'rejected';
  };
}
type CroppedArea = { x: number; y: number; width: number; height: number; };

/* ── crop helpers ── */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}
async function getCroppedImage(imageSrc: string, pixelCrop: CroppedArea) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not found');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas is empty')), 'image/jpeg');
  });
}

/* ── shared input style ── */
const inputCls = "w-full px-3.5 py-2.5 text-sm border border-line rounded-xl bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-line overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
        <div className="w-7 h-7 rounded-lg bg-brand-soft border border-brand-soft flex items-center justify-center text-brand">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-ink" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function DashboardProfilePage() {
  const [user, setUser]       = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const router  = useRouter();
  const storage = getStorage();

  /* crop */
  const [showCropper, setShowCropper]             = useState(false);
  const [selectedImage, setSelectedImage]         = useState<string | null>(null);
  const [rawFile, setRawFile]                     = useState<File | null>(null);
  const [crop, setCrop]                           = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                           = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
  const onCropComplete = useCallback((_: any, cp: CroppedArea) => setCroppedAreaPixels(cp), []);

  /* auth */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (!u) router.push('/auth/login'); else setUser(u); });
    return () => unsub();
  }, [router]);

  /* load */
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setProfile(snap.data() as UserProfile);
    }).finally(() => setLoading(false));
  }, [user]);

  /* save */
  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { ...profile, updatedAt: serverTimestamp() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  /* photo */
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setShowCropper(true);
  };
  const handleCropSave = async () => {
    if (!rawFile || !selectedImage || !user || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedImage(selectedImage, croppedAreaPixels);
      const r = ref(storage, `profilePhotos/${user.uid}/profile.jpg`);
      await uploadBytes(r, blob);
      const url = await getDownloadURL(r);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url, updatedAt: serverTimestamp() });
      setProfile(p => ({ ...p!, photoURL: url }));
      setShowCropper(false); setSelectedImage(null); setRawFile(null);
    } catch (e) { console.error(e); }
  };

  /* student activation */
  const activateStudentAccount = async () => {
    if (!user || !profile) return;
    const updated = { ...profile, hasStudentProfile: true, studentProfile: { verificationStatus: 'verified' as const } };
    await updateDoc(doc(db, 'users', user.uid), { hasStudentProfile: true, studentProfile: updated.studentProfile });
    setProfile(updated);
  };

  /* experiences */
  const addExp    = () => setProfile(p => ({ ...p!, experiences: [...(p?.experiences || []), { title: '', company: '', startDate: '', endDate: '', description: '' }] }));
  const removeExp = (i: number) => setProfile(p => { const e = [...(p?.experiences || [])]; e.splice(i, 1); return { ...p!, experiences: e }; });
  const updateExp = (i: number, field: keyof Experience, value: string) =>
    setProfile(p => { const e = [...(p?.experiences || [])]; e[i] = { ...e[i], [field]: value }; return { ...p!, experiences: e }; });

  /* availability */
  const updateDaySlots = (day: string, slots: any[]) =>
    setProfile(p => ({ ...p!, availabilitySchedule: { ...p!.availabilitySchedule, [day]: { enabled: true, slots } } }));

  /* ── loaders ── */
  if (loading) return (
    <div className="min-h-screen bg-paper-2 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-ink flex items-center justify-center animate-pulse">
          <User size={18} className="text-white" />
        </div>
        <p className="text-sm text-muted font-medium">Chargement…</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-paper-2 flex items-center justify-center">
      <p className="text-sm text-muted">Aucun profil trouvé.</p>
    </div>
  );

  const isStudent = profile.hasStudentProfile === true;
  const fullName  = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Mon profil';
  const days      = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

  return (
    <>
      <style>{``}</style>

      <div className="min-h-screen bg-paper-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-line sticky top-16 z-40">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <h1 className="text-sm font-bold text-ink" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
              Mon profil
            </h1>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-ink hover:bg-ink-2 text-white
                         text-sm font-semibold rounded-xl transition disabled:opacity-60 shadow-sm shadow-brand/30">
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</>
                : saved
                ? <><CheckCircle size={14} /> Enregistré</>
                : <><Save size={14} /> Enregistrer</>
              }
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-5">

            {/* ── Sidebar ── */}
            <div className="space-y-4">

              {/* Avatar card */}
              <div className="bg-white rounded-2xl border border-line p-5 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-line bg-paper-2">
                    <NextImage
                      src={profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=7c5fe6&color=fff&size=80`}
                      alt="Photo de profil" width={80} height={80} className="object-cover w-full h-full"
                    />
                  </div>
                  {isStudent && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white">
                      <GraduationCap size={11} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="font-bold text-sm text-ink mb-0.5" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>{fullName}</p>
                {profile.city && (
                  <p className="text-xs text-muted flex items-center gap-1 mb-3">
                    <MapPin size={10} /> {profile.city}
                  </p>
                )}
                <label className="flex items-center gap-1.5 px-3.5 py-2 bg-paper-2 hover:bg-line text-ink-2
                                   text-xs font-semibold rounded-xl cursor-pointer transition w-full justify-center">
                  <Upload size={12} /> Changer la photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>

              {/* Type de compte */}
              <div className="bg-white rounded-2xl border border-line p-5">
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Type de compte</h3>
                {isStudent ? (
                  <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Compte étudiant actif</p>
                      <p className="text-[11px] text-emerald-600 mt-0.5">Accès aux missions et au calendrier.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted leading-relaxed">
                      Active ton compte étudiant pour postuler aux missions et gérer tes disponibilités.
                    </p>
                    <button onClick={activateStudentAccount}
                      className="w-full py-2.5 bg-ink hover:bg-ink-2 text-white text-xs font-bold
                                 rounded-xl transition shadow-sm shadow-brand/30">
                      Activer le profil étudiant
                    </button>
                  </div>
                )}
              </div>

              {/* Résumé */}
              <div className="bg-white rounded-2xl border border-line p-5">
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Résumé</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Expériences', value: profile.experiences?.length || 0 },
                    { label: 'Bio', value: profile.bio ? '✓' : '—' },
                    ...(isStudent ? [{ label: 'Jours dispo', value: Object.values(profile.availabilitySchedule || {}).filter((d: any) => d?.enabled).length }] : []),
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted text-xs">{item.label}</span>
                      <span className="font-bold text-brand text-xs">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Main ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Infos générales */}
              <Section title="Informations générales" icon={<User size={14} />}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Prénom">
                      <input className={inputCls} value={profile.firstName || ''} placeholder="Jean"
                        onChange={e => setProfile(p => ({ ...p!, firstName: e.target.value }))} />
                    </Field>
                    <Field label="Nom">
                      <input className={inputCls} value={profile.lastName || ''} placeholder="Dupont"
                        onChange={e => setProfile(p => ({ ...p!, lastName: e.target.value }))} />
                    </Field>
                  </div>
                  <Field label="Ville">
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                      <input className={inputCls + " pl-9"} value={profile.city || ''} placeholder="Louvain-la-Neuve"
                        onChange={e => setProfile(p => ({ ...p!, city: e.target.value }))} />
                    </div>
                  </Field>
                  <Field label="Bio">
                    <textarea className={inputCls + " resize-none"} rows={4}
                      value={profile.bio || ''} placeholder="Parle de toi, tes compétences, ta motivation…"
                      onChange={e => setProfile(p => ({ ...p!, bio: e.target.value }))} />
                    <p className="text-[11px] text-muted mt-1 text-right">{profile.bio?.length || 0} / 500</p>
                  </Field>
                </div>
              </Section>

              {/* Disponibilités — uniquement pour les étudiants */}
              {isStudent && (
                <Section title="Disponibilités" icon={<Calendar size={14} />}>
                  <div className="space-y-2">
                    {days.map(day => {
                      const slots     = profile.availabilitySchedule?.[day]?.slots || [];
                      const isEnabled = profile.availabilitySchedule?.[day]?.enabled || false;
                      return (
                        <div key={day} className="border border-line rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 bg-paper-2">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                              <div className="relative">
                                <input type="checkbox" className="sr-only peer" checked={isEnabled}
                                  onChange={e => setProfile(p => ({
                                    ...p!,
                                    availabilitySchedule: {
                                      ...p!.availabilitySchedule,
                                      [day]: { enabled: e.target.checked, slots: slots.length > 0 ? slots : [{ start: '', end: '' }] }
                                    }
                                  }))} />
                                <div className="w-9 h-5 bg-line peer-checked:bg-ink rounded-full transition
                                                after:content-[''] after:absolute after:top-0.5 after:left-0.5
                                                after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all
                                                peer-checked:after:translate-x-4" />
                              </div>
                              <span className="text-sm font-semibold text-ink">{day}</span>
                            </label>
                            {isEnabled && (
                              <button onClick={() => updateDaySlots(day, [...slots, { start: '', end: '' }])}
                                className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark transition">
                                <Plus size={13} /> Ajouter
                              </button>
                            )}
                          </div>
                          {isEnabled && (
                            <div className="px-4 py-3 space-y-2">
                              {slots.map((slot: any, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input type="time" value={slot.start}
                                    onChange={e => { const s = [...slots]; s[i].start = e.target.value; updateDaySlots(day, s); }}
                                    className="border border-line rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
                                  <span className="text-muted text-sm">→</span>
                                  <input type="time" value={slot.end}
                                    onChange={e => { const s = [...slots]; s[i].end = e.target.value; updateDaySlots(day, s); }}
                                    className="border border-line rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
                                  <button onClick={() => { const s = [...slots]; s.splice(i, 1); updateDaySlots(day, s); }}
                                    className="ml-auto text-muted hover:text-red-500 transition"><X size={14} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              {/* Expériences */}
              <Section title="Expériences professionnelles" icon={<Briefcase size={14} />}>
                <div className="space-y-3">
                  {(profile.experiences || []).map((exp, i) => (
                    <div key={i} className="border border-line rounded-xl p-4 relative group bg-paper-2/50">
                      <button onClick={() => removeExp(i)}
                        className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-white border border-line text-muted
                                   hover:text-red-500 hover:border-red-200 flex items-center justify-center
                                   opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={12} />
                      </button>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Titre du poste">
                            <input className={inputCls} value={exp.title} placeholder="Ex : Tuteur"
                              onChange={e => updateExp(i, 'title', e.target.value)} />
                          </Field>
                          <Field label="Entreprise / Organisation">
                            <input className={inputCls} value={exp.company} placeholder="Ex : UCLouvain"
                              onChange={e => updateExp(i, 'company', e.target.value)} />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Date de début">
                            <input type="month" className={inputCls} value={exp.startDate}
                              onChange={e => updateExp(i, 'startDate', e.target.value)} />
                          </Field>
                          <Field label="Date de fin">
                            <input type="month" className={inputCls} value={exp.endDate}
                              onChange={e => updateExp(i, 'endDate', e.target.value)} />
                          </Field>
                        </div>
                        <Field label="Description">
                          <textarea className={inputCls + " resize-none"} rows={2} value={exp.description}
                            placeholder="Tes missions, réalisations…"
                            onChange={e => updateExp(i, 'description', e.target.value)} />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addExp}
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-line
                             hover:border-brand/50 hover:bg-brand-soft/30 text-muted hover:text-brand
                             rounded-xl text-sm font-semibold transition-all">
                  <Plus size={15} /> Ajouter une expérience
                </button>
              </Section>

              {/* Save bottom */}
              <div className="flex justify-end pb-4">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-ink hover:bg-ink-2 text-white
                             text-sm font-bold rounded-xl transition shadow-sm shadow-brand/30 disabled:opacity-60"
                  style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</> : saved ? <><CheckCircle size={14} /> Enregistré</> : <><Save size={14} /> Enregistrer les modifications</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Crop modal ── */}
        <AnimatePresence>
          {showCropper && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-ink text-base" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>Recadrer la photo</h2>
                  <button onClick={() => { setShowCropper(false); setSelectedImage(null); setRawFile(null); }}
                    className="w-7 h-7 rounded-lg hover:bg-paper-2 text-muted flex items-center justify-center transition">
                    <X size={15} />
                  </button>
                </div>
                <div className="relative w-full h-72 bg-paper-2 rounded-xl overflow-hidden mb-5">
                  <Cropper image={selectedImage!} crop={crop} zoom={zoom} aspect={1}
                    onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                </div>
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted font-medium">Zoom</span>
                    <span className="text-xs text-muted">{zoom.toFixed(1)}×</span>
                  </div>
                  <input type="range" min={1} max={3} step={0.1} value={zoom}
                    onChange={e => setZoom(Number(e.target.value))}
                    className="w-full accent-brand" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowCropper(false); setSelectedImage(null); setRawFile(null); }}
                    className="flex-1 py-2.5 border border-line rounded-xl text-sm font-semibold text-ink-2 hover:bg-paper-2 transition">
                    Annuler
                  </button>
                  <button onClick={handleCropSave}
                    className="flex-1 py-2.5 bg-ink hover:bg-ink-2 text-white rounded-xl text-sm font-bold transition">
                    Enregistrer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}