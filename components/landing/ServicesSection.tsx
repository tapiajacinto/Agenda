'use client'
import { useEffect, useRef, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import type { Service } from '@/types'

/* Map DB icon strings → emoji fallbacks for yoga/wellness context */
const EMOJI_FALLBACK: Record<string, string> = {
  lotus: '🪷',
  hands: '🤲',
  heart: '💜',
  leaf: '🌿',
  sparkles: '✨',
  star: '⭐',
  flower: '🌸',
  sun: '☀️',
  moon: '🌙',
  wind: '🌬️',
  mountain: '⛰️',
  feather: '🪶',
  flame: '🔥',
  activity: '⚡',
}

function toPascalCase(s: string) {
  return s.split(/[-_\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

function ServiceIcon({ icon }: { icon: string }) {
  if (!icon) return <span className="text-4xl">✨</span>

  /* Already an emoji or multi-byte char */
  if ([...icon].some(c => c.codePointAt(0)! > 127)) {
    return <span className="text-4xl">{icon}</span>
  }

  /* Try Lucide dynamic lookup */
  const name = toPascalCase(icon)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as Record<string, any>)[name]
  if (Icon) return <Icon className="h-8 w-8 text-terra-600" strokeWidth={1.5} />

  /* Emoji fallback map */
  const emoji = EMOJI_FALLBACK[icon.toLowerCase()]
  return <span className="text-4xl">{emoji ?? '✨'}</span>
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

const FALLBACK_SERVICES: Service[] = [
  {
    id: 'yoga',
    name: 'Yoga Integral',
    description:
      'Clases adaptadas a todos los niveles que integran asanas, pranayama y meditación para el equilibrio cuerpo-mente.',
    icon: 'lotus',
    active: true,
  },
  {
    id: 'taichi',
    name: 'Tai Chi Chuan',
    description:
      'Arte marcial de bajo impacto que cultiva la energía vital. Mejorá el equilibrio, la concentración y la movilidad articular.',
    icon: 'wind',
    active: true,
  },
  {
    id: 'masajes',
    name: 'Masajes Holísticos',
    description:
      'Sesiones personalizadas que integran técnicas terapéuticas para liberar tensiones profundas y restaurar el bienestar.',
    icon: 'hands',
    active: true,
  },
]

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const { ref, inView } = useInView(0.1)

  return (
    <div
      ref={ref}
      className="group relative cursor-default overflow-hidden rounded-3xl border border-cream-200 bg-cream-50 p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-terra-900/10"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(36px)',
        transition: `opacity 0.65s ease ${index * 140}ms, transform 0.65s ease ${index * 140}ms, box-shadow 0.4s, translate 0.4s`,
      }}
    >
      {/* Corner warm accent */}
      <div className="absolute right-0 top-0 h-32 w-32 origin-top-right rounded-bl-full bg-gradient-to-bl from-terra-100 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Bottom slide bar */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-terra-500 to-terra-200 transition-all duration-500 group-hover:w-full" />

      <div className="relative z-10">
        <div className="mb-5"><ServiceIcon icon={service.icon} /></div>
        <h3 className="mb-3 font-heading text-xl font-bold text-stone-800 transition-colors duration-300 group-hover:text-terra-700">
          {service.name}
        </h3>
        <p className="text-sm leading-relaxed text-stone-500">{service.description}</p>
        <div className="mt-6 flex translate-y-2 items-center gap-2 text-xs font-semibold text-terra-500 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span>Reservar clase</span>
          <span aria-hidden>→</span>
        </div>
      </div>
    </div>
  )
}

export function ServicesSection({ services }: { services: Service[] }) {
  const { ref, inView } = useInView(0.1)
  const display = services.length > 0 ? services : FALLBACK_SERVICES

  return (
    <section id="servicios" className="relative overflow-hidden bg-white py-28 px-4">
      {/* Soft blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-terra-50 opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cream-100 opacity-60 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Section header */}
        <div
          ref={ref}
          className="mb-16 text-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">
            Nuestros servicios
          </p>
          <h2 className="mb-4 font-heading text-4xl font-bold text-stone-800 sm:text-5xl">
            Encontrá tu práctica
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-stone-400">
            Cada disciplina es un camino hacia el bienestar. Encontrá la que resuena con vos.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {display.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
