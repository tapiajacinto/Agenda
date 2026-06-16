'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Service, Client, BookingStep } from '@/types'
import { StepService } from './StepService'
import { StepClient } from './StepClient'
import { StepSchedule } from './StepSchedule'
import { StepConfirm } from './StepConfirm'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const STEPS: BookingStep[] = ['service', 'client', 'schedule', 'confirm']
const STEP_LABELS = ['Servicio', 'Tus datos', 'Horario', 'Confirmar']

interface Props {
  services: Service[]
  confirmationMsg: string
  businessPhone: string
}

export function BookingWizard({ services, confirmationMsg, businessPhone }: Props) {
  const [step, setStep] = useState<BookingStep>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [client, setClient] = useState<Client>({ name: '', age: 0, gender: '', email: '', phone: '' })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const stepIndex = STEPS.indexOf(step)

  const canNext = () => {
    if (step === 'service') return !!selectedService
    if (step === 'client') return !!client.name && !!client.age && !!client.gender && !!client.email && !!client.phone
    if (step === 'schedule') return !!selectedDate && !!startTime
    return true
  }

  const next = () => {
    if (step === 'confirm') {
      handleConfirm()
      return
    }
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  const back = () => {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedService || !startTime) return
    setLoading(true)
    try {
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .insert({
          name: client.name,
          age: client.age,
          gender: client.gender,
          email: client.email,
          phone: client.phone,
        })
        .select()
        .single()

      if (clientErr) throw clientErr

      const { error: bookingErr } = await supabase
        .from('bookings')
        .insert({
          client_id: clientData.id,
          service_id: selectedService.id,
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
          status: 'confirmed',
        })

      if (bookingErr) throw bookingErr

      setConfirmed(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al confirmar el turno'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border-2 transition-all
              ${i < stepIndex ? 'bg-terra-500 border-terra-500 text-white'
                : i === stepIndex ? 'border-terra-500 text-terra-600 bg-white'
                : 'border-stone-200 text-stone-300 bg-white'}`}>
              {i < stepIndex ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === stepIndex ? 'text-terra-700' : 'text-stone-400'}`}>
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 w-6 sm:w-12 ${i < stepIndex ? 'bg-terra-500' : 'bg-stone-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-64">
        {step === 'service' && (
          <StepService services={services} selected={selectedService} onSelect={setSelectedService} />
        )}
        {step === 'client' && (
          <StepClient client={client} onChange={setClient} />
        )}
        {step === 'schedule' && (
          <StepSchedule
            selectedDate={selectedDate}
            selectedTime={startTime}
            onSelectDate={(d) => { setSelectedDate(d); setStartTime(''); setEndTime('') }}
            onSelectTime={(s, e) => { setStartTime(s); setEndTime(e) }}
          />
        )}
        {step === 'confirm' && selectedDate && selectedService && (
          <StepConfirm
            service={selectedService}
            client={client}
            date={selectedDate}
            startTime={startTime}
            endTime={endTime}
            confirmationMsg={confirmationMsg}
            businessPhone={businessPhone}
            confirmed={confirmed}
          />
        )}
      </div>

      {/* Navigation */}
      {!confirmed && (
        <div className="flex justify-between mt-8 pt-4 border-t border-stone-100">
          <Button variant="ghost" onClick={back} disabled={stepIndex === 0} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>
          <Button
            onClick={next}
            disabled={!canNext() || loading}
            className="gap-1 bg-terra-600 hover:bg-terra-700 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {step === 'confirm' ? 'Confirmar turno' : 'Siguiente'}
            {step !== 'confirm' && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      )}

      {confirmed && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => {
              setStep('service')
              setSelectedService(null)
              setClient({ name: '', age: 0, gender: '', email: '', phone: '' })
              setSelectedDate(undefined)
              setStartTime('')
              setEndTime('')
              setConfirmed(false)
            }}
          >
            Reservar otro turno
          </Button>
        </div>
      )}
    </div>
  )
}
