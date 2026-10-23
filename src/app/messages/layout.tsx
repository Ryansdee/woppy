import { Suspense } from 'react';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-muted">
      Chargement des messages...
    </div>}>
      {children}
    </Suspense>
  );
}
