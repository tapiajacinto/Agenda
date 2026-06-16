'use client'

import { useState, useEffect, useMemo } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { supabase } from '@/lib/supabase'
import { format, addWeeks, startOfWeek, addDays, isToday, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X, MessageCircle, Phone, Mail, User, Clock, Trash2, Loader2, CalendarDays } from 'lucide-react'
import { buildWhatsAppMessage } from '@/lib/schedule'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Calendar } from '@/components/ui/calendar'

interface BookingFull {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  clients: { id: string; name: string; phone: string; email: string; age: number; gender: string } | null
  services: { id: string; name: string } | null
}

interface ServiceRow { id: string; name: string }

const HOURS = [15, 16, 17, 18, 19, 20, 21]

const SERVICE_COLORS: Record<string, { card: string; light: string; text: string; dot: string }> = {
  'Yoga':       { card: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Masajes Tai':{ card: 'bg-violet-500',  light: 'bg-violet-50 border-violet-200',   text: 'text-violet-700',  dot: 'bg-violet-500'  },
}
const DEFAULT_COLOR = { card: 'bg-stone-500', light: 'bg-stone-50 border-stone-200', text: 'text-stone-700', dot: 'bg-stone-400' }

function getColor(name?: string | null) {
  return name ? (SERVICE_COLORS[name] ?? DEFAULT_COLOR) : DEFAULT_COLOR
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function isScheduledSlot(date: Date, hour: number): boolean {
  const d = date.getDay()
  if (d === 1 || d === 3) return hour === 15 || hour === 16
  if (d === 2 || d === 4) return hour >= 19 && hour <= 21
  return false
}

function slotEnd(hour: number) {
  return `${String(hour + 1).padStart(2, '0')}:00`
}

export default function TurnosPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [bookings, setBookings] = useState<BookingFull[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [selected, setSelected] = useState<BookingFull | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [prefill, setPrefill] = useState<{ date: Date; hour: number } | null>(null)
  const [confirmMsg, setConfirmMsg] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  // New booking form state
  const [form, setForm] = useState({ service_id: '', name: '', phone: '', email: '', age: '', gender: '' })
  const [formDate, setFormDate] = useState<Date | undefined>()
  const [formSlot, setFormSlot] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [bookedForDate, setBookedForDate] = useState<string[]>([])

  const weekStart = useMemo(
    () => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }),
    [weekOffset]
  )
  const weekDays = useMemo(() => [0, 1, 2, 3].map(i => addDays(weekStart, i)), [weekStart])

  const load = async () => {
    const from = format(weekStart, 'yyyy-MM-dd')
    const to = format(addDays(weekStart, 3), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('bookings')
      .select('id, booking_date, start_time, end_time, status, clients(id, name, phone, email, age, gender), services(id, name)')
      .gte('booking_date', from)
      .lte('booking_date', to)
      .eq('status', 'confirmed')
    setBookings((data ?? []) as unknown as BookingFull[])
  }

  useEffect(() => { load() }, [weekStart])

  useEffect(() => {
    supabase.from('services').select('id, name').eq('active', true).then(({ data }) => setServices(data ?? []))
    supabase.from('settings').select('value').eq('key', 'confirmation_message').single()
      .then(({ data }) => setConfirmMsg(data?.value ?? ''))
  }, [])

  // Load booked slots when formDate changes
  useEffect(() => {
    if (!formDate) return
    const dateStr = format(formDate, 'yyyy-MM-dd')
    supabase.from('bookings').select('start_time').eq('booking_date', dateStr).eq('status', 'confirmed')
      .then(({ data }) => setBookedForDate(data?.map(b => b.start_time.slice(0, 5)) ?? []))
  }, [formDate])

  function getBookingAt(date: Date, hour: number) {
    const ds = format(date, 'yyyy-MM-dd')
    const ts = `${String(hour).padStart(2, '0')}:00`
    return bookings.find(b => b.booking_date === ds && b.start_time.startsWith(ts))
  }

  function openNew(date?: Date, hour?: number) {
    if (date && hour !== undefined) {
      setPrefill({ date, hour })
      setFormDate(date)
      setFormSlot(`${String(hour).padStart(2, '0')}:00`)
    } else {
      setPrefill(null)
      setFormDate(undefined)
      setFormSlot('')
    }
    setForm({ service_id: '', name: '', phone: '', email: '', age: '', gender: '' })
    setNewOpen(true)
  }

  async function handleCancel() {
    if (!selected) return
    setCancelLoading(true)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', selected.id)
    toast.success('Turno cancelado')
    setSelected(null)
    setCancelLoading(false)
    load()
  }

  async function handleCreate() {
    if (!formDate || !formSlot || !form.service_id || !form.name || !form.phone) {
      toast.error('Completá los campos obligatorios')
      return
    }
    setFormLoading(true)
    const endHour = parseInt(formSlot.split(':')[0]) + 1
    const endTime = `${String(endHour).padStart(2, '0')}:00`
    const { data: cl, error: clErr } = await supabase
      .from('clients').insert({ name: form.name, phone: form.phone, email: form.email, age: parseInt(form.age) || null, gender: form.gender })
      .select().single()
    if (clErr) { toast.error(clErr.message); setFormLoading(false); return }
    const { error: bErr } = await supabase.from('bookings').insert({
      client_id: cl.id, service_id: form.service_id,
      booking_date: format(formDate, 'yyyy-MM-dd'),
      start_time: formSlot, end_time: endTime, status: 'confirmed'
    })
    if (bErr) { toast.error(bErr.message); setFormLoading(false); return }
    toast.success('Turno creado correctamente')
    setNewOpen(false)
    setFormLoading(false)
    load()
  }

  function getWaLink(b: BookingFull) {
    if (!b.clients) return '#'
    const date = new Date(b.booking_date + 'T00:00:00')
    const msg = buildWhatsAppMessage(confirmMsg, {
      nombre: b.clients.name,
      servicio: b.services?.name ?? '',
      fecha: format(date, "EEEE d 'de' MMMM", { locale: es }),
      hora: `${b.start_time.slice(0, 5)} – ${b.end_time.slice(0, 5)}`,
    })
    const phone = (b.clients.phone || '').replace(/\D/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  const availableSlots = useMemo(() => {
    if (!formDate) return []
    const allSlots = (() => {
      const d = formDate.getDay()
      if (d === 1 || d === 3) return [{ s: '15:00', e: '16:00' }, { s: '16:00', e: '17:00' }]
      if (d === 2 || d === 4) return [{ s: '19:00', e: '20:00' }, { s: '20:00', e: '21:00' }, { s: '21:00', e: '22:00' }]
      return []
    })()
    return allSlots.filter(sl => !bookedForDate.includes(sl.s))
  }, [formDate, bookedForDate])

  const weekLabel = `${format(weekStart, "d MMM", { locale: es })} – ${format(addDays(weekStart, 3), "d MMM yyyy", { locale: es })}`
  const totalWeek = bookings.length

  return (
    <AdminShell>
      <div className="h-full flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-stone-800">Agenda</h1>
              <p className="text-xs text-stone-400">{totalWeek} turno{totalWeek !== 1 ? 's' : ''} esta semana</p>
            </div>
            <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
              <button
                onClick={() => setWeekOffset(w => w - 1)}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-stone-600" />
              </button>
              <span className="text-sm font-medium text-stone-700 px-2 capitalize">{weekLabel}</span>
              <button
                onClick={() => setWeekOffset(w => w + 1)}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronRight className="w-4 h-4 text-stone-600" />
              </button>
            </div>
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-emerald-600 font-medium hover:underline"
            >
              Hoy
            </button>
          </div>

          <Button
            onClick={() => openNew()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm gap-2 rounded-xl"
          >
            <Plus className="w-4 h-4" /> Nuevo turno
          </Button>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden min-w-[600px]">
            {/* Day headers */}
            <div className="grid grid-cols-[56px_repeat(4,1fr)] border-b border-stone-100">
              <div className="p-3" />
              {weekDays.map(day => {
                const today = isToday(day)
                return (
                  <div key={day.toISOString()} className={cn(
                    'p-4 text-center border-l border-stone-100',
                    today && 'bg-emerald-50'
                  )}>
                    <p className={cn('text-xs font-semibold uppercase tracking-wider', today ? 'text-emerald-600' : 'text-stone-400')}>
                      {format(day, 'EEE', { locale: es })}
                    </p>
                    <p className={cn(
                      'text-2xl font-bold mt-0.5',
                      today ? 'text-emerald-600' : 'text-stone-800'
                    )}>
                      {format(day, 'd')}
                    </p>
                    {today && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto mt-1" />}
                  </div>
                )
              })}
            </div>

            {/* Hour rows */}
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-[56px_repeat(4,1fr)] border-b border-stone-50 last:border-b-0">
                {/* Time label */}
                <div className="p-3 pt-2 text-right">
                  <span className="text-xs text-stone-300 font-medium">{String(hour).padStart(2, '0')}:00</span>
                </div>

                {/* Day cells */}
                {weekDays.map(day => {
                  const booking = getBookingAt(day, hour)
                  const valid = isScheduledSlot(day, hour)
                  const today = isToday(day)
                  const pastDay = isBefore(startOfDay(day), startOfDay(new Date()))
                  const color = getColor(booking?.services?.name)

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'border-l border-stone-100 min-h-[72px] p-1.5 relative',
                        today && !booking && 'bg-emerald-50/30'
                      )}
                    >
                      {booking ? (
                        // Booking card
                        <button
                          onClick={() => setSelected(booking)}
                          className={cn(
                            'w-full h-full min-h-[60px] rounded-xl p-2.5 text-left transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.99] shadow-sm group',
                            color.card
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {booking.clients ? initials(booking.clients.name) : '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-semibold truncate leading-tight">
                                {booking.clients?.name ?? '—'}
                              </p>
                              <p className="text-white/70 text-xs truncate">
                                {booking.services?.name}
                              </p>
                              <p className="text-white/60 text-[10px] mt-0.5">
                                {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ) : valid && !pastDay ? (
                        // Empty valid slot — clickable to add
                        <button
                          onClick={() => openNew(day, hour)}
                          className="w-full h-full min-h-[60px] rounded-xl border-2 border-dashed border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                        </button>
                      ) : valid && pastDay ? (
                        <div className="w-full h-full min-h-[60px] rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center">
                          <span className="text-[10px] text-stone-300">—</span>
                        </div>
                      ) : (
                        <div className="w-full h-full min-h-[60px]" />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 px-1">
            {Object.entries(SERVICE_COLORS).map(([name, c]) => (
              <div key={name} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', c.dot)} />
                <span className="text-xs text-stone-500">{name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-dashed border-stone-300" />
              <span className="text-xs text-stone-400">Disponible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {selected && (() => {
            const color = getColor(selected.services?.name)
            const date = new Date(selected.booking_date + 'T00:00:00')
            return (
              <>
                {/* Header */}
                <div className={cn('p-6 pb-5', color.card)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                        {selected.clients ? initials(selected.clients.name) : '?'}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight">
                          {selected.clients?.name ?? '—'}
                        </h3>
                        <p className="text-white/70 text-sm capitalize">
                          {format(date, "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white transition-colors p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="bg-white/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-white/80" />
                      <span className="text-white text-sm font-medium">
                        {selected.start_time.slice(0, 5)} – {selected.end_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-1.5">
                      <span className="text-white text-sm font-medium">{selected.services?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3 bg-white">
                  {selected.clients?.email && (
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-stone-500" />
                      </div>
                      <span>{selected.clients.email}</span>
                    </div>
                  )}
                  {selected.clients?.phone && (
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5 text-stone-500" />
                      </div>
                      <span>{selected.clients.phone}</span>
                    </div>
                  )}
                  {(selected.clients?.age || selected.clients?.gender) && (
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-stone-500" />
                      </div>
                      <span className="capitalize">
                        {[selected.clients.age ? `${selected.clients.age} años` : '', selected.clients.gender].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => window.open(getWaLink(selected), '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelLoading}
                      className="flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                    >
                      {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* New booking dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Nuevo turno</h2>
                <p className="text-emerald-100 text-sm">Completá los datos del cliente</p>
              </div>
              <button onClick={() => setNewOpen(false)} className="text-white/70 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Service */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Servicio *</Label>
              <Select value={form.service_id} onValueChange={v => setForm(f => ({ ...f, service_id: v ?? '' }))}>
                <SelectTrigger className="rounded-xl border-stone-200">
                  <SelectValue placeholder="Elegí el servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Fecha *</Label>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <Calendar
                  mode="single"
                  selected={formDate}
                  onSelect={d => { setFormDate(d); setFormSlot('') }}
                  locale={es}
                  disabled={(date) => {
                    const d = date.getDay()
                    return ![1, 2, 3, 4].includes(d) || isBefore(startOfDay(date), startOfDay(new Date()))
                  }}
                  className="w-full"
                />
              </div>
            </div>

            {/* Slot */}
            {formDate && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Horario *</Label>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-stone-400 py-2">No hay horarios disponibles este día</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map(sl => (
                      <button
                        key={sl.s}
                        onClick={() => setFormSlot(sl.s)}
                        className={cn(
                          'flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                          formSlot === sl.s
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-stone-200 text-stone-600 hover:border-emerald-300'
                        )}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {sl.s} – {sl.e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-stone-100 pt-3 space-y-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Datos del cliente</p>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  placeholder="Nombre completo *"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="rounded-xl border-stone-200"
                />
                <Input
                  placeholder="Teléfono / WhatsApp *"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="rounded-xl border-stone-200"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="rounded-xl border-stone-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Edad"
                    type="number"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    className="rounded-xl border-stone-200"
                  />
                  <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v ?? '' }))}>
                    <SelectTrigger className="rounded-xl border-stone-200">
                      <SelectValue placeholder="Género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="no-binario">No binario</SelectItem>
                      <SelectItem value="prefiero-no-decir">Prefiero no decirlo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-stone-100 flex gap-2 bg-stone-50">
            <Button variant="outline" onClick={() => setNewOpen(false)} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={formLoading}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2"
            >
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar turno
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
