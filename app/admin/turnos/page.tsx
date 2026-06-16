'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Phone, Trash2, MessageCircle } from 'lucide-react'
import { buildWhatsAppMessage } from '@/lib/schedule'

interface BookingRow {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  clients: { name: string; phone: string; email: string } | null
  services: { name: string } | null
}

export default function TurnosPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [confirmMsg, setConfirmMsg] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')

  const load = async () => {
    const [bookRes, setRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('id, booking_date, start_time, end_time, status, clients(name, phone, email), services(name)')
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false })
        .limit(100),
      supabase.from('settings').select('key, value').in('key', ['confirmation_message', 'whatsapp_business_phone']),
    ])
    setBookings((bookRes.data ?? []) as unknown as BookingRow[])
    for (const s of setRes.data ?? []) {
      if (s.key === 'confirmation_message') setConfirmMsg(s.value ?? '')
      if (s.key === 'whatsapp_business_phone') setBusinessPhone(s.value ?? '')
    }
  }

  useEffect(() => { load() }, [])

  const cancel = async (id: string) => {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    toast.success('Turno cancelado')
    load()
  }

  const getWaLink = (b: BookingRow) => {
    if (!b.clients) return ''
    const date = new Date(b.booking_date + 'T00:00:00')
    const msg = buildWhatsAppMessage(confirmMsg, {
      nombre: b.clients.name,
      servicio: b.services?.name ?? '',
      fecha: format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es }),
      hora: `${b.start_time.slice(0, 5)} – ${b.end_time.slice(0, 5)}`,
    })
    const phone = (b.clients.phone || '').replace(/\D/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  const byDate = bookings.reduce<Record<string, BookingRow[]>>((acc, b) => {
    const key = b.booking_date
    if (!acc[key]) acc[key] = []
    acc[key].push(b)
    return acc
  }, {})

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Turnos</h1>
          <p className="text-stone-500 text-sm mt-1">Historial y gestión de todos los turnos</p>
        </div>

        {Object.keys(byDate).length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-stone-400">
              <p>No hay turnos registrados</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(byDate).map(([date, rows]) => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-stone-600 capitalize">
                  {format(new Date(date + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rows.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-800 truncate">{b.clients?.name ?? '—'}</p>
                        <Badge
                          variant="secondary"
                          className={b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600'}
                        >
                          {b.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-stone-500">{b.services?.name}</span>
                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs text-stone-500">{b.start_time.slice(0, 5)}hs</span>
                        {b.clients?.phone && (
                          <>
                            <span className="text-xs text-stone-400">·</span>
                            <span className="text-xs text-stone-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {b.clients.phone}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {b.status === 'confirmed' && (
                        <>
                          <a href={getWaLink(b)} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" title="Enviar WhatsApp">
                              <MessageCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          </a>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => cancel(b.id)}
                            className="text-red-400 hover:text-red-600"
                            title="Cancelar turno"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminShell>
  )
}
