'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ChevronDown } from 'lucide-react'

interface HeroProps {
  subtitle: string
  address: string
}

export function HeroSection({ subtitle, address }: HeroProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const t = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
  })

  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0">
        <Image
          src="/Gemini_Generated_Image_py4imypy4imypy4i.png"
          alt="Salón luminoso de Padma Yoga Espacio con mats de yoga y grandes ventanales"
          fill
          priority
          quality={90}
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* warm-depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-terra-950/78 via-terra-900/58 to-terra-950/88" />
        {/* radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(17,8,5,0.55)_100%)]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-4xl px-6 text-center">
        {/* Logo */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'scale(1)' : 'scale(0.82)',
            transition: 'opacity 0.9s ease 80ms, transform 0.9s cubic-bezier(0.34,1.56,0.64,1) 80ms',
          }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 scale-[2.2] rounded-full bg-terra-400/35 blur-2xl" />
            <Image
              src="/logo.jpg"
              alt="Padma Yoga Tai logo"
              width={92}
              height={92}
              className="relative rounded-full shadow-2xl ring-2 ring-white/20"
            />
          </div>
        </div>

        {/* Eyebrow */}
        <p
          style={t(240)}
          className="mb-5 text-xs font-semibold uppercase tracking-[0.38em] text-terra-300 sm:text-sm"
        >
          Espacio de Bienestar
        </p>

        {/* Main heading */}
        <h1
          style={t(380)}
          className="mb-2 font-heading text-[3.5rem] font-extrabold leading-none tracking-tight text-white sm:text-[5.5rem] lg:text-[7rem]"
        >
          Padma
        </h1>
        <h2
          style={t(460)}
          className="mb-6 font-heading text-[2rem] font-semibold leading-none tracking-tight text-terra-200 sm:text-[3.5rem] lg:text-[4.5rem]"
        >
          Yoga Espacio
        </h2>

        {/* Ornamental divider */}
        <div style={t(540)} className="mb-7 flex items-center justify-center gap-4">
          <div className="h-px w-14 bg-terra-400/50" />
          <div className="h-2 w-2 rounded-full bg-terra-400" />
          <div className="h-px w-14 bg-terra-400/50" />
        </div>

        {/* Subtitle */}
        <p
          style={t(600)}
          className="mx-auto mb-12 max-w-md text-base leading-relaxed text-cream-100/72 sm:text-lg"
        >
          {subtitle}
        </p>

        {/* CTAs */}
        <div style={t(720)} className="mb-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/turnero"
            className="group relative overflow-hidden rounded-full bg-terra-500 px-9 py-4 text-sm font-bold tracking-wide text-white shadow-2xl shadow-terra-900/60 transition-all duration-300 hover:scale-105 hover:shadow-terra-500/30"
          >
            <span className="relative z-10">Reservá tu turno</span>
            <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-terra-400 to-terra-300 transition-transform duration-500 group-hover:translate-x-0" />
          </Link>
          <button
            onClick={() => scrollTo('servicios')}
            className="rounded-full border border-white/25 px-9 py-4 text-sm font-semibold tracking-wide text-white/85 backdrop-blur-sm transition-all duration-300 hover:border-white/45 hover:bg-white/10 hover:text-white"
          >
            Conocer el espacio
          </button>
        </div>

        {/* Address chip */}
        <div
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease 860ms' }}
          className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-xs text-cream-300/65 backdrop-blur-sm"
        >
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{address}</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo('servicios')}
        aria-label="Ver más contenido"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 1s ease 1100ms' }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/40 transition-colors duration-300 hover:text-white/70"
      >
        <ChevronDown className="h-7 w-7 animate-bounce" />
      </button>
    </section>
  )
}
