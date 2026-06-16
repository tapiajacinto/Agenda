'use client'

import { useEffect, useState, useMemo } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { supabase } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { TrendingUp, TrendingDown, DollarSign, CalendarCheck, Users, BarChart2, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookingWithService {
  id: string
  booking_date: string
  status: string
  services: { name: string; price: number } | null
}

interface ServiceStat { name: string; count: number; revenue: number; color: string }

const COLORS: Record<string, string> = {
  'Yoga': 'bg-emerald-500',
  'Masajes Tai': 'bg-violet-500',
}
const TEXT_COLORS: Record<string, string> = {
  'Yoga': 'text-emerald-600',
  'Masajes Tai': 'text-violet-600',
}
const LIGHT_COLORS: Record<string, string> = {
  'Yoga': 'bg-emerald-50 border-emerald-100',
  'Masajes Tai': 'bg-violet-50 border-violet-100',
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function pct(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0
  return Math.round(((curr - prev) / prev) * 100)
}

export default function FinanzasPage() {
  const [bookings, setBookings] = useState<BookingWithService[]>([])
  const [prevBookings, setPrevBookings] = useState<BookingWithService[]>([])
  const [services, setServices] = useState<{ id: string; name: string; price: number }[]>([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const prevStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')
  const prevEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')

  useEffect(() => {
    const load = async () => {
      const [currRes, prevRes, svcRes] = await Promise.all([
        supabase.from('bookings').select('id, booking_date, status, services(name, price)')
          .gte('booking_date', monthStart).lte('booking_date', monthEnd).eq('status', 'confirmed'),
        supabase.from('bookings').select('id, booking_date, status, services(name, price)')
          .gte('booking_date', prevStart).lte('booking_date', prevEnd).eq('status', 'confirmed'),
        supabase.from('services').select('id, name, price').eq('active', true),
      ])
      setBookings((currRes.data ?? []) as unknown as BookingWithService[])
      setPrevBookings((prevRes.data ?? []) as unknown as BookingWithService[])
      setServices(svcRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const totalRevenue = useMemo(() => bookings.reduce((s, b) => s + (b.services?.price ?? 0), 0), [bookings])
  const prevRevenue = useMemo(() => prevBookings.reduce((s, b) => s + (b.services?.price ?? 0), 0), [prevBookings])
  const weekRevenue = useMemo(() => bookings.filter(b => b.booking_date >= weekStart && b.booking_date <= weekEnd)
    .reduce((s, b) => s + (b.services?.price ?? 0), 0), [bookings, weekStart, weekEnd])
  const avgRevenue = bookings.length > 0 ? totalRevenue / bookings.length : 0
  const revenueDiff = pct(totalRevenue, prevRevenue)
  const countDiff = pct(bookings.length, prevBookings.length)

  const byService: ServiceStat[] = useMemo(() => {
    const map: Record<string, ServiceStat> = {}
    for (const b of bookings) {
      const name = b.services?.name ?? 'Otro'
      if (!map[name]) map[name] = { name, count: 0, revenue: 0, color: COLORS[name] ?? 'bg-stone-400' }
      map[name].count++
      map[name].revenue += b.services?.price ?? 0
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue)
  }, [bookings])

  // Monthly history (last 5 months)
  const monthlyHistory = useMemo(() => {
    const months: { label: string; start: string; end: string }[] = []
    for (let i = 4; i >= 0; i--) {
      const d = subMonths(now, i)
      months.push({
        label: format(d, 'MMM yyyy', { locale: es }),
        start: format(startOfMonth(d), 'yyyy-MM-dd'),
        end: format(endOfMonth(d), 'yyyy-MM-dd'),
      })
    }
    return months
  }, [])

  const [historyData, setHistoryData] = useState<{ label: string; count: number; revenue: number }[]>([])

  useEffect(() => {
    const load = async () => {
      const results = await Promise.all(
        monthlyHistory.map(m =>
          supabase.from('bookings').select('id, services(price)')
            .gte('booking_date', m.start).lte('booking_date', m.end).eq('status', 'confirmed')
        )
      )
      setHistoryData(monthlyHistory.map((m, i) => ({
        label: m.label,
        count: results[i].data?.length ?? 0,
        revenue: (results[i].data ?? []).reduce((s: number, b: any) => s + (b.services?.price ?? 0), 0),
      })))
    }
    load()
  }, [monthlyHistory])

  const maxRevenue = Math.max(...historyData.map(h => h.revenue), 1)
  const currentMonth = format(now, 'MMMM yyyy', { locale: es })

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Finanzas</h1>
          <p className="text-stone-400 text-sm mt-0.5 capitalize">{currentMonth}</p>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Ingresos del mes"
            value={fmt(totalRevenue)}
            icon={<DollarSign className="w-5 h-5" />}
            diff={revenueDiff}
            sub="vs. mes anterior"
            color="emerald"
          />
          <StatCard
            label="Turnos confirmados"
            value={String(bookings.length)}
            icon={<CalendarCheck className="w-5 h-5" />}
            diff={countDiff}
            sub="vs. mes anterior"
            color="violet"
          />
          <StatCard
            label="Esta semana"
            value={fmt(weekRevenue)}
            icon={<BarChart2 className="w-5 h-5" />}
            color="teal"
          />
          <StatCard
            label="Promedio por turno"
            value={fmt(avgRevenue)}
            icon={<Users className="w-5 h-5" />}
            color="stone"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Monthly bar chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-stone-700 mb-5">Evolución de ingresos</h2>
            <div className="flex items-end gap-3 h-40">
              {historyData.map((m, i) => {
                const h = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0
                const isCurrent = i === historyData.length - 1
                return (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                    <span className={cn('text-xs font-bold', isCurrent ? 'text-emerald-600' : 'text-stone-400')}>
                      {m.revenue > 0 ? fmt(m.revenue).replace('ARS', '').trim() : '—'}
                    </span>
                    <div className="w-full flex items-end" style={{ height: '80px' }}>
                      <div
                        className={cn(
                          'w-full rounded-t-lg transition-all duration-700',
                          isCurrent ? 'bg-emerald-500' : 'bg-stone-200'
                        )}
                        style={{ height: `${Math.max(h, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 capitalize truncate w-full text-center">{m.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Service breakdown */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-stone-700 mb-5">Por servicio</h2>
            {byService.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-stone-300 text-sm">
                Sin datos este mes
              </div>
            ) : (
              <div className="space-y-4">
                {byService.map(s => {
                  const pctRev = totalRevenue > 0 ? (s.revenue / totalRevenue) * 100 : 0
                  return (
                    <div key={s.name} className={cn('rounded-xl p-4 border', LIGHT_COLORS[s.name] ?? 'bg-stone-50 border-stone-100')}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn('text-sm font-semibold', TEXT_COLORS[s.name] ?? 'text-stone-700')}>{s.name}</span>
                        <span className="text-sm font-bold text-stone-800">{fmt(s.revenue)}</span>
                      </div>
                      <div className="h-2 bg-white rounded-full overflow-hidden border border-stone-200">
                        <div
                          className={cn('h-full rounded-full transition-all duration-700', s.color)}
                          style={{ width: `${pctRev}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-stone-400">{s.count} turno{s.count !== 1 ? 's' : ''}</span>
                        <span className="text-xs text-stone-400">{Math.round(pctRev)}%</span>
                      </div>
                    </div>
                  )
                })}

                {/* Service prices */}
                <div className="pt-2 border-t border-stone-100">
                  <p className="text-xs text-stone-400 mb-2 font-medium">Precios actuales</p>
                  {services.map(s => (
                    <div key={s.id} className="flex justify-between text-xs py-1">
                      <span className="text-stone-600">{s.name}</span>
                      <span className="font-semibold text-stone-800">{fmt(s.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly history table */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-stone-700 mb-4">Resumen mensual</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left py-2 text-xs font-semibold text-stone-400 uppercase tracking-wide">Mes</th>
                  <th className="text-right py-2 text-xs font-semibold text-stone-400 uppercase tracking-wide">Turnos</th>
                  <th className="text-right py-2 text-xs font-semibold text-stone-400 uppercase tracking-wide">Ingresos</th>
                  <th className="text-right py-2 text-xs font-semibold text-stone-400 uppercase tracking-wide">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((m, i) => {
                  const isCurrent = i === historyData.length - 1
                  return (
                    <tr key={m.label} className={cn('border-b border-stone-50 last:border-0', isCurrent && 'bg-emerald-50/50')}>
                      <td className={cn('py-3 font-medium capitalize', isCurrent ? 'text-emerald-700' : 'text-stone-700')}>
                        {m.label}
                        {isCurrent && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-semibold">actual</span>}
                      </td>
                      <td className="py-3 text-right text-stone-600">{m.count}</td>
                      <td className="py-3 text-right font-semibold text-stone-800">{m.revenue > 0 ? fmt(m.revenue) : '—'}</td>
                      <td className="py-3 text-right text-stone-500">
                        {m.count > 0 ? fmt(m.revenue / m.count) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

function StatCard({
  label, value, icon, diff, sub, color = 'stone'
}: {
  label: string; value: string; icon: React.ReactNode; diff?: number; sub?: string; color?: string
}) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    teal: 'bg-teal-50 text-teal-600',
    stone: 'bg-stone-100 text-stone-500',
  }[color] ?? 'bg-stone-100 text-stone-500'

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', colors)}>{icon}</div>
        {diff !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            diff > 0 ? 'bg-emerald-50 text-emerald-600' : diff < 0 ? 'bg-red-50 text-red-500' : 'bg-stone-100 text-stone-400'
          )}>
            {diff > 0 ? <TrendingUp className="w-3 h-3" /> : diff < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(diff)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-stone-800 mb-0.5">{value}</p>
      <p className="text-xs text-stone-400">{label}</p>
      {sub && diff !== undefined && (
        <p className="text-[10px] text-stone-300 mt-0.5">{sub}</p>
      )}
    </div>
  )
}
