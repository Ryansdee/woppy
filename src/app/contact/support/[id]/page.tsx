'use client'

import { useEffect, useState, useRef } from 'react'
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  ArrowLeft, Send, Clock, CheckCircle2, AlertCircle,
  XCircle, Loader2, MessageSquare, User, ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

/* ─── Types ─────────────────────────────────────────── */
type Reply = {
  author: 'user' | 'support'
  name: string
  message: string
  createdAt: string   // ISO string stocké manuellement (serverTimestamp ne marche pas dans arrayUnion)
}

type Ticket = {
  ticketId: string
  name: string
  email: string
  category: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  answered: boolean
  replies: Reply[]
  createdAt: { seconds: number } | null
  updatedAt: { seconds: number } | null
}

/* ─── Constantes ─────────────────────────────────────── */
const CATEGORY_LABELS: Record<string, string> = {
  question: 'Question générale',
  bug:      'Bug / Problème technique',
  account:  'Mon compte',
  payment:  'Paiement',
  mission:  'Mission / Annonce',
  other:    'Autre',
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  open:        { label: 'Ouvert',    icon: <Clock size={13} />,         color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
  in_progress: { label: 'En cours',  icon: <AlertCircle size={13} />,   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
  resolved:    { label: 'Résolu',    icon: <CheckCircle2 size={13} />,  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  closed:      { label: 'Fermé',     icon: <XCircle size={13} />,       color: 'text-muted',   bg: 'bg-paper-2 border-line' },
}

const inputCls = `
  w-full px-4 py-2.5 text-sm rounded-xl
  border border-line bg-white text-ink
  placeholder:text-muted
  focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand
  transition-all resize-none
`

/* ─── Helpers ─────────────────────────────────────────── */
function formatDate(iso: string | null | undefined, seconds?: number) {
  const d = iso ? new Date(iso) : seconds ? new Date(seconds * 1000) : null
  if (!d) return '—'
  return d.toLocaleDateString('fr-BE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/* ─── Page ────────────────────────────────────────────── */
export default function SupportTicketPage() {
  const { id } = useParams<{ id: string }>()

  const [ticket, setTicket]       = useState<Ticket | null>(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)
  const [reply, setReply]         = useState('')
  const [sending, setSending]     = useState(false)
  const bottomRef                 = useRef<HTMLDivElement>(null)

  /* Chargement du ticket */
  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const ref  = doc(db, 'contacts', id)
        const snap = await getDoc(ref)
        if (!snap.exists()) { setNotFound(true); return }
        const data = snap.data()
        setTicket({
          ...data,
          // Les anciens tickets n'ont pas de champ `replies` : on normalise en tableau vide
          replies: Array.isArray(data.replies) ? data.replies : [],
        } as Ticket)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  /* Scroll to bottom on new reply */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.replies])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim() || !ticket) return
    setSending(true)
    try {
      // Firestore refuse toute valeur `undefined` : chaque champ a une valeur de repli
      const currentStatus = ticket.status ?? 'open'
      const nextStatus    = currentStatus === 'resolved' || currentStatus === 'closed' ? 'open' : currentStatus

      const newReply: Reply = {
        author:    'user',
        name:      ticket.name || ticket.email || 'Utilisateur',
        message:   reply.trim(),
        createdAt: new Date().toISOString(),
      }
      const ref = doc(db, 'contacts', id)
      await updateDoc(ref, {
        replies:   arrayUnion(newReply),
        updatedAt: serverTimestamp(),
        status:    nextStatus, // réouvre le ticket s'il était fermé ou résolu
      })
      setTicket(prev => prev ? {
        ...prev,
        replies: [...(prev.replies ?? []), newReply],
        status:  nextStatus,
      } : prev)
      setReply('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  /* ── États de chargement ── */
  if (loading) return (
    <div className="min-h-screen bg-paper-2 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-brand" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-paper-2 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-paper-2 border border-line flex items-center justify-center">
        <XCircle size={24} className="text-muted" />
      </div>
      <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>Ticket introuvable</h1>
      <p className="text-sm text-muted max-w-xs">Ce ticket n'existe pas ou l'URL est incorrecte.</p>
      <Link href="/contact" className="text-sm text-brand hover:underline font-semibold flex items-center gap-1">
        <ArrowLeft size={13} /> Retour au support
      </Link>
    </div>
  )

  if (!ticket) return null

  const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG['open']
  const isClosed = ticket.status === 'closed'

  /* ── Messages (message original + replies) ── */
  const allMessages = [
    {
      author:    'user' as const,
      name:      ticket.name,
      message:   ticket.message,
      createdAt: ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toISOString() : null,
      isOriginal: true,
    },
    ...(ticket.replies ?? []).map(r => ({ ...r, isOriginal: false })),
  ]

  return (
    <>
      <style>{``}</style>

      <div className="min-h-screen bg-paper-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-line sticky top-16 z-40">
          <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/contact" className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors font-medium">
              <ArrowLeft size={15} /> Support Woppy
            </Link>
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${status.bg} ${status.color}`}>
              {status.icon} {status.label}
            </span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

          {/* ── Header ticket ── */}
          <div className="bg-white rounded-2xl border border-line p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-medium text-muted mb-1">
                  {ticket.ticketId} · {CATEGORY_LABELS[ticket.category] ?? ticket.category}
                </p>
                <h1 className="text-xl font-bold text-ink leading-snug" style={{ fontFamily: 'var(--font-bricolage), system-ui' }}>
                  {ticket.subject}
                </h1>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted border-t border-line pt-4">
              <span className="flex items-center gap-1"><User size={11} /> {ticket.name} · {ticket.email}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> Créé le {formatDate(null, ticket.createdAt?.seconds)}
              </span>
              {ticket.updatedAt && (
                <span className="flex items-center gap-1">
                  <Clock size={11} /> Mis à jour le {formatDate(null, ticket.updatedAt?.seconds)}
                </span>
              )}
            </div>
          </div>

          {/* ── Conversation ── */}
          <div className="space-y-3">
            {allMessages.map((msg, i) => {
              const isSupport = msg.author === 'support'
              return (
                <div key={i} className={`flex gap-3 ${isSupport ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold
                    ${isSupport
                      ? 'bg-ink text-white'
                      : 'bg-paper-2 border border-line text-muted'
                    }`}>
                    {isSupport ? <ShieldCheck size={14} /> : <User size={14} />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[78%] ${isSupport ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`flex items-center gap-2 text-[11px] text-muted ${isSupport ? 'flex-row-reverse' : ''}`}>
                      <span className="font-semibold text-ink-2">{isSupport ? 'Support Woppy' : msg.name}</span>
                      {(msg as any).isOriginal && (
                        <span className="bg-paper-2 text-muted text-[11px] font-medium px-1.5 py-0.5 rounded">
                          Original
                        </span>
                      )}
                      <span>{formatDate(msg.createdAt)}</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                      ${isSupport
                        ? 'bg-ink text-white rounded-tr-sm'
                        : 'bg-white border border-line text-ink rounded-tl-sm'
                      }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* ── Zone de réponse ── */}
          {isClosed ? (
            <div className="bg-paper-2 border border-line rounded-2xl p-5 text-center">
              <p className="text-sm text-muted flex items-center justify-center gap-2">
                <XCircle size={14} /> Ce ticket est fermé. <Link href="/contact" className="text-brand hover:underline font-semibold">Créer une nouvelle demande</Link>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-line overflow-hidden">
              <div className="px-5 py-3 border-b border-line">
                <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                  <MessageSquare size={11} /> Répondre à ce ticket
                </h2>
              </div>
              <form onSubmit={handleReply} className="p-5 space-y-3">
                <textarea
                  className={inputCls}
                  rows={4}
                  placeholder="Ajoutez des informations complémentaires ou répondez au support…"
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-ink hover:bg-ink-2
                               text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-bricolage), system-ui' }}
                  >
                    {sending
                      ? <><Loader2 size={13} className="animate-spin" /> Envoi…</>
                      : <><Send size={13} /> Envoyer</>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </>
  )
}