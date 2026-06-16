'use client'
import { useState, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'

export function FloatingCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-6 right-5 z-40 transition-all duration-400 sm:bottom-8 sm:right-8 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        onClick={() =>
          document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })
        }
        className="flex items-center gap-2.5 rounded-full bg-terra-500 px-5 py-3.5 text-sm font-bold text-white shadow-2xl shadow-terra-900/50 transition-all duration-300 hover:scale-105 hover:bg-terra-400"
      >
        <CalendarDays className="h-4 w-4" />
        <span>Reservar turno</span>
      </button>
    </div>
  )
}
