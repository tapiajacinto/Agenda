import type { Metadata } from 'next'
import { FloatingNav } from '@/components/landing/FloatingNav'

export const metadata: Metadata = {
  title: 'Nosotros – Padma Yoga Espacio',
  description: 'Conocé la historia y el equipo de Padma Yoga Espacio.',
}

export default function NosotrosPage() {
  return (
    <>
      <FloatingNav />
      <main className="min-h-screen bg-cream-50 pt-24" />
    </>
  )
}
