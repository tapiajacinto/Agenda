'use client'

import { Service, Client } from '@/types'
import { formatDateES, buildWhatsAppMessage } from '@/lib/schedule'
import { CheckCircle2, MessageCircle, User, Calendar, Clock, Phone } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface Props {
  service: Service
  client: Client
  date: Date
  startTime: string
  endTime: string
  confirmationMsg: string
  businessPhone: string
  confirmed: boolean
}

export function StepConfirm({
  service, client, date, startTime, endTime,
  confirmationMsg, businessPhone, confirmed
}: Props) {
  const message = buildWhatsAppMessage(confirmationMsg, {
    nombre: client.name,
    servicio: service.name,
    fecha: formatDateES(date),
    hora: `${startTime} – ${endTime}`,
  })

  const phone = (businessPhone || '').replace(/\D/g, '')
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  if (confirmed) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <div className="p-4 bg-terra-100 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-terra-500" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">¡Turno confirmado!</h2>
          <p className="text-stone-500 mt-2">Te esperamos en Padma Yoga Espacio</p>
        </div>

        <div className="bg-stone-50 rounded-xl p-5 text-left space-y-3 border border-stone-200 max-w-sm mx-auto">
          <Detail icon={<User className="w-4 h-4" />} label="Servicio" value={service.name} />
          <Separator />
          <Detail icon={<Calendar className="w-4 h-4" />} label="Fecha" value={formatDateES(date)} />
          <Separator />
          <Detail icon={<Clock className="w-4 h-4" />} label="Horario" value={`${startTime} – ${endTime}`} />
          <Separator />
          <Detail icon={<Phone className="w-4 h-4" />} label="Contacto" value={client.phone} />
        </div>

        {phone && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Abrir confirmación en WhatsApp
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-stone-800">Confirmá tu turno</h2>
        <p className="text-stone-500 mt-1">Revisá los datos antes de confirmar</p>
      </div>

      <div className="bg-stone-50 rounded-xl p-5 space-y-3 border border-stone-200">
        <Detail icon={<User className="w-4 h-4" />} label="Nombre" value={client.name} />
        <Separator />
        <Detail icon={<User className="w-4 h-4" />} label="Servicio" value={service.name} />
        <Separator />
        <Detail icon={<Calendar className="w-4 h-4" />} label="Fecha" value={formatDateES(date)} />
        <Separator />
        <Detail icon={<Clock className="w-4 h-4" />} label="Horario" value={`${startTime} – ${endTime}`} />
        <Separator />
        <Detail icon={<Phone className="w-4 h-4" />} label="Teléfono" value={client.phone} />
      </div>

      <p className="text-xs text-stone-400 text-center">
        Al confirmar, recibirás un mensaje de contacto por WhatsApp.
      </p>
    </div>
  )
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-terra-600">{icon}</span>
      <span className="text-sm text-stone-500 w-20 shrink-0">{label}</span>
      <span className="text-sm font-medium text-stone-800">{value}</span>
    </div>
  )
}
