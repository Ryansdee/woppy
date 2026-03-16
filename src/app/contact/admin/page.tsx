'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  User,
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  X,
  Calendar,
  Send,
  AlertCircle,
  Download,
  Reply,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

type Contact = {
  id: string;
  name: string;
  email: string;
  message: string;
  answered: boolean;
  answer?: string;
  createdAt?: Timestamp;
  answeredAt?: Timestamp;
};

type FilterType = 'all' | 'pending' | 'answered';

export default function ContactAdminPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  async function fetchContacts() {
    setLoading(true);
    try {
      const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      setContacts(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Contact, 'id'>),
        }))
      );
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendAnswer(contact: Contact) {
    const answer = answers[contact.id];
    if (!answer?.trim()) {
      alert('Veuillez saisir une réponse');
      return;
    }

    setSendingId(contact.id);

    try {
      await updateDoc(doc(db, 'contacts', contact.id), {
        answered: true,
        answer,
        answeredAt: serverTimestamp(),
      });

      setAnswers((prev) => {
        const copy = { ...prev };
        delete copy[contact.id];
        return copy;
      });

      fetchContacts();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    } finally {
      setSendingId(null);
    }
  }

  useEffect(() => {
    fetchContacts();
  }, []);

  // Filtrage et recherche
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'pending' && !contact.answered) ||
      (filterType === 'answered' && contact.answered);

    return matchesSearch && matchesFilter;
  });

  // Statistiques
  const stats = {
    total: contacts.length,
    pending: contacts.filter((c) => !c.answered).length,
    answered: contacts.filter((c) => c.answered).length,
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Date inconnue';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeAgo = (timestamp?: Timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = timestamp.toDate();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return formatDate(timestamp);
  };

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestion des contacts
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Répondez directement aux messages de vos utilisateurs
              </p>
            </div>
            <button
              onClick={fetchContacts}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total des demandes
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    En attente de réponse
                  </p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Déjà répondues
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {stats.answered}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  filterType === 'pending'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                En attente
                {stats.pending > 0 && (
                  <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {stats.pending}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterType('answered')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterType === 'answered'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Répondues
              </button>
            </div>
          </div>
        </motion.div>

        {/* Liste des contacts */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun contact trouvé
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les demandes de contact apparaîtront ici'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredContacts.map((contact, index) => {
                const isExpanded = expandedCards[contact.id];
                return (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                      contact.answered
                        ? 'border-green-100 bg-green-50/20'
                        : 'border-orange-100 bg-orange-50/20'
                    }`}
                  >
                    {/* En-tête de la carte */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4 mb-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                contact.answered
                                  ? 'bg-green-100'
                                  : 'bg-orange-100'
                              }`}
                            >
                              <User
                                className={`w-6 h-6 ${
                                  contact.answered
                                    ? 'text-green-600'
                                    : 'text-orange-600'
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 text-lg truncate">
                                  {contact.name}
                                </h3>
                                {!contact.answered && (
                                  <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Nouveau
                                  </span>
                                )}
                                {contact.answered && (
                                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Répondu
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <Mail className="w-4 h-4" />
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="hover:text-blue-600 transition-colors truncate"
                                >
                                  {contact.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{getTimeAgo(contact.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Message original */}
                          <div className="bg-white rounded-xl p-4 border border-gray-100 mb-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Message reçu :
                                </p>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {contact.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bouton expand/collapse */}
                        <button
                          onClick={() => toggleCard(contact.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </div>

                      {/* Zone de réponse - Expandable */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-gray-100 mt-4">
                              {contact.answered ? (
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <Reply className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-green-900 mb-2">
                                        Votre réponse :
                                      </p>
                                      <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">
                                        {contact.answer}
                                      </p>
                                      {contact.answeredAt && (
                                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          Répondu le{' '}
                                          {formatDate(contact.answeredAt)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="relative">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Répondre au message
                                    </label>
                                    <textarea
                                      placeholder="Écrivez votre réponse ici..."
                                      value={answers[contact.id] || ''}
                                      onChange={(e) =>
                                        setAnswers({
                                          ...answers,
                                          [contact.id]: e.target.value,
                                        })
                                      }
                                      rows={4}
                                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 resize-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      {(answers[contact.id] || '').length}{' '}
                                      caractères
                                    </p>
                                  </div>

                                  <div className="flex gap-3">
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => sendAnswer(contact)}
                                      disabled={
                                        !answers[contact.id]?.trim() ||
                                        sendingId === contact.id
                                      }
                                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
                                    >
                                      {sendingId === contact.id ? (
                                        <>
                                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          <span>Envoi...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Send className="w-5 h-5" />
                                          <span>Envoyer la réponse</span>
                                        </>
                                      )}
                                    </motion.button>

                                    <a
                                      href={`mailto:${contact.email}`}
                                      className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                    >
                                      <Mail className="w-5 h-5" />
                                      <span className="hidden sm:inline">
                                        Email
                                      </span>
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}