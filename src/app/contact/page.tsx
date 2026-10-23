'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  Mail, User, Send, CheckCircle,
  ChevronRight, Clock, ShieldCheck, Zap, Search, ExternalLink, Loader2,
} from 'lucide-react'
import Link from 'next/link'

const inputCls = `
  w-full px-4 py-2.5 text-sm rounded-xl
  border border-line bg-white text-ink
  placeholder:text-muted
  focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand
  transition-all
`
const labelCls = "block text-xs font-bold text-muted uppercase tracking-widest mb-1.5"

const CATEGORIES = [
  { value: 'question', label: 'Question générale' },
  { value: 'bug',      label: 'Bug / Problème technique' },
  { value: 'account',  label: 'Mon compte' },
  { value: 'payment',  label: 'Paiement' },
  { value: 'mission',  label: 'Mission / Annonce' },
  { value: 'other',    label: 'Autre' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Ouvert',      color: 'bg-blue-50 text-blue-600 border-blue-100' },
  in_progress: { label: 'En cours',    color: 'bg-amber-50 text-amber-600 border-amber-100' },
  resolved:    { label: 'Résolu',      color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  closed:      { label: 'Fermé',       color: 'bg-paper-2 text-muted border-line' },
}

type TicketResult = {
  ticketId: string
  subject: string
  status: string
  category: string
  createdAt: { seconds: number } | null
}

export default function ContactPage() {
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [docId, setDocId]       = useState('')
  const [form, setForm] = useState({
    name: '', email: '', category: '', subject: '', message: '',
  })

  // Search
  const [searchEmail, setSearchEmail]     = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<TicketResult[] | null>(null)
  const [searchError, setSearchError]     = useState('')

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const id = `WOP-${Date.now().toString(36).toUpperCase().slice(-6)}`
      const ref = await addDoc(collection(db, 'contacts'), {
        ticketId: id,
        name:     form.name,
        email:    form.email,
        category: form.category,
        subject:  form.subject,
        message:  form.message,
        status:   'open',
        priority: 'normal',
        answered: false,
        replies:  [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setTicketId(id)
      setDocId(ref.id)
      setSuccess(true)
      setForm({ name: '', email: '', category: '', subject: '', message: '' })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchEmail.trim()) return
    setSearchLoading(true)
    setSearchError('')
    setSearchResults(null)
    try {
      const q = query(collection(db, 'contacts'), where('email', '==', searchEmail.trim().toLowerCase()))
      const snap = await getDocs(q)
      if (snap.empty) {
        setSearchError('Aucun ticket trouvé pour cette adresse e-mail.')
      } else {
        const results: TicketResult[] = snap.docs.map(d => ({
          ...(d.data() as TicketResult),
          // store doc id as ticketId fallback for URL
          _docId: d.id,
        } as TicketResult & { _docId: string }))
        results.sort((a, b) =>
          (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
        )
        setSearchResults(results)
      }
    } catch {
      setSearchError('Une erreur est survenue. Réessayez.')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <>
      <style>{``}</style>

      <div className="min-h-screen bg-paper-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">

          {/* ── Section principale : sidebar + formulaire ── */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Sidebar */}
            <div className="space-y-4">
              <div>
                <h2 className="font-bold text-xl text-ink mb-1 tracking-tight" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
                  Nous contacter
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  Une question, un bug ou un retour ? On vous répond rapidement.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { icon: <Clock size={14} />, title: 'Temps de réponse', desc: 'Sous 24–48h en jours ouvrables' },
                  { icon: <Zap size={14} />, title: 'Bugs critiques', desc: 'Traités en priorité le jour même' },
                  { icon: <ShieldCheck size={14} />, title: 'Ticket de suivi', desc: 'Un ID unique pour chaque demande' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 bg-white border border-line rounded-xl p-4">
                    <div className="w-7 h-7 rounded-lg bg-brand-soft border border-brand-soft flex items-center justify-center text-brand shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">{item.title}</p>
                      <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-paper-2 border border-line rounded-xl p-4">
                <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5">Email direct</p>
                <a href="mailto:support@woppy.be" className="text-sm font-semibold text-brand hover:underline">
                  support@woppy.be
                </a>
              </div>
            </div>

            {/* Formulaire / Success */}
            <div className="lg:col-span-2">
              {success ? (
                <div className="bg-white rounded-2xl border border-line p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={24} className="text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-lg text-ink mb-1" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
                    Message envoyé !
                  </h3>
                  <p className="text-sm text-muted mb-5">
                    Nous avons bien reçu votre demande et vous répondrons sous 24–48h.
                  </p>

                  {/* Ticket ID + lien */}
                  <div className="inline-flex flex-col items-center gap-3 bg-paper-2 border border-line rounded-xl px-6 py-4 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Numéro de ticket</p>
                      <p className="font-bold text-ink tracking-widest text-lg" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
                        {ticketId}
                      </p>
                    </div>
                    <Link
                      href={`/contact/support/${docId}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-ink hover:bg-ink-2 text-white text-xs font-bold rounded-lg transition"
                      style={{ fontFamily: 'var(--font-bricolage), system-ui' }}
                    >
                      Voir mon ticket <ExternalLink size={11} />
                    </Link>
                  </div>

                  <p className="text-xs text-muted mb-6">
                    Conservez ce lien pour suivre l'avancement de votre demande.
                  </p>

                  <button onClick={() => setSuccess(false)}
                    className="text-sm text-brand hover:text-brand-dark font-semibold transition-colors flex items-center gap-1.5 mx-auto">
                    Soumettre une autre demande <ChevronRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-line overflow-hidden">
                  <div className="px-6 py-4 border-b border-line">
                    <h2 className="text-xs font-bold text-muted uppercase tracking-widest">Nouvelle demande</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Nom complet</label>
                        <div className="relative">
                          <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                          <input className={inputCls + " pl-9"} value={form.name}
                            onChange={set('name')} placeholder="Jean Dupont" required />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Adresse e-mail</label>
                        <div className="relative">
                          <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                          <input type="email" className={inputCls + " pl-9"} value={form.email}
                            onChange={set('email')} placeholder="jean@exemple.com" required />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Catégorie</label>
                      <select className={inputCls + " appearance-none cursor-pointer"}
                        value={form.category} onChange={set('category')} required>
                        <option value="" disabled>Sélectionner une catégorie…</option>
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Sujet</label>
                      <input className={inputCls} value={form.subject}
                        onChange={set('subject')} placeholder="Résumé court de votre demande" required />
                    </div>

                    <div>
                      <label className={labelCls}>Message</label>
                      <textarea className={inputCls + " resize-none pt-3"} value={form.message}
                        onChange={set('message')} rows={5}
                        placeholder="Décrivez votre problème ou question en détail…" required />
                      <p className="text-[11px] text-muted mt-1 text-right">{form.message.length}/2000</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-4 flex-wrap">
                      <p className="text-[11px] text-muted">
                        En envoyant, vous acceptez notre{' '}
                        <Link href="/privacy" className="text-brand hover:underline">politique de confidentialité</Link>.
                      </p>
                      <button type="submit" disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-ink hover:bg-ink-2
                                   text-white text-sm font-bold rounded-xl transition disabled:opacity-60
                                   shadow-sm shadow-brand/30"
                        style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
                        {loading
                          ? <><Loader2 size={14} className="animate-spin" /> Envoi…</>
                          : <><Send size={14} /> Envoyer le ticket</>
                        }
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* ── Section : Retrouver mes tickets ── */}
          <div className="bg-white rounded-2xl border border-line overflow-hidden">
            <div className="px-6 py-4 border-b border-line flex items-center gap-2">
              <Search size={14} className="text-muted" />
              <h2 className="text-xs font-bold text-muted uppercase tracking-widest">Retrouver mes tickets</h2>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <input
                    type="email"
                    className={inputCls + " pl-9"}
                    placeholder="Entrez l'adresse e-mail utilisée lors de la demande…"
                    value={searchEmail}
                    onChange={e => setSearchEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-ink hover:bg-ink
                             text-white text-sm font-bold rounded-xl transition disabled:opacity-60 shrink-0"
                  style={{ fontFamily: 'var(--font-bricolage), system-ui' }}
                >
                  {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Rechercher
                </button>
              </form>

              {/* Error */}
              {searchError && (
                <p className="text-sm text-muted text-center py-4">{searchError}</p>
              )}

              {/* Results */}
              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((t: any) => {
                    const status = STATUS_LABELS[t.status] ?? STATUS_LABELS['open']
                    const date = t.createdAt?.seconds
                      ? new Date(t.createdAt.seconds * 1000).toLocaleDateString('fr-BE', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })
                      : '—'

                    return (
                      <Link
                        key={t.ticketId}
                        href={`/contact/support/${t._docId ?? t.ticketId}`}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl border border-line
                                   hover:border-brand/30 hover:bg-brand-soft/30 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md border ${status.color}`}>
                            {status.label}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{t.subject}</p>
                            <p className="text-[11px] text-muted mt-0.5">{t.ticketId} · {date}</p>
                          </div>
                        </div>
                        <ExternalLink size={14} className="text-muted group-hover:text-brand transition-colors shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}