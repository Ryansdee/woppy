import { ReactNode } from 'react'

export default function ContactLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <section
      style={{
        minHeight: '100vh',
        padding: '40px 20px',
        background: '#f9fafb',
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          background: '#fff',
          padding: 32,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        {children}
      </div>
    </section>
  )
}
