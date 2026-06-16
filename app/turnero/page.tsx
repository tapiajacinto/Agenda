import type { Metadata } from 'next'
import Image from 'next/image'
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

      <main className="relative min-h-screen px-4 pb-24 pt-28">
        {/* Background image */}
        <div className="fixed inset-0 -z-10">
          <Image
            src="/bg-turnero.png"
            alt=""
            fill
            priority
            quality={85}
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Warm semi-transparent overlay so the form stays legible */}
          <div className="absolute inset-0 bg-terra-950/55 backdrop-blur-[2px]" />
        </div>

        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-cream-200/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="mb-12 text-center">
            <div className="mb-7 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-5 rounded-3xl bg-terra-400/20 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl bg-white/96 px-4 py-3 shadow-xl shadow-terra-950/40 ring-1 ring-white/25">
                  <Image
                    src="/logo.jpeg"
                    alt="Padma Yoga Tai logo"
                    width={130}
                    height={130}
                  />
                </div>
              </div>
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-terra-300">
              Agenda online
            </p>
            <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
              Reservá tu turno
            </h1>
            <p className="mt-3 text-sm text-cream-200/60">
              Seguí los pasos y confirmá tu clase en minutos.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-10">
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
