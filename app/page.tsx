import { supabase } from '@/lib/supabase'
import { BookingWizard } from '@/components/booking/BookingWizard'
import { Flower2, MapPin, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

async function getData() {
  const [servicesRes, settingsRes, announcementsRes, socialRes] = await Promise.all([
    supabase.from('services').select('*').eq('active', true),
    supabase.from('settings').select('*'),
    supabase.from('announcements').select('*').eq('active', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('social_media').select('*').eq('active', true).order('display_order'),
  ])

  const settings: Record<string, string> = {}
  for (const s of settingsRes.data ?? []) settings[s.key] = s.value

  return {
    services: servicesRes.data ?? [],
    settings,
    announcements: announcementsRes.data ?? [],
    socialMedia: socialRes.data ?? [],
  }
}

export const revalidate = 60

export default async function HomePage() {
  const { services, settings, announcements, socialMedia } = await getData()

  const welcomeTitle = settings['welcome_title'] || 'Bienvenido a Padma Yoga Espacio'
  const welcomeSubtitle = settings['welcome_subtitle'] || 'Un espacio de paz y bienestar para tu cuerpo y mente.'
  const address = settings['studio_address'] || 'Av. San Martín y esq. Catamarca'
  const confirmationMsg = settings['confirmation_message'] || ''
  const businessPhone = settings['whatsapp_business_phone'] || ''

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 text-white py-24 px-4">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Flower2 className="w-12 h-12 text-emerald-200" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {welcomeTitle}
          </h1>
          <p className="text-lg text-emerald-100 max-w-xl mx-auto mb-6">
            {welcomeSubtitle}
          </p>
          <div className="flex items-center justify-center gap-2 text-emerald-200 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{address}</span>
          </div>
          {socialMedia.length > 0 && (
            <div className="flex justify-center gap-3 mt-4">
              {socialMedia.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-xs font-medium">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {s.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="flex gap-4 items-start p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                {a.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_url} alt={a.title} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-emerald-600 text-white text-xs">Novedad</Badge>
                    <span className="font-semibold text-stone-800">{a.title}</span>
                  </div>
                  <p className="text-sm text-stone-600">{a.content}</p>
                  {a.link && (
                    <a href={a.link} className="text-xs text-emerald-600 underline mt-1 inline-block">Ver más</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Booking section */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-stone-800">Reservá tu turno</h2>
          <p className="text-stone-500 mt-2">Seguí los pasos para agendar tu clase o sesión</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-6 sm:p-10">
          <BookingWizard
            services={services}
            confirmationMsg={confirmationMsg}
            businessPhone={businessPhone}
          />
        </div>
      </section>

      {/* Schedule info */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 text-center">Horarios disponibles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="font-medium text-emerald-700 mb-2">Lunes y Miércoles</p>
              <p className="text-stone-600 text-sm">15:00 – 16:00</p>
              <p className="text-stone-600 text-sm">16:00 – 17:00</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="font-medium text-emerald-700 mb-2">Martes y Jueves</p>
              <p className="text-stone-600 text-sm">19:00 – 20:00</p>
              <p className="text-stone-600 text-sm">20:00 – 21:00</p>
              <p className="text-stone-600 text-sm">21:00 – 22:00</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center text-stone-400 text-xs py-6 border-t border-stone-100">
        <p>© {new Date().getFullYear()} Padma Yoga Espacio · {address}</p>
      </footer>
    </main>
  )
}
