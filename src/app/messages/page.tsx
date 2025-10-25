'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Send, Paperclip, MoreVertical, Star, CheckCheck, Clock } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  avatar?: string;
  rating?: number;
}

// Données de démonstration
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    lastMessage: 'Parfait ! On se retrouve à 9h alors ?',
    timestamp: 'Il y a 5 min',
    unread: 2,
    online: true,
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Marc Dubois',
    lastMessage: 'Merci pour votre confiance ! À samedi',
    timestamp: 'Il y a 1h',
    unread: 0,
    online: false,
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Emma Martin',
    lastMessage: 'J\'ai de l\'expérience en jardinage, disponible le week-end',
    timestamp: 'Hier',
    unread: 1,
    online: true,
    rating: 5.0,
  },
  {
    id: '4',
    name: 'Lucas Petit',
    lastMessage: 'Bonjour, votre annonce m\'intéresse beaucoup',
    timestamp: 'Il y a 2 jours',
    unread: 0,
    online: false,
    rating: 4.5,
  },
  {
    id: '5',
    name: 'Sophie Lambert',
    lastMessage: 'D\'accord, je vous envoie mon CV par mail',
    timestamp: 'Il y a 3 jours',
    unread: 0,
    online: false,
    rating: 4.8,
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Bonjour Sarah ! Votre profil m\'intéresse pour mon annonce de déménagement 😊',
    sender: 'me',
    timestamp: '14:23',
    read: true,
  },
  {
    id: '2',
    text: 'Bonjour ! Merci beaucoup. Je suis disponible samedi matin comme indiqué dans l\'annonce.',
    sender: 'other',
    timestamp: '14:24',
    read: true,
  },
  {
    id: '3',
    text: 'Super ! Pouvez-vous me confirmer votre expérience en déménagement ?',
    sender: 'me',
    timestamp: '14:25',
    read: true,
  },
  {
    id: '4',
    text: 'Bien sûr ! J\'ai déjà effectué une quinzaine de déménagements via Woppy et d\'autres plateformes. Vous pouvez consulter mes avis sur mon profil 👍',
    sender: 'other',
    timestamp: '14:26',
    read: true,
  },
  {
    id: '5',
    text: 'Parfait ! On se retrouve à 9h alors ?',
    sender: 'other',
    timestamp: '14:28',
    read: false,
  },
];

export default function MessagesPage() {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [messages] = useState<Message[]>(mockMessages);
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // TODO: Envoyer le message via API
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Liste des conversations */}
        <div className="w-full md:w-96 border-r border-gray-200 flex flex-col bg-white">
          {/* Titre et recherche */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent"
              />
            </div>
          </div>

          {/* Liste scrollable */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                  selectedConversation.id === conv.id ? 'bg-[#f5e5ff]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full flex items-center justify-center text-white font-bold">
                      {conv.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{conv.name}</p>
                        {conv.rating && (
                          <div className="flex items-center gap-1">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{conv.rating}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{conv.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                      {conv.unread > 0 && (
                        <span className="bg-[#8a6bfe] text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header de la conversation */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8a6bfe] to-[#b89fff] rounded-full flex items-center justify-center text-white font-bold">
                    {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {selectedConversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{selectedConversation.name}</p>
                    {selectedConversation.rating && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{selectedConversation.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.online ? 'En ligne' : 'Hors ligne'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/students/${selectedConversation.id}`}
                  className="text-[#8a6bfe] hover:text-[#7a5bee] font-medium text-sm"
                >
                  Voir profil
                </Link>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-md ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'me'
                        ? 'bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-2">
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                    {message.sender === 'me' && (
                      <CheckCheck
                        size={14}
                        className={message.read ? 'text-[#8a6bfe]' : 'text-gray-400'}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input de message */}
          <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Paperclip size={20} className="text-gray-600" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8a6bfe] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-[#8a6bfe] to-[#b89fff] text-white p-3 rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Conseil : Restez courtois et professionnel dans vos échanges
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}