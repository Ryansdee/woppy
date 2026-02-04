'use client';

import { useDocument } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';

type ServiceStatus = 'operational' | 'degraded' | 'outage';


const statusMap: Record<ServiceStatus, {
  label: string;
  color: string;
  bg: string;
  icon: React.ComponentType<{ size?: number }>;
}> = {
  operational: {
    label: 'Opérationnel',
    color: 'text-green-600',
    bg: 'bg-green-100',
    icon: CheckCircle,
  },
  degraded: {
    label: 'Performances dégradées',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    icon: AlertTriangle,
  },
  outage: {
    label: 'Incident en cours',
    color: 'text-red-600',
    bg: 'bg-red-100',
    icon: XCircle,
  },
};

interface StatusDoc {
  globalStatus: ServiceStatus;
  updatedAt: any;
  services: {
    id: string;
    name: string;
    description: string;
    status: ServiceStatus;
  }[];
}

export default function StatusPage() {
  const [snapshot, loading] = useDocument(doc(db, 'status', 'current'));
  const rawData = snapshot?.data();
  const data = rawData as StatusDoc | undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement du statut…
      </div>
    );
  }

  const global = statusMap[data?.globalStatus ?? 'operational'];
  const GlobalIcon = global.icon;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5e5ff] to-white px-4 py-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${global.bg} ${global.color}`}>
            <Activity size={18} />
            <span className="font-medium">
              Statut du service
            </span>
          </div>

          <h1 className="text-4xl font-bold mt-4 mb-2">
            Woppy est actuellement :
          </h1>

          <div className={`flex items-center justify-center gap-2 text-xl font-semibold ${global.color}`}>
            <GlobalIcon size={24} />
            {global.label}
          </div>

          <p className="text-gray-500 text-sm mt-4">
            Dernière mise à jour :{' '}
            {data?.updatedAt?.toDate().toLocaleString()}
          </p>
        </motion.div>

        {/* Services */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 divide-y">
          {data?.services?.map((service: {
            id: string;
            name: string;
            description: string;
            status: ServiceStatus;
            }) => {
            const config = statusMap[service.status] ?? statusMap.operational;
            const Icon = config.icon;

            return (
              <div key={service.id} className="p-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {service.description}
                  </p>
                </div>

                <div className={`flex items-center gap-2 font-medium ${config.color}`}>
                  <Icon size={20} />
                  {config.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-12">
          En cas de problème, notre équipe intervient rapidement 💜
        </p>
      </div>
    </main>
  );
}
