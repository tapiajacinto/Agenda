'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getSlotsForDate, isValidDay, formatDateES } from '@/lib/schedule'
import { supabase } from '@/lib/supabase'

interface Props {
  selectedDate: Date | undefined
  selectedTime: string
  onSelectDate: (date: Date | undefined) => void
  onSelectTime: (start: string, end: string) => void
}

export function StepSchedule({ selectedDate, selectedTime, onSelectDate, onSelectTime }: Props) {
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate) return
    const fetchBooked = async () => {
      setLoading(true)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const { data } = await supabase
        .from('bookings')
        .select('start_time')
        .eq('booking_date', dateStr)
        .eq('status', 'confirmed')
      setBookedSlots(data?.map((b) => b.start_time.slice(0, 5)) ?? [])
      setLoading(false)
    }
    fetchBooked()
  }, [selectedDate])

  const slots = selectedDate ? getSlotsForDate(selectedDate) : []

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-stone-800">Elegí tu turno</h2>
        <p className="text-stone-500 mt-1">Seleccioná el día y el horario disponible</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center mt-4">
        <div className="w-full lg:w-auto flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            locale={es}
            disabled={(date) => !isValidDay(date)}
            className="rounded-xl border border-stone-200 shadow-sm bg-white"
          />
        </div>

        <div className="w-full lg:w-64 space-y-3">
          {selectedDate ? (
            <>
              <p className="text-sm font-medium text-stone-700 capitalize">
                {formatDateES(selectedDate)}
              </p>
              {loading ? (
                <p className="text-sm text-stone-400 animate-pulse">Cargando horarios...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-stone-400">No hay clases este día.</p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => {
                    const booked = bookedSlots.includes(slot.start)
                    const selected = selectedTime === slot.start
                    return (
                      <button
                        key={slot.start}
                        disabled={booked}
                        onClick={() => !booked && onSelectTime(slot.start, slot.end)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all',
                          booked
                            ? 'border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed'
                            : selected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-400 hover:bg-emerald-50'
                        )}
                      >
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{slot.start} – {slot.end}</span>
                        {booked && (
                          <Badge variant="secondary" className="ml-auto text-xs">Ocupado</Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-stone-400 py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Seleccioná un día para ver los horarios</p>
              <p className="text-xs mt-1 text-stone-300">Lun, Mar, Mié y Jue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
