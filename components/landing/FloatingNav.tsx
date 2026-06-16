'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-terra-950/90 backdrop-blur-xl shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
      style={{ viewTransitionName: 'site-header' }}
    >
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16 sm:h-20">
        <button
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-3 group"
          aria-label="Ir al inicio"
        >
          <Image
            src="/logo.jpg"
            alt="Padma Yoga"
            width={36}
            height={36}
            className="rounded-full ring-1 ring-white/20 group-hover:ring-terra-400/60 transition-all duration-300"
          />
          <span className="font-semibold text-sm tracking-wider text-white drop-shadow-sm">
            Padma Yoga
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-8">
          {[
            { label: 'Servicios', id: 'servicios' },
            { label: 'Nosotros', id: 'about' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('reservar')}
            className="px-5 py-2.5 bg-terra-500 hover:bg-terra-400 text-white text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-terra-900/40"
          >
            Reservar turno
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col gap-1.5 p-2 text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-0.5 w-5 bg-current origin-center transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
              menuOpen ? 'opacity-0 scale-x-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-current origin-center transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-terra-950/95 backdrop-blur-xl px-5 pb-4 flex flex-col gap-0">
          {[
            { label: 'Servicios', id: 'servicios' },
            { label: 'Nosotros', id: 'about' },
            { label: 'Reservar turno', id: 'reservar' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="w-full text-left py-3.5 text-cream-200 hover:text-white text-sm font-medium border-b border-white/10 last:border-0 transition-colors duration-200"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
