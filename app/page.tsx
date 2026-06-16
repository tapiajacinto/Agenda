import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { FloatingNav } from '@/components/landing/FloatingNav'
import { FloatingCTA } from '@/components/landing/FloatingCTA'
import { HeroSection } from '@/components/landing/HeroSection'
import { ServicesSection } from '@/components/landing/ServicesSection'
import { ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Padma Yoga Espacio – Yoga, Tai Chi y Bienestar en Argentina',
  description:
    'Descubrí Padma Yoga Espacio: clases de Yoga Integral, Tai Chi Chuan y masajes holísticos en un ambiente luminoso y acogedor. Reservá tu turno online.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Padma Yoga Espacio',
    description: 'Un espacio luminoso para tu práctica de yoga, tai chi y bienestar holístico.',
    images: [
      {
        url: '/Gemini_Generated_Image_py4imypy4imypy4i.png',
        width: 600,
        height: 500,
        alt: 'Salón de Padma Yoga Espacio',
      },
    ],
    type: 'website',
    locale: 'es_AR',
    siteName: 'Padma Yoga Espacio',
  },
}

async function getData() {
  const [servicesRes, settingsRes, socialRes] = await Promise.all([
    supabase.from('services').select('*').eq('active', true),
    supabase.from('settings').select('*'),
    supabase.from('social_media').select('*').eq('active', true).order('display_order'),
  ])
  const settings: Record<string, string> = {}
  for (const s of settingsRes.data ?? []) settings[s.key] = s.value
  return { services: servicesRes.data ?? [], settings, socialMedia: socialRes.data ?? [] }
}

export const revalidate = 60

export default async function HomePage() {
  const { services, settings, socialMedia } = await getData()

  const subtitle =
    settings['welcome_subtitle'] || 'Un espacio de paz y bienestar para tu cuerpo y mente.'
  const address = settings['studio_address'] || 'Av. San Martín y esq. Catamarca'

  /* ── JSON-LD (SEO + GEO) ── */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['HealthClub', 'LocalBusiness'],
        '@id': '/#business',
        name: 'Padma Yoga Espacio',
        description:
          'Espacio de bienestar en Argentina que ofrece clases de Yoga Integral, Tai Chi Chuan y masajes holísticos en un ambiente luminoso y acogedor.',
        image: '/Gemini_Generated_Image_py4imypy4imypy4i.png',
        address: {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressCountry: 'AR',
        },
        openingHoursSpecification: [
          { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Wednesday'], opens: '15:00', closes: '17:00' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Thursday'], opens: '19:00', closes: '22:00' },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Clases y terapias de bienestar',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Yoga Integral', description: 'Clases de yoga para todos los niveles.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Tai Chi Chuan', description: 'Arte marcial suave para el equilibrio y la vitalidad.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Masajes Holísticos', description: 'Terapias corporales personalizadas.' } },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Qué servicios ofrece Padma Yoga Espacio?',
            acceptedAnswer: { '@type': 'Answer', text: 'Padma Yoga Espacio ofrece clases de Yoga Integral para todos los niveles, Tai Chi Chuan, masajes holísticos y sesiones privadas personalizadas.' },
          },
          {
            '@type': 'Question',
            name: '¿Cuándo hay clases de yoga?',
            acceptedAnswer: { '@type': 'Answer', text: 'Los Lunes y Miércoles de 15:00 a 17:00, y los Martes y Jueves de 19:00 a 22:00.' },
          },
          {
            '@type': 'Question',
            name: '¿Cómo reservo una clase?',
            acceptedAnswer: { '@type': 'Answer', text: 'Podés reservar tu turno directamente desde nuestra página web en /turnero, en pocos pasos y sin necesidad de llamar.' },
          },
          {
            '@type': 'Question',
            name: '¿Se necesita experiencia previa?',
            acceptedAnswer: { '@type': 'Answer', text: 'No. Nuestras clases están diseñadas para todos los niveles, el instructor adapta la práctica a cada alumno.' },
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <FloatingNav />
      <FloatingCTA />

      {/* 1. Hero */}
      <HeroSection subtitle={subtitle} address={address} />

      {/* 2. Services */}
      <ServicesSection services={services} />

      {/* 3. Schedule */}
      <section className="bg-cream-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">
              Horarios
            </p>
            <h2 className="font-heading text-3xl font-bold text-stone-800 sm:text-4xl">
              Clases disponibles
            </h2>
          </div>
          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-cream-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-terra-100 text-base">🌤</div>
              <p className="mb-3 font-semibold text-stone-800">Lunes y Miércoles</p>
              <p className="text-sm text-stone-500">15:00 – 16:00</p>
              <p className="text-sm text-stone-500">16:00 – 17:00</p>
            </div>
            <div className="rounded-2xl border border-cream-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-terra-100 text-base">🌙</div>
              <p className="mb-3 font-semibold text-stone-800">Martes y Jueves</p>
              <p className="text-sm text-stone-500">19:00 – 20:00</p>
              <p className="text-sm text-stone-500">20:00 – 21:00</p>
              <p className="text-sm text-stone-500">21:00 – 22:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-terra-950 px-4 py-10 text-cream-200/40">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs">
            © {new Date().getFullYear()} Padma Yoga Espacio · {address}
          </p>
          {socialMedia.length > 0 && (
            <div className="flex gap-5">
              {socialMedia.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs transition-colors duration-200 hover:text-cream-200"
                >
                  <ExternalLink className="h-3 w-3" />
                  {s.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </footer>
    </>
  )
}
