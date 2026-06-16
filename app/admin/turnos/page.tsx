'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  PointerSensor, TouchSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { AdminShell } from '@/components/admin/AdminShell'
import { supabase } from '@/lib/supabase'
import {
  format, addWeeks, startOfWeek, addDays, isToday,
  isBefore, startOfDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ChevronLeft, ChevronRight, Plus, X, MessageCircle, Phone,
  Mail, User, Clock, Trash2, Loader2, GripVertical, ArrowRight,
} from 'lucide-react'
import { buildWhatsAppMessage } from '@/lib/schedule'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'

/* ─── Types ─────────────────────────────────────────────── */
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
interface PendingMove { booking: BookingFull; targetDate: string; targetHour: number }

/* ─── Constants ──────────────────────────────────────────── */
const HOURS = [15, 16, 17, 18, 19, 20, 21]

const SERVICE_COLORS: Record<string, { card: string; dot: string }> = {
  'Yoga':        { card: 'bg-emerald-500', dot: 'bg-emerald-500' },
  'Masajes Tai': { card: 'bg-violet-500',  dot: 'bg-violet-500'  },
}
const DEFAULT_COLOR = { card: 'bg-stone-400', dot: 'bg-stone-400' }

/* ─── Helpers ────────────────────────────────────────────── */
function getColor(name?: string | null) {
  return name ? (SERVICE_COLORS[name] ?? DEFAULT_COLOR) : DEFAULT_COLOR
}
function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
function isScheduledSlot(date: Date, hour: number) {
  const d = date.getDay()
  if (d === 1 || d === 3) return hour === 15 || hour === 16
  if (d === 2 || d === 4) return hour >= 19 && hour <= 21
  return false
}
function slotId(date: Date, hour: number) {
  return `${format(date, 'yyyy-MM-dd')}|${hour}`
}

/* ─── Sub-components ─────────────────────────────────────── */
function DraggableCard({
  booking, onSelect,
}: { booking: BookingFull; onSelect: (b: BookingFull) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `booking-${booking.id}`,
    data: { booking },
  })
  const color = getColor(booking.services?.name)
  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined}
      className={cn(
        'w-full rounded-xl p-2.5 touch-none select-none cursor-grab active:cursor-grabbing transition-all',
        color.card,
        isDragging ? 'opacity-20 scale-95 shadow-none' : 'shadow-sm hover:opacity-90 hover:shadow-md'
      )}
      onClick={() => !isDragging && onSelect(booking)}
      {...attributes} {...listeners}
    >
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {booking.clients ? initials(booking.clients.name) : '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate leading-tight">{booking.clients?.name ?? '—'}</p>
          <p className="text-white/70 text-[10px]">{booking.services?.name}</p>
          <p className="text-white/60 text-[10px] mt-0.5">{booking.start_time.slice(0,5)} – {booking.end_time.slice(0,5)}</p>
        </div>
        <GripVertical className="w-3 h-3 text-white/30 shrink-0 mt-0.5" />
      </div>
    </div>
  )
}

function DroppableSlot({ id, onClick }: { id: string; onClick: () => void }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-full h-full min-h-[68px] rounded-xl border-2 border-dashed transition-all flex items-center justify-center group',
        isOver
          ? 'border-terra-500 bg-terra-100 scale-[1.02] shadow-md'
          : 'border-stone-200 hover:border-terra-300 hover:bg-terra-50/40 cursor-pointer'
      )}
      onClick={onClick}
    >
      <Plus className={cn('w-4 h-4 transition-colors', isOver ? 'text-terra-600' : 'text-stone-300 group-hover:text-terra-400')} />
    </div>
  )
}

function DroppableSlotMobile({ id, onClick }: { id: string; onClick: () => void }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        'flex-1 h-[72px] rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2',
        isOver ? 'border-terra-500 bg-terra-50' : 'border-stone-200 hover:border-terra-300'
      )}
    >
      <Plus className={cn('w-4 h-4', isOver ? 'text-terra-500' : 'text-stone-300')} />
      <span className={cn('text-xs', isOver ? 'text-terra-500' : 'text-stone-300')}>Disponible</span>
    </div>
  )
}

function DragGhost({ booking }: { booking: BookingFull }) {
  const color = getColor(booking.services?.name)
  return (
    <div className={cn('rounded-xl p-3 shadow-2xl rotate-2 scale-105 pointer-events-none w-44', color.card)}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white text-sm font-bold">
          {booking.clients ? initials(booking.clients.name) : '?'}
        </div>
        <div>
          <p className="text-white text-xs font-bold truncate">{booking.clients?.name}</p>
          <p className="text-white/70 text-[10px]">{booking.services?.name}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────── */
export default function TurnosPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [mobileDayIndex, setMobileDayIndex] = useState(0)
  const [bookings, setBookings] = useState<BookingFull[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [selected, setSelected] = useState<BookingFull | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [prefillDate, setPrefillDate] = useState<Date | undefined>()
  const [prefillSlot, setPrefillSlot] = useState('')
  const [confirmMsg, setConfirmMsg] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [draggedBooking, setDraggedBooking] = useState<BookingFull | null>(null)
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)
  const [confirmMoveOpen, setConfirmMoveOpen] = useState(false)
  const [moveLoading, setMoveLoading] = useState(false)

  // New booking form
  const [form, setForm] = useState({ service_id: '', name: '', phone: '', email: '', age: '', gender: '' })
  const [formDate, setFormDate] = useState<Date | undefined>()
  const [formSlot, setFormSlot] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [bookedForDate, setBookedForDate] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  )

  const weekStart = useMemo(
    () => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }),
    [weekOffset],
  )
  const weekDays = useMemo(() => [0, 1, 2, 3].map(i => addDays(weekStart, i)), [weekStart])

  // When week changes, snap mobile to today if present
  useEffect(() => {
    const idx = weekDays.findIndex(d => isToday(d))
    setMobileDayIndex(idx >= 0 ? idx : 0)
  }, [weekOffset])

  const load = async () => {
    const from = format(weekStart, 'yyyy-MM-dd')
    const to = format(addDays(weekStart, 3), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('bookings')
      .select('id, booking_date, start_time, end_time, status, clients(id,name,phone,email,age,gender), services(id,name)')
      .gte('booking_date', from).lte('booking_date', to).eq('status', 'confirmed')
    setBookings((data ?? []) as unknown as BookingFull[])
  }

  useEffect(() => { load() }, [weekStart])

  useEffect(() => {
    supabase.from('services').select('id, name').eq('active', true).then(({ data }) => setServices(data ?? []))
    supabase.from('settings').select('value').eq('key', 'confirmation_message').single()
      .then(({ data }) => setConfirmMsg(data?.value ?? ''))
  }, [])

  useEffect(() => {
    if (!formDate) return
    const ds = format(formDate, 'yyyy-MM-dd')
    supabase.from('bookings').select('start_time').eq('booking_date', ds).eq('status', 'confirmed')
      .then(({ data }) => setBookedForDate(data?.map(b => b.start_time.slice(0, 5)) ?? []))
  }, [formDate])

  function getBookingAt(date: Date, hour: number) {
    const ds = format(date, 'yyyy-MM-dd')
    const ts = `${String(hour).padStart(2, '0')}:`
    return bookings.find(b => b.booking_date === ds && b.start_time.startsWith(ts))
  }

  function openNew(date?: Date, hour?: number) {
    if (date && hour !== undefined) {
      setPrefillDate(date)
      setPrefillSlot(`${String(hour).padStart(2, '0')}:00`)
      setFormDate(date)
      setFormSlot(`${String(hour).padStart(2, '0')}:00`)
    } else {
      setPrefillDate(undefined)
      setPrefillSlot('')
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
      start_time: formSlot, end_time: endTime, status: 'confirmed',
    })
    if (bErr) { toast.error(bErr.message); setFormLoading(false); return }
    toast.success('Turno creado')
    setNewOpen(false)
    setFormLoading(false)
    load()
  }

  function getWaLink(b: BookingFull) {
    if (!b.clients) return '#'
    const date = new Date(b.booking_date + 'T00:00:00')
    const msg = buildWhatsAppMessage(confirmMsg, {
      nombre: b.clients.name,
      edad: b.clients.age,
      genero: b.clients.gender,
      email: b.clients.email,
      telefono: b.clients.phone,
      servicio: b.services?.name ?? '',
      fecha: format(date, "EEEE d 'de' MMMM", { locale: es }),
      hora: `${b.start_time.slice(0, 5)} – ${b.end_time.slice(0, 5)}`,
    })
    const phone = (b.clients.phone || '').replace(/\D/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  const availableSlots = useMemo(() => {
    if (!formDate) return []
    const d = formDate.getDay()
    const all = (d === 1 || d === 3)
      ? [{ s: '15:00', e: '16:00' }, { s: '16:00', e: '17:00' }]
      : (d === 2 || d === 4)
      ? [{ s: '19:00', e: '20:00' }, { s: '20:00', e: '21:00' }, { s: '21:00', e: '22:00' }]
      : []
    return all.filter(sl => !bookedForDate.includes(sl.s))
  }, [formDate, bookedForDate])

  /* ─── DnD handlers ─── */
  function handleDragStart(e: DragStartEvent) {
    const b = bookings.find(b => `booking-${b.id}` === e.active.id)
    setDraggedBooking(b ?? null)
  }

  function handleDragEnd(e: DragEndEvent) {
    setDraggedBooking(null)
    const { active, over } = e
    if (!over) return
    const booking = bookings.find(b => `booking-${b.id}` === active.id)
    if (!booking) return
    const [targetDate, hourStr] = (over.id as string).split('|')
    if (!targetDate || !hourStr) return
    const targetHour = parseInt(hourStr)
    const curTs = `${String(targetHour).padStart(2, '0')}:`
    if (booking.booking_date === targetDate && booking.start_time.startsWith(curTs)) return
    const conflict = bookings.find(b =>
      b.id !== booking.id && b.booking_date === targetDate && b.start_time.startsWith(curTs)
    )
    if (conflict) { toast.error('Ese horario ya está ocupado'); return }
    setPendingMove({ booking, targetDate, targetHour })
    setConfirmMoveOpen(true)
  }

  async function confirmMove() {
    if (!pendingMove) return
    setMoveLoading(true)
    const { booking, targetDate, targetHour } = pendingMove
    await supabase.from('bookings').update({
      booking_date: targetDate,
      start_time: `${String(targetHour).padStart(2, '0')}:00`,
      end_time: `${String(targetHour + 1).padStart(2, '0')}:00`,
    }).eq('id', booking.id)
    toast.success('Turno movido correctamente')
    setConfirmMoveOpen(false)
    setPendingMove(null)
    setMoveLoading(false)
    load()
  }

  const weekLabel = `${format(weekStart, "d MMM", { locale: es })} – ${format(addDays(weekStart, 3), "d MMM yyyy", { locale: es })}`
  const totalWeek = bookings.length

  return (
    <AdminShell>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-full">

          {/* ── Top bar ── */}
          <div className="bg-white border-b border-stone-100 px-4 lg:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-stone-800 leading-none">Agenda</h1>
                <p className="text-xs text-stone-400 mt-0.5">{totalWeek} turno{totalWeek !== 1 ? 's' : ''} esta semana</p>
              </div>
              <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
                <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                  <ChevronLeft className="w-4 h-4 text-stone-600" />
                </button>
                <span className="text-xs sm:text-sm font-medium text-stone-700 px-1.5 capitalize">{weekLabel}</span>
                <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                  <ChevronRight className="w-4 h-4 text-stone-600" />
                </button>
              </div>
              <button onClick={() => setWeekOffset(0)} className="text-xs text-terra-600 font-medium hover:underline hidden sm:block">Hoy</button>
            </div>
            <Button
              onClick={() => openNew()}
              className="bg-gradient-to-r from-terra-600 to-terra-800 hover:from-terra-700 hover:to-terra-900 text-white shadow-sm gap-1.5 rounded-xl text-sm h-9 px-4"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo turno</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </div>

          {/* ══ MOBILE VIEW ══ */}
          <div className="lg:hidden flex-1 flex flex-col bg-stone-50">
            {/* Day tabs */}
            <div className="grid grid-cols-4 bg-white border-b border-stone-100 sticky top-[57px] z-10">
              {weekDays.map((day, i) => {
                const today = isToday(day)
                const active = mobileDayIndex === i
                return (
                  <button
                    key={i}
                    onClick={() => setMobileDayIndex(i)}
                    className={cn(
                      'flex flex-col items-center py-3 transition-all border-b-2',
                      active ? 'border-terra-500' : 'border-transparent'
                    )}
                  >
                    <span className={cn('text-[10px] font-semibold uppercase tracking-wider', today ? 'text-terra-500' : 'text-stone-400')}>
                      {format(day, 'EEE', { locale: es })}
                    </span>
                    <span className={cn(
                      'text-xl font-bold mt-0.5 w-9 h-9 flex items-center justify-center rounded-full',
                      today ? 'bg-terra-500 text-white' : active ? 'text-stone-800' : 'text-stone-500'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {/* Booking dot indicator */}
                    {HOURS.some(h => getBookingAt(day, h)) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-terra-400 mt-1" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Mobile slots */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {(() => {
                const day = weekDays[mobileDayIndex]
                const isPast = isBefore(startOfDay(day), startOfDay(new Date()))
                const validHours = HOURS.filter(h => isScheduledSlot(day, h))
                if (validHours.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 text-stone-300">
                      <Clock className="w-10 h-10 mb-3 opacity-40" />
                      <p className="text-sm">Sin turnos este día</p>
                    </div>
                  )
                }
                return validHours.map(hour => {
                  const booking = getBookingAt(day, hour)
                  const id = slotId(day, hour)
                  return (
                    <div key={hour} className="flex gap-3 items-center">
                      <div className="text-right w-12 shrink-0">
                        <span className="text-sm font-medium text-stone-400">{String(hour).padStart(2,'0')}:00</span>
                      </div>
                      {booking ? (
                        <div className="flex-1">
                          <DraggableCard booking={booking} onSelect={setSelected} />
                        </div>
                      ) : !isPast ? (
                        <DroppableSlotMobile id={id} onClick={() => openNew(day, hour)} />
                      ) : (
                        <div className="flex-1 h-[72px] rounded-xl bg-stone-100 border border-stone-100 flex items-center justify-center">
                          <span className="text-xs text-stone-300">Sin reservar</span>
                        </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          </div>

          {/* ══ DESKTOP VIEW ══ */}
          <div className="hidden lg:flex flex-1 flex-col p-5">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-[56px_repeat(4,1fr)] border-b border-stone-100">
                <div className="p-3" />
                {weekDays.map(day => {
                  const today = isToday(day)
                  return (
                    <div key={day.toISOString()} className={cn('p-4 text-center border-l border-stone-100', today && 'bg-terra-50')}>
                      <p className={cn('text-xs font-semibold uppercase tracking-wider', today ? 'text-terra-600' : 'text-stone-400')}>
                        {format(day, 'EEE', { locale: es })}
                      </p>
                      <p className={cn('text-2xl font-bold mt-0.5', today ? 'text-terra-600' : 'text-stone-800')}>
                        {format(day, 'd')}
                      </p>
                      {today && <div className="w-1.5 h-1.5 rounded-full bg-terra-500 mx-auto mt-1" />}
                    </div>
                  )
                })}
              </div>

              {/* Hour rows */}
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-[56px_repeat(4,1fr)] border-b border-stone-50 last:border-b-0">
                  <div className="p-3 pt-2 text-right">
                    <span className="text-xs text-stone-300 font-medium">{String(hour).padStart(2,'0')}:00</span>
                  </div>
                  {weekDays.map(day => {
                    const booking = getBookingAt(day, hour)
                    const valid = isScheduledSlot(day, hour)
                    const today = isToday(day)
                    const isPast = isBefore(startOfDay(day), startOfDay(new Date()))
                    const id = slotId(day, hour)
                    return (
                      <div key={day.toISOString()} className={cn('border-l border-stone-100 min-h-[80px] p-1.5', today && !booking && 'bg-terra-50/20')}>
                        {booking ? (
                          <DraggableCard booking={booking} onSelect={setSelected} />
                        ) : valid && !isPast ? (
                          <DroppableSlot id={id} onClick={() => openNew(day, hour)} />
                        ) : valid && isPast ? (
                          <div className="w-full h-full min-h-[68px] rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center">
                            <span className="text-[10px] text-stone-300">—</span>
                          </div>
                        ) : (
                          <div className="w-full h-full min-h-[68px]" />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 px-1">
              {Object.entries(SERVICE_COLORS).map(([name, c]) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className={cn('w-2.5 h-2.5 rounded-full', c.dot)} />
                  <span className="text-xs text-stone-400">{name}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-stone-300" />
                <span className="text-xs text-stone-400">Arrastrá para mover</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Drag overlay ── */}
        <DragOverlay dropAnimation={null}>
          {draggedBooking && <DragGhost booking={draggedBooking} />}
        </DragOverlay>
      </DndContext>

      {/* ── Confirm move dialog ── */}
      {pendingMove && (
        <Dialog open={confirmMoveOpen} onOpenChange={o => { if (!o) { setConfirmMoveOpen(false); setPendingMove(null) } }}>
          <DialogContent className="max-w-xs p-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
            <div className={cn('p-5', getColor(pendingMove.booking.services?.name).card)}>
              <p className="text-white font-bold text-base">Cambiar turno</p>
              <p className="text-white/70 text-sm">Confirmá el nuevo horario</p>
            </div>
            <div className="p-5 space-y-4">
              {/* Client info */}
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm', getColor(pendingMove.booking.services?.name).card)}>
                  {initials(pendingMove.booking.clients?.name ?? '?')}
                </div>
                <div>
                  <p className="font-semibold text-stone-800">{pendingMove.booking.clients?.name}</p>
                  <p className="text-xs text-stone-400">{pendingMove.booking.services?.name}</p>
                </div>
              </div>

              {/* Before → After */}
              <div className="flex items-stretch gap-2">
                <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center border border-stone-200">
                  <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide mb-1">Antes</p>
                  <p className="text-xs text-stone-500 capitalize">
                    {format(new Date(pendingMove.booking.booking_date + 'T00:00:00'), "EEE d MMM", { locale: es })}
                  </p>
                  <p className="text-lg font-bold text-stone-700">{pendingMove.booking.start_time.slice(0,5)}</p>
                </div>
                <div className="flex items-center px-1">
                  <ArrowRight className="w-4 h-4 text-stone-300" />
                </div>
                <div className="flex-1 bg-terra-50 rounded-xl p-3 text-center border border-terra-200">
                  <p className="text-[10px] text-terra-600 font-semibold uppercase tracking-wide mb-1">Después</p>
                  <p className="text-xs text-terra-600 capitalize">
                    {format(new Date(pendingMove.targetDate + 'T00:00:00'), "EEE d MMM", { locale: es })}
                  </p>
                  <p className="text-lg font-bold text-terra-700">{String(pendingMove.targetHour).padStart(2,'0')}:00</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={() => { setConfirmMoveOpen(false); setPendingMove(null) }} className="flex-1 rounded-xl">
                  Cancelar
                </Button>
                <Button onClick={confirmMove} disabled={moveLoading} className="flex-1 rounded-xl bg-terra-500 hover:bg-terra-600 text-white gap-2">
                  {moveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Booking detail ── */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {selected && (() => {
            const color = getColor(selected.services?.name)
            const date = new Date(selected.booking_date + 'T00:00:00')
            return (
              <>
                <div className={cn('p-6 pb-5', color.card)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                        {selected.clients ? initials(selected.clients.name) : '?'}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{selected.clients?.name ?? '—'}</h3>
                        <p className="text-white/70 text-sm capitalize">{format(date, "EEEE d 'de' MMMM", { locale: es })}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white p-1"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="bg-white/20 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-white/80" />
                      <span className="text-white text-sm font-medium">{selected.start_time.slice(0,5)} – {selected.end_time.slice(0,5)}</span>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-1.5">
                      <span className="text-white text-sm font-medium">{selected.services?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3 bg-white">
                  {selected.clients?.email && (
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0"><Mail className="w-3.5 h-3.5 text-stone-400" /></div>
                      <span>{selected.clients.email}</span>
                    </div>
                  )}
                  {selected.clients?.phone && (
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0"><Phone className="w-3.5 h-3.5 text-stone-400" /></div>
                      <span>{selected.clients.phone}</span>
                    </div>
                  )}
                  {(selected.clients?.age || selected.clients?.gender) && (
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0"><User className="w-3.5 h-3.5 text-stone-400" /></div>
                      <span className="capitalize">{[selected.clients?.age ? `${selected.clients.age} años` : '', selected.clients?.gender].filter(Boolean).join(' · ')}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => window.open(getWaLink(selected), '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </button>
                    <button onClick={handleCancel} disabled={cancelLoading}
                      className="flex items-center justify-center border border-red-200 text-red-400 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors">
                      {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ── New booking dialog ── */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-terra-700 to-terra-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Nuevo turno</h2>
                <p className="text-terra-100 text-sm">Completá los datos del cliente</p>
              </div>
              <button onClick={() => setNewOpen(false)} className="text-white/70 hover:text-white p-1"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Servicio *</Label>
              <Select value={form.service_id} onValueChange={v => setForm(f => ({ ...f, service_id: v ?? '' }))}>
                <SelectTrigger className="rounded-xl border-stone-200"><SelectValue placeholder="Elegí el servicio" /></SelectTrigger>
                <SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Fecha *</Label>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <Calendar mode="single" selected={formDate} onSelect={d => { setFormDate(d); setFormSlot('') }} locale={es}
                  disabled={date => { const d = date.getDay(); return ![1,2,3,4].includes(d) || isBefore(startOfDay(date), startOfDay(new Date())) }}
                  className="w-full" />
              </div>
            </div>
            {formDate && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Horario *</Label>
                {availableSlots.length === 0
                  ? <p className="text-sm text-stone-400 py-2">Sin horarios disponibles</p>
                  : <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map(sl => (
                        <button key={sl.s} onClick={() => setFormSlot(sl.s)}
                          className={cn('flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                            formSlot === sl.s ? 'border-terra-500 bg-terra-50 text-terra-700' : 'border-stone-200 text-stone-600 hover:border-terra-300')}>
                          <Clock className="w-3.5 h-3.5" /> {sl.s} – {sl.e}
                        </button>
                      ))}
                    </div>
                }
              </div>
            )}
            <div className="border-t border-stone-100 pt-3 space-y-3">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Datos del cliente</p>
              <Input placeholder="Nombre completo *" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="rounded-xl border-stone-200" />
              <Input placeholder="Teléfono / WhatsApp *" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="rounded-xl border-stone-200" />
              <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="rounded-xl border-stone-200" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Edad" type="number" value={form.age} onChange={e => setForm(f => ({...f, age: e.target.value}))} className="rounded-xl border-stone-200" />
                <Select value={form.gender} onValueChange={v => setForm(f => ({...f, gender: v ?? ''}))}>
                  <SelectTrigger className="rounded-xl border-stone-200"><SelectValue placeholder="Género" /></SelectTrigger>
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
          <div className="p-4 border-t border-stone-100 flex gap-2 bg-stone-50">
            <Button variant="outline" onClick={() => setNewOpen(false)} className="flex-1 rounded-xl">Cancelar</Button>
            <Button onClick={handleCreate} disabled={formLoading}
              className="flex-1 rounded-xl bg-gradient-to-r from-terra-600 to-terra-800 hover:from-terra-700 hover:to-terra-900 text-white gap-2">
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar turno
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
