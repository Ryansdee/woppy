'use client';

import { JSX, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, MapPin, Camera, Calendar,
  Plus, X, Euro, AlertCircle, Check, GraduationCap,
  Building2, Loader2,
} from 'lucide-react';
import { auth, db, storage } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/* ── shared styles ── */
const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition";
const inputWithIconCls = `${inputCls} pl-10`;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}{required && <span className="text-violet-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ── CityField EN DEHORS du composant principal ──
   Défini au niveau du module, pas recréé à chaque render. ── */
interface CityFieldProps {
  value: string;
  onChange: (val: string) => void;
}

function CityField({ value, onChange }: CityFieldProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const containerRef                  = useRef<HTMLDivElement>(null);

  /* Ferme si clic en dehors */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Fetch suggestions */
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=be&addressdetails=1&limit=8`
        );
        const data = await res.json();
        const seen = new Set<string>();
        const cities = data
          .map((s: any) => ({
            ...s,
            _name: s.address?.city || s.address?.town || s.address?.village || s.address?.municipality || s.name,
            _region: s.address?.province || s.address?.state || s.address?.county || '',
          }))
          .filter((s: any) => {
            if (!s._name || seen.has(s._name)) return false;
            seen.add(s._name);
            return true;
          })
          .slice(0, 5);
        setSuggestions(cities);
        if (cities.length > 0) setOpen(true);
      } catch {}
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [value]);

  const select = (s: any) => {
    onChange(s._name || s.display_name);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <Field label="Ville" required>
      <div className="relative" ref={containerRef}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" size={16} />
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); if (e.target.value.length >= 2) setOpen(true); }}
          className={inputWithIconCls + (loading ? ' pr-10' : '')}
          placeholder="Louvain-la-Neuve"
          autoComplete="off"
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400 pointer-events-none" />
        )}
        {open && suggestions.length > 0 && (
          <div className="absolute z-30 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                type="button"
                key={i}
                onClick={() => select(s)}
                className={`w-full text-left px-4 py-2.5 hover:bg-violet-50 transition-colors flex items-center justify-between
                            ${i < suggestions.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <span className="text-sm font-medium text-slate-800">{s._name}</span>
                {s._region && <span className="text-xs text-slate-400 ml-2 shrink-0">{s._region}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </Field>
  );
}

/* ══════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════ */

interface Experience { id: string; title: string; description: string; }
interface TimeSlot   { start: string; end: string; }
interface DayAvail   { enabled: boolean; slots: TimeSlot[]; }
type WeekAvail       = Record<string, DayAvail>;

export default function RegistrationWizard() {
  const [step, setStep]                   = useState<0|1|2|3|4|5>(0);
  const [wantsStudentProfile, setWantsStudentProfile] = useState<boolean | null>(null);
  const [formData, setFormData]           = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', city: '',
    bioGeneral: '', profilePhoto: null as File | null,
  });
  const [studentData, setStudentData]     = useState({
    studies: '', age: '', hourlyRate: '', description: '',
  });
  const days = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const [availability, setAvailability]   = useState<WeekAvail>(() => {
    const b: WeekAvail = {};
    days.forEach(d => { b[d] = { enabled: false, slots: [] }; });
    return b;
  });
  const [experiences, setExperiences]     = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState({ title: '', description: '' });
  const [photoPreview, setPhotoPreview]   = useState<string | null>(null);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleStudentInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setStudentData(s => ({ ...s, [e.target.name]: e.target.value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(f => ({ ...f, profilePhoto: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email ||
        !formData.password || !formData.confirmPassword || !formData.city) {
      setError('Merci de remplir tous les champs obligatoires.'); return false;
    }
    if (!formData.email.includes('@')) { setError('Adresse email invalide.'); return false; }
    if (formData.password.length < 8)  { setError('Le mot de passe doit contenir au moins 8 caractères.'); return false; }
    if (formData.password !== formData.confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return false; }
    return true;
  };

  const goNext = () => { if (step === 1 && !validateStep1()) return; setError(''); setStep(s => (s + 1) as any); };
  const goBack = () => { if (step === 0) return; setStep(s => (s - 1) as any); };

  const animatedWrap = (content: JSX.Element) => (
    <AnimatePresence mode="wait">
      <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>
        {content}
      </motion.div>
    </AnimatePresence>
  );

  const NavButtons = ({ onNext, nextLabel = 'Continuer', isSubmit = false }:
    { onNext?: () => void; nextLabel?: string; isSubmit?: boolean }) => (
    <div className="flex justify-between pt-6 border-t border-slate-100 mt-6">
      {step > 0
        ? <button onClick={goBack} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">Retour</button>
        : <div />
      }
      <button onClick={onNext ?? goNext} disabled={isSubmit && loading}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition disabled:opacity-50 shadow-sm shadow-violet-200">
        {isSubmit && loading
          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Création...</>
          : <>{nextLabel}{isSubmit && <Check size={15} />}</>
        }
      </button>
    </div>
  );

  const StepHeader = ({ title, desc }: { title: string; desc: string }) => (
    <div className="mb-6">
      <h2 className="text-lg font-extrabold text-slate-900 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h2>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );

  /* ══ ÉTAPES ══ */

  const renderStep0 = () => animatedWrap(
    <div className="space-y-5">
      <StepHeader title="Quel est ton profil ?" desc="Choisis comment tu veux utiliser Woppy." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { student: true,  Icon: GraduationCap, title: 'Étudiant',   desc: "Postule aux missions, gagne jusqu'à 18€/h et développe ton réseau." },
          { student: false, Icon: Building2,     title: 'Particulier', desc: "Publie des annonces et trouve de l'aide pour tes missions du quotidien." },
        ].map(({ student, Icon, title, desc }) => (
          <motion.button key={title} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setWantsStudentProfile(student); setStep(1); }}
            className="group relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50/40 transition-all text-left">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${student ? 'bg-violet-100 text-violet-600 group-hover:bg-violet-200' : 'bg-slate-100 text-slate-600 group-hover:bg-violet-100 group-hover:text-violet-600'}`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
            </div>
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-violet-500 transition" />
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => animatedWrap(
    <div className="space-y-5">
      <StepHeader title="Informations générales" desc="Ces informations sont nécessaires pour créer ton compte." />

      <Field label="Photo de profil" required={wantsStudentProfile === true}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
            {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" alt="preview" /> : <Camera className="text-slate-400" size={22} />}
          </div>
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl cursor-pointer transition">
              <Camera size={14} /> Choisir une photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
            <p className="text-xs text-slate-400 mt-1.5">
              {wantsStudentProfile ? 'Obligatoire — améliore ta visibilité auprès des clients.' : "Optionnelle — tu pourras l'ajouter plus tard depuis ton profil."}
            </p>
          </div>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Prénom" required>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input name="firstName" value={formData.firstName} onChange={handleInput} className={inputWithIconCls} placeholder="Jean" />
          </div>
        </Field>
        <Field label="Nom" required>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input name="lastName" value={formData.lastName} onChange={handleInput} className={inputWithIconCls} placeholder="Dupont" />
          </div>
        </Field>
      </div>

      <Field label="Email" required>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input name="email" type="email" value={formData.email} onChange={handleInput} className={inputWithIconCls} placeholder="jean@example.com" />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Mot de passe" required>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input name="password" type="password" value={formData.password} onChange={handleInput} className={inputWithIconCls} placeholder="••••••••" />
          </div>
        </Field>
        <Field label="Confirmer" required>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInput} className={inputWithIconCls} placeholder="••••••••" />
          </div>
        </Field>
      </div>

      {/* ✅ CityField stable — défini hors du composant parent */}
      <CityField
        value={formData.city}
        onChange={(val) => setFormData(f => ({ ...f, city: val }))}
      />

      <Field label="Courte bio">
        <textarea name="bioGeneral" value={formData.bioGeneral} onChange={handleInput} rows={3} className={inputCls} placeholder="Parle de toi en quelques mots..." />
      </Field>

      <NavButtons />
    </div>
  );

  const renderStep2 = () => animatedWrap(
    <div className="space-y-5">
      <StepHeader title="Profil étudiant" desc="Ces informations aident les particuliers à mieux te connaître." />
      <Field label="Études" required>
        <input name="studies" value={studentData.studies} onChange={handleStudentInput} className={inputCls} placeholder="Ex : Bachelier en communication" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Âge" required>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input name="age" type="number" value={studentData.age} onChange={handleStudentInput} className={inputWithIconCls} placeholder="20" />
          </div>
        </Field>
        <Field label="Tarif souhaité (€/h)">
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input name="hourlyRate" type="number" step="0.5" min={0} max={100} value={studentData.hourlyRate} onChange={handleStudentInput} className={inputWithIconCls} placeholder="15.00" />
          </div>
        </Field>
      </div>
      <Field label="Description du profil">
        <textarea name="description" value={studentData.description} onChange={handleStudentInput} rows={4} className={inputCls} placeholder="Parle de tes compétences, tes études, ton expérience..." />
      </Field>
      <NavButtons />
    </div>
  );

  const addSlot    = (day: string) => { const u = { ...availability }; u[day].slots.push({ start: '', end: '' }); setAvailability(u); };
  const updateSlot = (day: string, i: number, field: keyof TimeSlot, value: string) => { const u = { ...availability }; u[day].slots[i][field] = value; setAvailability(u); };
  const removeSlot = (day: string, i: number) => { const u = { ...availability }; u[day].slots.splice(i, 1); setAvailability(u); };

  const renderStep3 = () => animatedWrap(
    <div className="space-y-4">
      <StepHeader title="Disponibilités" desc="Active les jours où tu es disponible et ajoute tes créneaux." />
      {days.map((day) => (
        <div key={day} className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 bg-slate-50">
            <span className="text-sm font-semibold text-slate-800">{day}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={availability[day].enabled}
                onChange={(e) => { const u = { ...availability }; u[day].enabled = e.target.checked; setAvailability(u); }} />
              <div className="w-9 h-5 bg-slate-200 peer-checked:bg-violet-600 rounded-full transition
                              after:content-[''] after:absolute after:top-0.5 after:left-0.5
                              after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
          {availability[day].enabled && (
            <div className="px-4 py-3 space-y-3">
              {availability[day].slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="time" value={slot.start} onChange={(e) => updateSlot(day, i, 'start', e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                  <span className="text-slate-400 text-sm">→</span>
                  <input type="time" value={slot.end} onChange={(e) => updateSlot(day, i, 'end', e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                  <button onClick={() => removeSlot(day, i)} className="ml-auto text-slate-400 hover:text-red-500 transition"><X size={16} /></button>
                </div>
              ))}
              <button onClick={() => addSlot(day)} className="flex items-center gap-1.5 text-violet-600 text-sm font-semibold hover:text-violet-700 transition">
                <Plus size={15} /> Ajouter un créneau
              </button>
            </div>
          )}
        </div>
      ))}
      <NavButtons />
    </div>
  );

  const renderStep4 = () => animatedWrap(
    <div className="space-y-5">
      <StepHeader title="Expériences" desc="Ajoute tes expériences pertinentes (optionnel)." />
      {experiences.length > 0 && (
        <div className="space-y-2">
          {experiences.map((exp) => (
            <div key={exp.id} className="flex justify-between items-start bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{exp.title}</p>
                {exp.description && <p className="text-xs text-slate-500 mt-0.5">{exp.description}</p>}
              </div>
              <button onClick={() => setExperiences(e => e.filter(ex => ex.id !== exp.id))} className="text-slate-400 hover:text-red-500 transition ml-3 shrink-0"><X size={15} /></button>
            </div>
          ))}
        </div>
      )}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <input type="text" value={newExperience.title} onChange={(e) => setNewExperience(n => ({ ...n, title: e.target.value }))} className={inputCls} placeholder="Titre de l'expérience" />
        <textarea rows={2} value={newExperience.description} onChange={(e) => setNewExperience(n => ({ ...n, description: e.target.value }))} className={inputCls} placeholder="Description (optionnel)" />
        <button onClick={() => { if (!newExperience.title.trim()) return; setExperiences(e => [...e, { id: Date.now().toString(), ...newExperience }]); setNewExperience({ title: '', description: '' }); }}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-xl transition">
          <Plus size={15} /> Ajouter
        </button>
      </div>
      <NavButtons />
    </div>
  );

  const renderStep5 = () => animatedWrap(
    <div className="space-y-5">
      <StepHeader title="Dernière étape" desc="Un mot pour te présenter aux particuliers qui consultent ton profil." />
      <Field label="Bio étudiante">
        <textarea name="bioStudent" value={(studentData as any).bioStudent || ''}
          onChange={(e) => setStudentData(s => ({ ...s, bioStudent: e.target.value } as any))}
          rows={4} className={inputCls} placeholder="Explique ce que tu recherches, tes atouts, ta motivation..." />
      </Field>
      <NavButtons onNext={handleSubmitFinal} nextLabel="Créer mon compte" isSubmit />
    </div>
  );

  const handleSubmitFinal = async () => {
    setError(''); setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCred.user;
      let photoURL = '';
      if (formData.profilePhoto) {
        const r = ref(storage, `profilePhotos/${user.uid}/${formData.profilePhoto.name}`);
        await uploadBytes(r, formData.profilePhoto);
        photoURL = await getDownloadURL(r);
        await updateProfile(user, { displayName: `${formData.firstName} ${formData.lastName}`, photoURL });
      }
      const base = { uid: user.uid, firstName: formData.firstName, lastName: formData.lastName, email: formData.email, city: formData.city, bio: formData.bioGeneral, photoURL, createdAt: serverTimestamp() };
      const finalDoc = wantsStudentProfile
        ? { ...base, hasStudentProfile: true, studentProfile: { studies: studentData.studies, age: studentData.age, hourlyRate: studentData.hourlyRate, description: studentData.description, availability, experiences, bio: (studentData as any).bioStudent || '', isComplete: true } }
        : { ...base, hasStudentProfile: false };
      await setDoc(doc(db, 'users', user.uid), finalDoc);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.code === 'auth/email-already-in-use' ? 'Cette adresse email est déjà utilisée.' : "Une erreur est survenue lors de l'inscription.");
    } finally { setLoading(false); }
  };

  const stepTitlesStudent    = ['Profil', 'Infos', 'Étudiant', 'Dispos', 'Expériences', 'Bio'];
  const stepTitlesNonStudent = ['Profil', 'Infos', 'Finalisation'];
  const titles = wantsStudentProfile ? stepTitlesStudent : stepTitlesNonStudent;
  const progress = titles.length > 1 ? (step / (titles.length - 1)) * 100 : 0;

  const renderCurrentStep = () => {
    if (step === 0) return renderStep0();
    if (step === 1) return renderStep1();
    if (!wantsStudentProfile) return animatedWrap(
      <div className="space-y-5">
        <div className="flex items-start gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><Check size={20} /></div>
          <div>
            <h2 className="font-bold text-slate-900 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Tout est prêt !</h2>
            <p className="text-sm text-slate-600">Tes informations sont complètes. Tu pourras ajouter un profil étudiant à tout moment depuis ton tableau de bord.</p>
          </div>
        </div>
        <NavButtons onNext={handleSubmitFinal} nextLabel="Créer mon compte" isSubmit />
      </div>
    );
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    if (step === 4) return renderStep4();
    if (step === 5) return renderStep5();
    return null;
  };

  return (
    <div className="w-full text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div className="mb-8">
        <div className="h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
          <motion.div className="h-full bg-violet-600 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
        </div>
        <div className="flex items-start justify-between">
          {titles.map((title, i) => (
            <div key={i} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
              <motion.div animate={step === i ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.35 }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors
                  ${step > i ? 'bg-violet-600 text-white' : step === i ? 'bg-violet-600 text-white ring-4 ring-violet-100' : 'bg-slate-100 text-slate-400'}`}>
                {step > i ? <Check size={12} /> : i + 1}
              </motion.div>
              <span className={`text-[11px] font-medium text-center ${step >= i ? 'text-slate-700' : 'text-slate-400'}`}>{title}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={17} />
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {renderCurrentStep()}

      <p className="text-center text-sm text-slate-500 mt-8">
        Tu as déjà un compte ?{' '}
        <Link href="/auth/login" className="text-violet-600 hover:text-violet-700 font-semibold">Se connecter</Link>
      </p>
    </div>
  );
}