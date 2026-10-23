'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { getDocs, query, collection, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowLeft, Star, CheckCircle, AlertCircle, Briefcase, ChevronDown, User, MapPin } from 'lucide-react';

const LABELS = ['Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'];

interface Annonce {
  id: string;
  titre: string;
  lieu: string;
  statut: string;
  remuneration: number;
  date: string;
}

export default function ReviewsPage() {
  const router = useRouter();

  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [rating, setRating]           = useState(0);
  const [hovered, setHovered]         = useState(0);
  const [comment, setComment]         = useState('');
  const [website, setWebsite]         = useState(''); // honeypot anti-bot
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [annonces, setAnnonces]       = useState<Annonce[]>([]);
  const [loadingAnnonces, setLoadingAnnonces] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, 'annonces'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const list: Annonce[] = snap.docs
          .filter((d) => d.data().statut === 'fini')
          .map((d) => ({
          id: d.id,
          titre: d.data().titre || 'Mission sans titre',
          lieu: d.data().lieu || '',
          statut: d.data().statut || 'ouverte',
          remuneration: d.data().remuneration || 0,
          date: d.data().date || '',
        }));
        setAnnonces(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAnnonces(false);
      }
    })();
  }, []);

  async function handleSubmit() {
    setError(null);
    if (!firstName.trim()) { setError('Veuillez saisir votre prénom.'); return; }
    if (!lastName.trim())  { setError('Veuillez saisir votre nom.'); return; }
    if (!selectedJob)      { setError('Veuillez sélectionner une mission.'); return; }
    if (!rating)           { setError('Veuillez sélectionner une note.'); return; }
    if (comment.trim().length < 10) { setError('Votre commentaire doit faire au moins 10 caractères.'); return; }

    setSubmitting(true);
    try {
      const job = annonces.find((a) => a.id === selectedJob);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'public',
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          annonceId: selectedJob,
          annonceTitre: job?.titre || '',
          annonceLieu: job?.lieu || '',
          website,
          rating,
          comment: comment.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur serveur');
      }
      setSubmitted(true);
      setTimeout(() => router.push('/jobs'), 3000);
    } catch (err: any) {
      console.error(err);
      setError("Impossible d'envoyer l'évaluation. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  const active       = hovered || rating;
  const selectedAnn  = annonces.find((a) => a.id === selectedJob);

  /* ── Success ── */
  if (submitted) return (
    <>
      <style>{`
        
        body { background: #ffffff !important; margin: 0; }
        @keyframes pop { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes progress { from{width:0} to{width:100%} }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: 24, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'pop 0.4s ease' }}>
          <CheckCircle style={{ width: 30, height: 30, color: '#22c55e' }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-bricolage),system-ui", fontWeight: 800, fontSize: 22, color: '#111118', marginBottom: 8 }}>Avis envoyé !</h2>
        <p style={{ fontSize: 14, color: '#6b6b78', lineHeight: 1.6 }}>Merci {firstName} pour votre avis. Redirection en cours…</p>
        <div style={{ marginTop: 24, width: 180, height: 3, borderRadius: 9, background: '#f6f6f8', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#7357f6', borderRadius: 9, animation: 'progress 2.8s linear forwards' }} />
        </div>
      </div>
    </>
  );

  /* ── Main ── */
  return (
    <>
      <style>{`
        
        body { background: #ffffff !important; margin: 0; }
        * { box-sizing: border-box; font-family: 'DM Sans', system-ui; }
        h1, h2 { font-family: var(--font-bricolage),system-ui; }
        input:focus, textarea:focus { border-color: #7357f6 !important; box-shadow: 0 0 0 3px rgba(138,107,254,0.11) !important; }
        .back-link { transition: color 0.12s; }
        .back-link:hover { color: #7357f6 !important; }
        .star { transition: transform 0.1s; cursor: pointer; }
        .star:hover { transform: scale(1.15); }
        .submit-btn { transition: background 0.15s, box-shadow 0.15s, transform 0.15s; }
        .submit-btn:hover:not(:disabled) { background: #7357f6 !important; box-shadow: 0 8px 24px rgba(138,107,254,0.3) !important; transform: translateY(-1px); }
        .job-option:hover { background: #f1eeff !important; }
        .job-option.selected { background: #f1eeff !important; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes dropdown { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#ffffff', padding: '40px 16px 80px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>

          {/* Back */}
          <Link href="/jobs" className="back-link" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: '#6b6b78',
            textDecoration: 'none', marginBottom: 28,
          }}>
            <ArrowLeft style={{ width: 13, height: 13 }} /> Retour aux missions
          </Link>

          {/* Card */}
          <div style={{ background: '#fff', border: '1px solid #f6f6f8', borderRadius: 22, overflow: 'visible', animation: 'fadeUp 0.25s ease' }}>

            {/* Header */}
            <div style={{ padding: '26px 28px 22px', borderBottom: '1px solid #f6f6f8', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f1eeff', border: '1px solid #d9d0fd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Star style={{ width: 22, height: 22, color: '#7357f6' }} />
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6b78', marginBottom: 6 }}>
                Donner un avis
              </p>
              <h1 style={{ fontFamily: "var(--font-bricolage),system-ui", fontWeight: 800, fontSize: 20, color: '#111118', letterSpacing: '-0.02em', marginBottom: 4 }}>
                Votre évaluation
              </h1>
              <p style={{ fontSize: 13, color: '#6b6b78' }}>Partagez votre expérience sur une mission</p>
            </div>

            {/* Name fields */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f6f6f8' }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6b78', marginBottom: 14 }}>
                Vos informations
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Prénom */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b6b78', marginBottom: 6 }}>
                    Prénom *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#6b6b78' }} />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jean"
                      style={{
                        width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
                        borderRadius: 10, border: '1px solid #e6e6eb', background: '#ffffff',
                        fontSize: 14, color: '#111118', outline: 'none', transition: 'border-color 0.15s',
                      }}
                    />
                  </div>
                </div>
                {/* Nom */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b6b78', marginBottom: 6 }}>
                    Nom *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#6b6b78' }} />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      style={{
                        width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
                        borderRadius: 10, border: '1px solid #e6e6eb', background: '#ffffff',
                        fontSize: 14, color: '#111118', outline: 'none', transition: 'border-color 0.15s',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Job selector */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f6f6f8', position: 'relative' }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6b78', marginBottom: 14 }}>
                Mission concernée *
              </p>

              {loadingAnnonces ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: '1px solid #e6e6eb', background: '#ffffff' }}>
                  <div style={{ width: 14, height: 14, border: '2px solid #e6e6eb', borderTopColor: '#7357f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#6b6b78' }}>Chargement des missions…</span>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                      padding: '11px 14px', borderRadius: 12, border: `1px solid ${dropdownOpen ? '#7357f6' : '#e6e6eb'}`,
                      background: '#ffffff', cursor: 'pointer', textAlign: 'left',
                      boxShadow: dropdownOpen ? '0 0 0 3px rgba(138,107,254,0.11)' : 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                      <Briefcase style={{ width: 14, height: 14, color: selectedAnn ? '#7357f6' : '#6b6b78', flexShrink: 0 }} />
                      {selectedAnn ? (
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111118', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {selectedAnn.titre}
                          </span>
                          {selectedAnn.lieu && (
                            <span style={{ fontSize: 11, color: '#6b6b78', display: 'block' }}>{selectedAnn.lieu}</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: '#6b6b78' }}>Sélectionner une mission…</span>
                      )}
                    </div>
                    <ChevronDown style={{ width: 14, height: 14, color: '#6b6b78', flexShrink: 0, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                  </button>

                  {/* Dropdown list */}
                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                      background: '#fff', border: '1px solid #f6f6f8', borderRadius: 14,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 50,
                      maxHeight: 260, overflowY: 'auto',
                      animation: 'dropdown 0.15s ease',
                    }}>
                      {annonces.length === 0 ? (
                        <div style={{ padding: '16px', fontSize: 13, color: '#6b6b78', textAlign: 'center' }}>
                          Aucune mission disponible
                        </div>
                      ) : (
                        annonces.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className={`job-option${a.id === selectedJob ? ' selected' : ''}`}
                            onClick={() => { setSelectedJob(a.id); setDropdownOpen(false); }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                              padding: '11px 14px', background: a.id === selectedJob ? '#f1eeff' : '#fff',
                              border: 'none', borderBottom: '1px solid #ffffff', cursor: 'pointer', textAlign: 'left',
                              transition: 'background 0.1s',
                            }}
                          >
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#f1eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Briefcase style={{ width: 13, height: 13, color: '#7357f6' }} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#111118', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {a.titre}
                              </div>
                              {a.lieu && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                  <MapPin style={{ width: 10, height: 10, color: '#6b6b78', flexShrink: 0 }} />
                                  <span style={{ fontSize: 11, color: '#6b6b78' }}>{a.lieu}</span>
                                </div>
                              )}
                            </div>
                            {a.remuneration > 0 && (
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#7357f6', flexShrink: 0 }}>
                                {a.remuneration}€/h
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rating */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f6f6f8' }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6b78', marginBottom: 16, textAlign: 'center' }}>
                Votre note *
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" className="star"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    style={{ background: 'none', border: 'none', padding: 2 }}>
                    <Star
                      style={{ width: 34, height: 34, transition: 'color 0.1s, fill 0.1s' }}
                      fill={n <= active ? '#f59e0b' : 'none'}
                      stroke={n <= active ? '#f59e0b' : '#e6e6eb'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', height: 20 }}>
                {active > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>
                    {LABELS[active - 1]}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div style={{ padding: '22px 28px', borderBottom: '1px solid #f6f6f8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6b78' }}>
                  Commentaire *
                </p>
                <span style={{ fontSize: 10, color: '#6b6b78', fontFamily: "'DM Mono', monospace" }}>
                  {comment.length} / 500
                </span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="Décrivez votre expérience sur cette mission…"
                rows={5}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1px solid #e6e6eb', background: '#ffffff',
                  fontSize: 14, color: '#111118', outline: 'none',
                  resize: 'none', lineHeight: 1.65, transition: 'border-color 0.15s',
                }}
              />
                            {/* Honeypot : invisible pour les humains, rempli par les bots */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ margin: '0 28px', marginTop: 16, padding: '10px 14px', borderRadius: 10, background: '#fff5f5', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle style={{ width: 13, height: 13, color: '#ef4444', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <div style={{ padding: '20px 28px' }}>
              <button
                type="button"
                onClick={handleSubmit}
                className="submit-btn"
                disabled={submitting}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                  background: '#7357f6',
                  color: '#fff',
                  fontFamily: "var(--font-bricolage),system-ui", fontWeight: 700, fontSize: 15,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(138,107,254,0.25)',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'all 0.15s',
                }}>
                {submitting
                  ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Envoi…</>
                  : <><Star style={{ width: 15, height: 15 }} fill="#fff" /> Envoyer mon avis</>
                }
              </button>
              <p style={{ fontSize: 11, color: '#6b6b78', textAlign: 'center', marginTop: 12 }}>
                Votre avis sera associé à la mission sélectionnée.
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
