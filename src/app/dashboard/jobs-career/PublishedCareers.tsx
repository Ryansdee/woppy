'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, Timestamp } from 'firebase/firestore';
import { Eye, EyeOff, ExternalLink, Loader2, MapPin, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';

type Career = {
  id: string;
  title: string;
  location: string;
  type: string;
  active: boolean;
  createdAt?: Timestamp;
};

/* Offres déjà publiées sur /careers, avec masquage et suppression */
export default function PublishedCareers() {
  const [careers, setCareers] = useState<Career[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'careers'), orderBy('createdAt', 'desc')),
      (snap) => setCareers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Career, 'id'>) }))),
      () => {
        setCareers([]);
        setError('Impossible de charger les offres.');
      }
    );
  }, []);

  const act = async (id: string, action: () => Promise<void>) => {
    setBusy(id);
    setError('');
    try {
      await action();
    } catch {
      setError('L’action a échoué. Vérifiez vos droits et réessayez.');
    } finally {
      setBusy(null);
    }
  };

  const toggle = (c: Career) => act(c.id, () => updateDoc(doc(db, 'careers', c.id), { active: !c.active }));
  const remove = (c: Career) => {
    if (!confirm(`Supprimer définitivement l’offre « ${c.title} » ?`)) return;
    act(c.id, () => deleteDoc(doc(db, 'careers', c.id)));
  };

  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <h2 className="display text-2xl">Offres publiées</h2>
        <Link href="/careers" target="_blank" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          Voir /careers <ExternalLink size={13} />
        </Link>
      </div>

      {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="card mt-4 divide-y divide-line">
        {careers === null && (
          <p className="flex items-center gap-2 p-5 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Chargement…
          </p>
        )}
        {careers?.length === 0 && <p className="p-5 text-sm text-muted">Aucune offre pour l’instant.</p>}
        {careers?.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <Link href={`/careers/${c.id}`} target="_blank" className="font-semibold hover:underline">
                {c.title}
              </Link>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted">
                <span>{c.type}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={12} /> {c.location}</span>
                {c.createdAt && <span>{c.createdAt.toDate().toLocaleDateString('fr-BE')}</span>}
              </p>
            </div>
            <span className={`chip ${c.active ? '!border-green-200 !bg-green-50 !text-green-700' : ''}`}>
              {c.active ? 'En ligne' : 'Masquée'}
            </span>
            <button disabled={busy === c.id} onClick={() => toggle(c)} className="btn btn-outline">
              {c.active ? <EyeOff size={15} /> : <Eye size={15} />} {c.active ? 'Masquer' : 'Publier'}
            </button>
            <button
              disabled={busy === c.id}
              onClick={() => remove(c)}
              aria-label={`Supprimer ${c.title}`}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:border-danger hover:text-danger"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
