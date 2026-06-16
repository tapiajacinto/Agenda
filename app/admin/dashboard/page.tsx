'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, CheckCircle2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BookingRow {
  id: string
  booking_date: string
  start_time: string
  status: string
  clients: { name: string; phone: string } | null
  services: { name: string } | null
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [stats, setStats] = useState({ total: 0, today: 0, upcoming: 0 })

  useEffect(() => {
    const load = async () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const { data } = await supabase
        .from('bookings')
        .select('id, booking_date, start_time, status, clients(name, phone), services(name)')
        .eq('status', 'confirmed')
        .gte('booking_date', today)
        .order('booking_date')
        .order('start_time')
        .limit(20)

      const rows = (data ?? []) as unknown as BookingRow[]
      setBookings(rows)
      setStats({
        total: rows.length,
        today: rows.filter((b) => b.booking_date === today).length,
        upcoming: rows.filter((b) => b.booking_date > today).length,
      })
    }
    load()
  }, [])

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Próximos turnos confirmados</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<Calendar className="w-5 h-5 text-terra-600" />} label="Hoy" value={stats.today} />
          <StatCard icon={<Clock className="w-5 h-5 text-blue-600" />} label="Próximos" value={stats.upcoming} />
          <StatCard icon={<Users className="w-5 h-5 text-violet-600" />} label="Total futuros" value={stats.total} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Turnos próximos</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-8">No hay turnos próximos</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg">
                    <div className="p-2 bg-terra-100 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-terra-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{b.clients?.name ?? '—'}</p>
                      <p className="text-xs text-stone-500">{b.services?.name} · {b.clients?.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-stone-700">
                        {format(new Date(b.booking_date + 'T00:00:00'), "EEE d MMM", { locale: es })}
                      </p>
                      <p className="text-xs text-stone-500">{b.start_time.slice(0, 5)}hs</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Confirmado</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="p-3 bg-stone-100 rounded-xl">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-stone-800">{value}</p>
          <p className="text-sm text-stone-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
