'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowLeft, Star, CheckCircle, AlertCircle, User } from 'lucide-react';

const LABELS = ['Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'];

export default function ReviewPage() {
  const { userId }    = useParams();
  const searchParams  = useSearchParams();
  const annonceId     = searchParams.get('annonceId');
  const router        = useRouter();

  const [user, setUser]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [target, setTarget]       = useState<any>(null);
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [comment, setComment]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/auth/login');
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', userId as string));
        if (snap.exists()) setTarget(snap.data());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  async function handleSubmit() {
    setError(null);
    if (!rating) { setError("Veuillez sélectionner une note."); return; }
    if (!comment.trim()) { setError("Veuillez écrire un commentaire."); return; }
    if (!annonceId) { setError("Identifiant de mission manquant."); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        annonceId,
        reviewerId: user.uid,
        reviewedId: userId,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setTimeout(() => router.push('/jobs'), 2800);
    } catch (err) {
      console.error(err);
      setError("Impossible d'envoyer l'évaluation. Vérifiez vos permissions.");
    } finally {
      setSubmitting(false);
    }
  }

  const active = hovered || rating;

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #e6e6eb", borderTopColor: "#7357f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Not found ── */
  if (!target) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#ffffff", padding: 24, gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: "#fff5f5", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AlertCircle style={{ width: 22, height: 22, color: "#ef4444" }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#111118", fontFamily: "var(--font-bricolage),system-ui" }}>Utilisateur introuvable</p>
      <Link href="/jobs" style={{ fontSize: 13, fontWeight: 600, color: "#7357f6", textDecoration: "none" }}>← Retour aux missions</Link>
    </div>
  );

  /* ── Success ── */
  if (submitted) return (
    <>
      <style>{`
        
        body { background: #ffffff !important; margin: 0; }
        @keyframes pop { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
      `}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#ffffff", padding: 24, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, animation: "pop 0.4s ease" }}>
          <CheckCircle style={{ width: 30, height: 30, color: "#22c55e" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-bricolage),system-ui", fontWeight: 800, fontSize: 22, color: "#111118", marginBottom: 8 }}>Évaluation envoyée !</h2>
        <p style={{ fontSize: 14, color: "#6b6b78", lineHeight: 1.6 }}>Merci d'avoir partagé votre avis. Redirection en cours…</p>
        <div style={{ marginTop: 24, width: 180, height: 3, borderRadius: 9, background: "#f6f6f8", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#7357f6", borderRadius: 9, animation: "progress 2.6s linear forwards" }} />
        </div>
        <style>{`@keyframes progress{from{width:0}to{width:100%}}`}</style>
      </div>
    </>
  );

  /* ── Main ── */
  return (
    <>
      <style>{`
        
        body { background: #ffffff !important; margin: 0; }
        * { box-sizing: border-box; font-family: 'DM Sans', system-ui; }
        h1,h2 { font-family: var(--font-bricolage),system-ui; }
        textarea:focus { border-color: #7357f6 !important; box-shadow: 0 0 0 3px rgba(138,107,254,0.11) !important; }
        .back-link { transition: color 0.12s; }
        .back-link:hover { color: #7357f6 !important; }
        .star { transition: transform 0.1s; }
        .star:hover { transform: scale(1.15); }
        .submit-btn { transition: background 0.15s, box-shadow 0.15s, transform 0.15s; }
        .submit-btn:hover:not(:disabled) { background: #7357f6 !important; box-shadow: 0 8px 24px rgba(138,107,254,0.3) !important; transform: translateY(-1px); }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#ffffff", padding: "40px 16px 80px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>

          {/* Back */}
          <Link href="/jobs" className="back-link" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 600, color: "#6b6b78",
            textDecoration: "none", marginBottom: 28,
          }}>
            <ArrowLeft style={{ width: 13, height: 13 }} /> Retour aux missions
          </Link>

          {/* Card */}
          <div style={{ background: "#fff", border: "1px solid #f6f6f8", borderRadius: 22, overflow: "hidden", animation: "fadeUp 0.25s ease" }}>

            {/* Card header */}
            <div style={{ padding: "26px 28px 22px", borderBottom: "1px solid #f6f6f8", textAlign: "center" }}>
              {/* Avatar */}
              <div style={{ width: 56, height: 56, borderRadius: 18, background: "#f1eeff", border: "1px solid #d9d0fd", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                {target.photoURL
                  ? <img src={target.photoURL} alt="" style={{ width: 56, height: 56, borderRadius: 18, objectFit: "cover" }} />
                  : <User style={{ width: 22, height: 22, color: "#7357f6" }} />
                }
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b78", marginBottom: 6 }}>
                Évaluation
              </p>
              <h1 style={{ fontFamily: "var(--font-bricolage),system-ui", fontWeight: 800, fontSize: 20, color: "#111118", letterSpacing: "-0.02em" }}>
                {target.firstName} {target.lastName}
              </h1>
              {target.title && (
                <p style={{ fontSize: 13, color: "#6b6b78", marginTop: 4 }}>{target.title}</p>
              )}
            </div>

            {/* Rating */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f6f6f8" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b78", marginBottom: 16, textAlign: "center" }}>
                Votre note *
              </p>

              {/* Stars */}
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" className="star"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                    <Star
                      style={{ width: 34, height: 34, transition: "color 0.1s, fill 0.1s" }}
                      fill={n <= active ? "#f59e0b" : "none"}
                      stroke={n <= active ? "#f59e0b" : "#e6e6eb"}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>

              {/* Label */}
              <div style={{ textAlign: "center", height: 20 }}>
                {active > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b" }}>
                    {LABELS[active - 1]}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div style={{ padding: "22px 28px", borderBottom: "1px solid #f6f6f8" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b78" }}>
                  Commentaire *
                </p>
                <span style={{ fontSize: 10, color: "#6b6b78", fontFamily: "'DM Mono', monospace" }}>
                  {comment.length} / 500
                </span>
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value.slice(0, 500))}
                placeholder="Décrivez votre expérience de travail avec cette personne…"
                rows={5}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  border: "1px solid #e6e6eb", background: "#ffffff",
                  fontSize: 14, color: "#111118", outline: "none",
                  resize: "none", lineHeight: 1.65, transition: "border-color 0.15s",
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ margin: "0 28px", marginTop: 16, padding: "10px 14px", borderRadius: 10, background: "#fff5f5", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle style={{ width: 13, height: 13, color: "#ef4444", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#dc2626" }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <div style={{ padding: "20px 28px" }}>
              <button type="button" onClick={handleSubmit} className="submit-btn"
                disabled={submitting || !rating || !comment.trim()}
                style={{
                  width: "100%", padding: "13px", borderRadius: 12, border: "none",
                  background: rating && comment.trim() ? "#7357f6" : "#f6f6f8",
                  color: rating && comment.trim() ? "#fff" : "#6b6b78",
                  fontFamily: "var(--font-bricolage),system-ui", fontWeight: 700, fontSize: 15,
                  cursor: submitting || !rating || !comment.trim() ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: rating && comment.trim() ? "0 4px 16px rgba(138,107,254,0.25)" : "none",
                  transition: "all 0.15s",
                }}>
                {submitting
                  ? <><div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Envoi…</>
                  : <>
                      <Star style={{ width: 15, height: 15 }} fill={rating && comment.trim() ? "#fff" : "none"} />
                      Envoyer mon évaluation
                    </>
                }
              </button>

              <p style={{ fontSize: 11, color: "#6b6b78", textAlign: "center", marginTop: 12 }}>
                Votre évaluation sera visible sur le profil de {target.firstName}.
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}