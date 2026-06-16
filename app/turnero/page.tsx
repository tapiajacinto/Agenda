import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BookingWizard } from '@/components/booking/BookingWizard'
import { FloatingNav } from '@/components/landing/FloatingNav'

export const metadata: Metadata = {
  title: 'Reservar turno – Padma Yoga Espacio',
  description:
    'Reservá tu turno online para clases de yoga, tai chi o masajes en Padma Yoga Espacio. Rápido y sin llamadas.',
}

async function getData() {
  const [servicesRes, settingsRes] = await Promise.all([
    supabase.from('services').select('*').eq('active', true),
    supabase.from('settings').select('*'),
  ])
  const settings: Record<string, string> = {}
  for (const s of settingsRes.data ?? []) settings[s.key] = s.value
  return { services: servicesRes.data ?? [], settings }
}

export const revalidate = 60

export default async function TurneroPage() {
  const { services, settings } = await getData()
  const confirmationMsg = settings['confirmation_message'] || ''
  const businessPhone = settings['whatsapp_business_phone'] || ''

  return (
    <>
      <FloatingNav />
      <main className="min-h-screen bg-cream-50 px-4 pb-24 pt-28">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-terra-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="mb-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">
              Agenda online
            </p>
            <h1 className="font-heading text-4xl font-bold text-stone-800 sm:text-5xl">
              Reservá tu turno
            </h1>
            <p className="mt-3 text-sm text-stone-400">
              Seguí los pasos y confirmá tu clase en minutos.
            </p>
          </div>

          <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm sm:p-10">
            <BookingWizard
              services={services}
              confirmationMsg={confirmationMsg}
              businessPhone={businessPhone}
            />
          </div>
        </div>
      </main>
    </>
  )
}
