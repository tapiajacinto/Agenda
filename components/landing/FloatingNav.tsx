'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToServices = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })
    }
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
        <Link href="/" className="flex items-center gap-3 group">
          <div className="overflow-hidden rounded-lg bg-white/90 p-1 shadow-md ring-1 ring-white/20 transition-all duration-300 group-hover:ring-terra-400/60">
            <Image
              src="/logo.jpeg"
              alt="Padma Yoga Tai"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-sm tracking-wider text-white drop-shadow-sm">
            Padma Yoga
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-8">
          <Link
            href="/#servicios"
            onClick={scrollToServices}
            className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200"
          >
            Servicios
          </Link>
          <Link
            href="/nosotros"
            onClick={() => setMenuOpen(false)}
            className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200"
          >
            Nosotros
          </Link>
          <Link
            href="/turnero"
            className="px-5 py-2.5 bg-terra-500 hover:bg-terra-400 text-white text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-terra-900/40"
          >
            Reservar turno
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col gap-1.5 p-2 text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span className={`block h-0.5 w-5 bg-current origin-center transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-current origin-center transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`sm:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-terra-950/95 backdrop-blur-xl px-5 pb-4 flex flex-col">
          <Link
            href="/#servicios"
            onClick={scrollToServices}
            className="w-full text-left py-3.5 text-cream-200 hover:text-white text-sm font-medium border-b border-white/10 transition-colors duration-200"
          >
            Servicios
          </Link>
          <Link
            href="/nosotros"
            onClick={() => setMenuOpen(false)}
            className="w-full text-left py-3.5 text-cream-200 hover:text-white text-sm font-medium border-b border-white/10 transition-colors duration-200"
          >
            Nosotros
          </Link>
          <Link
            href="/turnero"
            onClick={() => setMenuOpen(false)}
            className="w-full text-left py-3.5 text-cream-200 hover:text-white text-sm font-medium transition-colors duration-200"
          >
            Reservar turno
          </Link>
        </div>
      </div>
    </header>
  )
}
