'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Leaf, Heart, Sparkles } from 'lucide-react'

const VALUES = [
  { Icon: Leaf, label: 'Conexión', desc: 'Con tu cuerpo, tu mente y el presente.' },
  { Icon: Heart, label: 'Comunidad', desc: 'Un espacio acogedor para todas las personas.' },
  { Icon: Sparkles, label: 'Tradición', desc: 'Prácticas milenarias con guía experta.' },
]

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

export function AboutSection() {
  const { ref, inView } = useInView()

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-terra-950 py-28 px-4"
    >
      {/* Dot grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '30px 30px',
        }}
      />
      {/* Center warm glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-terra-800/25 blur-3xl" />

      <div ref={ref} className="relative z-10 mx-auto max-w-5xl">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

          {/* ── Left: image ── */}
          <div
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'opacity 0.9s ease, transform 0.9s ease',
            }}
          >
            <div className="relative">
              {/* Decorative rings */}
              <div className="absolute -inset-4 rounded-3xl border border-terra-700/25" />
              <div className="absolute -inset-8 rounded-[2.5rem] border border-terra-700/12" />

              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/Gemini_Generated_Image_py4imypy4imypy4i.png"
                  alt="Interior luminoso del estudio Padma Yoga Espacio"
                  width={520}
                  height={420}
                  className="h-72 w-full object-cover lg:h-96"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-terra-950/55 to-transparent" />
              </div>

              {/* Floating stat */}
              <div className="absolute -bottom-5 -right-5 min-w-[130px] rounded-2xl bg-white p-5 shadow-xl">
                <div className="font-heading text-3xl font-bold text-terra-600">+5</div>
                <div className="mt-0.5 text-xs text-stone-500">años de práctica</div>
              </div>
            </div>
          </div>

          {/* ── Right: text ── */}
          <div
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.9s ease 280ms, transform 0.9s ease 280ms',
            }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-terra-400">
              Nuestra historia
            </p>
            <h2 className="mb-6 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
              Un lugar donde{' '}
              <span className="text-terra-300">el bienestar</span>{' '}
              es el camino
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-cream-200/60">
              Padma Yoga Espacio nació del deseo de crear un lugar de encuentro donde cada
              persona pueda reconectar con su naturaleza más profunda. En un ambiente
              luminoso, cálido y acogedor, ofrecemos un camino de transformación a través
              del yoga, el tai chi y las terapias corporales.
            </p>
            <p className="mb-10 text-sm leading-relaxed text-cream-200/60">
              Desde las clases grupales hasta las sesiones individuales, cada práctica está
              guiada con atención y presencia para que puedas vivir la experiencia que tu
              cuerpo y mente necesitan.
            </p>

            {/* Values */}
            <div className="grid grid-cols-3 gap-4">
              {VALUES.map(({ Icon, label, desc }) => (
                <div key={label} className="group text-center">
                  <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-terra-800/60 transition-colors duration-300 group-hover:bg-terra-700/60">
                    <Icon className="h-4 w-4 text-terra-300" />
                  </div>
                  <div className="mb-1 text-xs font-semibold text-white">{label}</div>
                  <div className="text-[10px] leading-relaxed text-cream-200/40">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
