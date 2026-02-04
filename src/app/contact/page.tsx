'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, User, MessageSquare, Send, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      await addDoc(collection(db, 'contacts'), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        createdAt: serverTimestamp(),
        answered: false,
      })

      setSuccess(true)
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      console.error(err)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 py-20 relative">
      {/* Aura décorative unique */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">
            Contact
          </h1>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Une question, un besoin spécifique ou un retour sur Woppy ?
            Laissez-nous un message, nous vous répondrons rapidement.
          </p>
        </motion.div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-10">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Message reçu
                </h3>
                <p className="mt-2 text-gray-600">
                  Nous avons bien enregistré votre message.
                  Une réponse vous sera apportée rapidement.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${
                        focusedField === 'name'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      placeholder="Jean Dupont"
                      className="
                        w-full pl-11 pr-4 py-3
                        rounded-lg
                        border border-gray-300
                        bg-white
                        text-gray-900
                        placeholder-gray-400
                        focus:border-blue-600
                        focus:ring-2 focus:ring-blue-600/20
                        transition
                      "
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${
                        focusedField === 'email'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      placeholder="jean@exemple.com"
                      className="
                        w-full pl-11 pr-4 py-3
                        rounded-lg
                        border border-gray-300
                        bg-white
                        text-gray-900
                        placeholder-gray-400
                        focus:border-blue-600
                        focus:ring-2 focus:ring-blue-600/20
                        transition
                      "
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare
                      className={`absolute left-3 top-4 h-5 w-5 ${
                        focusedField === 'message'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      required
                      rows={5}
                      placeholder="Écrivez votre message ici…"
                      className="
                        w-full pl-11 pr-4 py-3
                        rounded-lg
                        border border-gray-300
                        bg-white
                        text-gray-900
                        placeholder-gray-400
                        resize-none
                        focus:border-blue-600
                        focus:ring-2 focus:ring-blue-600/20
                        transition
                      "
                    />
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="
                    w-full
                    py-3
                    rounded-lg
                    bg-blue-600
                    text-white
                    font-medium
                    hover:bg-blue-700
                    disabled:bg-gray-400
                    transition
                    flex items-center justify-center gap-2
                  "
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Envoi…
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Envoyer
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-gray-500 text-center">
                  En envoyant ce formulaire, vous acceptez notre{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    politique de confidentialité
                  </a>
                  .
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
