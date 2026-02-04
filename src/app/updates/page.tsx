'use client';

import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import {
  Calendar,
  Sparkles,
  MessageCircle,
  Layout,
  ShieldCheck,
  Wrench,
  HelpCircle,
} from 'lucide-react';

  const iconMap: Record<string, any> = {
    message: MessageCircle,
    mobile: Layout,
    chat: ShieldCheck,
    wrench: Wrench,
  };

export default function UpdatesPage() {
  const [snapshot, loading] = useCollection(
    query(collection(db, 'updates'), orderBy('date', 'desc'))
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5e5ff] to-white px-4 py-16">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-4">
            <Sparkles className="text-[#8a6bfe]" size={18} />
            <span className="text-sm font-medium text-gray-700">
              Mises à jour produit
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Quoi de neuf sur Woppy ?
          </h1>
          <p className="text-gray-600">
            Découvrez les dernières améliorations de la plateforme.
          </p>
        </div>

        {/* Updates */}
        <div className="space-y-12">
          {loading && <p className="text-center text-gray-500">Chargement…</p>}

          {snapshot?.docs.map((doc) => {
            const update = doc.data();

            return (
              <section
                key={doc.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar size={16} />
                      {update.date} · {update.version}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {update.title}
                    </h2>
                  </div>

                  <span className="px-4 py-1 rounded-full text-sm font-semibold bg-[#f5e5ff] text-[#8a6bfe]">
                    {update.status}
                  </span>
                </div>

                <div className="space-y-8">
                  {update.sections.map((section: any, i: number) => {
                    const Icon = iconMap[section.icon] ?? HelpCircle;

                    return (
                      <div key={i} className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#8a6bfe] text-white flex items-center justify-center">
                          <Icon size={22} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2 text-gray-600">
                            {section.title}
                          </h3>
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {section.items.map((item: string, j: number) => (
                              <li key={j}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-16">
          Vos retours font évoluer Woppy 💜
        </p>
      </div>
    </main>
  );
}
