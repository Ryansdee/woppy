'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CheckCircle2, ExternalLink, GraduationCap, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Alert, Avatar, Loading, Page, PageHeader, Section } from '@/components/ui';

/* ── types ── */
interface Experience { title: string; company: string; startDate: string; endDate: string; description: string }
type Slot = { start: string; end: string };
type Schedule = Record<string, { enabled: boolean; slots: Slot[] }>;
interface UserProfile {
  availabilitySchedule?: Schedule;
  experiences?: Experience[];
  firstName?: string; lastName?: string;
  bio?: string; city?: string; photoURL?: string;
  hasStudentProfile?: boolean;
}
type CroppedArea = { x: number; y: number; width: number; height: number };

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const BIO_MAX = 500;

/* ── recadrage ── */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}
async function getCroppedImage(imageSrc: string, c: CroppedArea) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');
  canvas.width = c.width;
  canvas.height = c.height;
  ctx.drawImage(image, c.x, c.y, c.width, c.height, 0, 0, c.width, c.height);
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Image vide'))), 'image/jpeg'));
}

export default function DashboardProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<CroppedArea | null>(null);
  const [uploading, setUploading] = useState(false);
  const onCropComplete = useCallback((_: unknown, c: CroppedArea) => setCroppedArea(c), []);

  useEffect(() => onAuthStateChanged(auth, (u) => (u ? setUser(u) : router.push('/auth/login'))), [router]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => setProfile((snap.data() as UserProfile) ?? {}))
      .catch(() => setProfile({}))
      .finally(() => setLoading(false));
  }, [user]);

  const patch = (p: Partial<UserProfile>) => setProfile((prev) => ({ ...prev, ...p }));

  /* N'enregistre que les champs modifiables depuis cette page */
  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    setNotice(null);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        city: profile.city ?? '',
        bio: (profile.bio ?? '').slice(0, BIO_MAX),
        experiences: profile.experiences ?? [],
        availabilitySchedule: profile.availabilitySchedule ?? {},
        updatedAt: serverTimestamp(),
      });
      setNotice({ tone: 'success', text: 'Profil enregistré.' });
    } catch {
      setNotice({ tone: 'danger', text: 'Le profil n’a pas pu être enregistré. Réessayez.' });
    } finally {
      setSaving(false);
    }
  };

  /* Active le profil étudiant, sans se déclarer « vérifié » */
  const activateStudent = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { hasStudentProfile: true, updatedAt: serverTimestamp() });
      patch({ hasStudentProfile: true });
    } catch {
      setNotice({ tone: 'danger', text: 'Le profil étudiant n’a pas pu être activé.' });
    }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
    e.target.value = '';
  };

  const saveCrop = async () => {
    if (!selectedImage || !user || !croppedArea) return;
    setUploading(true);
    try {
      const blob = await getCroppedImage(selectedImage, croppedArea);
      const r = ref(storage, `profilePhotos/${user.uid}/profile.jpg`);
      await uploadBytes(r, blob);
      const url = await getDownloadURL(r);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url, updatedAt: serverTimestamp() });
      patch({ photoURL: url });
      setSelectedImage(null);
    } catch {
      setNotice({ tone: 'danger', text: 'La photo n’a pas pu être envoyée.' });
    } finally {
      setUploading(false);
    }
  };

  const experiences = profile?.experiences ?? [];
  const setExperience = (i: number, field: keyof Experience, value: string) =>
    patch({ experiences: experiences.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)) });

  const schedule = profile?.availabilitySchedule ?? {};
  const setDay = (day: string, value: { enabled: boolean; slots: Slot[] }) => patch({ availabilitySchedule: { ...schedule, [day]: value } });

  if (loading || !profile) return <Loading full />;

  const isStudent = profile.hasStudentProfile === true;
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Mon profil';

  const saveButton = (
    <button onClick={handleSave} disabled={saving} className="btn btn-primary">
      {saving && <Loader2 size={15} className="animate-spin" />} Enregistrer
    </button>
  );

  return (
    <Page>
      <PageHeader
        title="Mon profil"
        description="Ces informations sont visibles sur votre profil public."
        actions={
          <>
            {user && (
              <Link href={`/profile/${user.uid}`} className="btn btn-outline">
                <ExternalLink size={15} /> Voir mon profil public
              </Link>
            )}
            {saveButton}
          </>
        }
      />

      {notice && <div className="mb-6"><Alert tone={notice.tone}>{notice.text}</Alert></div>}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="card flex flex-col items-center p-6 text-center">
            <Avatar name={fullName} src={profile.photoURL} size={80} />
            <p className="mt-4 font-semibold">{fullName}</p>
            {profile.city && <p className="text-sm text-muted">{profile.city}</p>}
            <label className="btn btn-outline btn-sm mt-4 cursor-pointer">
              <Upload size={14} /> Changer la photo
              <input type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
            </label>
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold">Profil étudiant</p>
            {isStudent ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-success">
                <CheckCircle2 size={16} /> Actif : vous pouvez postuler.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted">Activez-le pour postuler aux missions et indiquer vos disponibilités.</p>
                <button onClick={activateStudent} className="btn btn-primary btn-sm mt-4 w-full">
                  <GraduationCap size={15} /> Activer
                </button>
              </>
            )}
          </div>
        </aside>

        <div className="space-y-6">
          <Section title="Informations générales">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="label">Prénom</label>
                <input id="firstName" className="input" value={profile.firstName ?? ''} onChange={(e) => patch({ firstName: e.target.value })} />
              </div>
              <div>
                <label htmlFor="lastName" className="label">Nom</label>
                <input id="lastName" className="input" value={profile.lastName ?? ''} onChange={(e) => patch({ lastName: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="city" className="label">Ville</label>
                <input id="city" className="input" value={profile.city ?? ''} placeholder="Wavre" onChange={(e) => patch({ city: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bio" className="label">Bio</label>
                <textarea id="bio" className="input resize-y" rows={4} maxLength={BIO_MAX} value={profile.bio ?? ''}
                  placeholder="Présentez-vous en quelques lignes." onChange={(e) => patch({ bio: e.target.value })} />
                <p className="mt-1 text-right text-xs text-muted">{(profile.bio ?? '').length} / {BIO_MAX}</p>
              </div>
            </div>
          </Section>

          {isStudent && (
            <Section title="Disponibilités" description="Indiquez les jours et créneaux où vous êtes disponible.">
              <div className="divide-y divide-line">
                {DAYS.map((day) => {
                  const d = schedule[day] ?? { enabled: false, slots: [] };
                  return (
                    <div key={day} className="flex flex-wrap items-start gap-4 py-3 first:pt-0 last:pb-0">
                      <label className="flex w-32 cursor-pointer items-center gap-2.5 pt-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-brand"
                          checked={d.enabled}
                          onChange={(e) => setDay(day, { enabled: e.target.checked, slots: d.slots.length ? d.slots : [{ start: '', end: '' }] })}
                        />
                        {day}
                      </label>
                      {d.enabled ? (
                        <div className="flex-1 space-y-2">
                          {d.slots.map((slot, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="time" aria-label="Début" className="input w-auto" value={slot.start}
                                onChange={(e) => setDay(day, { ...d, slots: d.slots.map((s, j) => (j === i ? { ...s, start: e.target.value } : s)) })} />
                              <span className="text-muted">–</span>
                              <input type="time" aria-label="Fin" className="input w-auto" value={slot.end}
                                onChange={(e) => setDay(day, { ...d, slots: d.slots.map((s, j) => (j === i ? { ...s, end: e.target.value } : s)) })} />
                              <button onClick={() => setDay(day, { ...d, slots: d.slots.filter((_, j) => j !== i) })}
                                aria-label="Retirer le créneau" className="btn btn-ghost btn-sm">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => setDay(day, { ...d, slots: [...d.slots, { start: '', end: '' }] })} className="btn btn-ghost btn-sm">
                            <Plus size={14} /> Ajouter un créneau
                          </button>
                        </div>
                      ) : (
                        <p className="pt-2 text-sm text-muted">Indisponible</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          <Section
            title="Expériences"
            actions={
              <button onClick={() => patch({ experiences: [...experiences, { title: '', company: '', startDate: '', endDate: '', description: '' }] })} className="btn btn-outline btn-sm">
                <Plus size={14} /> Ajouter
              </button>
            }
          >
            {experiences.length === 0 ? (
              <p className="text-sm text-muted">Aucune expérience pour l’instant.</p>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp, i) => (
                  <div key={i} className="rounded-lg border border-line p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="label" htmlFor={`exp-title-${i}`}>Poste</label>
                        <input id={`exp-title-${i}`} className="input" value={exp.title} placeholder="Tuteur" onChange={(e) => setExperience(i, 'title', e.target.value)} />
                      </div>
                      <div>
                        <label className="label" htmlFor={`exp-company-${i}`}>Organisation</label>
                        <input id={`exp-company-${i}`} className="input" value={exp.company} onChange={(e) => setExperience(i, 'company', e.target.value)} />
                      </div>
                      <div>
                        <label className="label" htmlFor={`exp-start-${i}`}>Début</label>
                        <input id={`exp-start-${i}`} type="month" className="input" value={exp.startDate} onChange={(e) => setExperience(i, 'startDate', e.target.value)} />
                      </div>
                      <div>
                        <label className="label" htmlFor={`exp-end-${i}`}>Fin</label>
                        <input id={`exp-end-${i}`} type="month" className="input" value={exp.endDate} onChange={(e) => setExperience(i, 'endDate', e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label" htmlFor={`exp-desc-${i}`}>Description</label>
                        <textarea id={`exp-desc-${i}`} className="input resize-y" rows={2} value={exp.description} onChange={(e) => setExperience(i, 'description', e.target.value)} />
                      </div>
                    </div>
                    <button onClick={() => patch({ experiences: experiences.filter((_, j) => j !== i) })} className="btn btn-ghost btn-sm mt-3 !text-danger">
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <div className="flex justify-end">{saveButton}</div>
        </div>
      </div>

      {/* ── Recadrage de la photo ── */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-label="Recadrer la photo">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recadrer la photo</h2>
              <button onClick={() => setSelectedImage(null)} aria-label="Fermer" className="btn btn-ghost btn-sm"><X size={16} /></button>
            </div>
            <div className="relative mt-4 h-72 overflow-hidden rounded-lg bg-paper-2">
              <Cropper image={selectedImage} crop={crop} zoom={zoom} aspect={1} cropShape="round"
                onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <label htmlFor="zoom" className="label mt-4">Zoom</label>
            <input id="zoom" type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-brand" />
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setSelectedImage(null)} className="btn btn-outline">Annuler</button>
              <button onClick={saveCrop} disabled={uploading} className="btn btn-primary">
                {uploading && <Loader2 size={15} className="animate-spin" />} Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
