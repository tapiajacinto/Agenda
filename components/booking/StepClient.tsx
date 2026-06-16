'use client'

import { Client } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin } from 'lucide-react'

interface Props {
  client: Client
  onChange: (client: Client) => void
}

export function StepClient({ client, onChange }: Props) {
  const set = (field: keyof Client, value: string | number | null) =>
    onChange({ ...client, [field]: value ?? '' })

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-stone-800">Tus datos</h2>
        <p className="text-stone-500 mt-1">Para confirmar tu reserva necesitamos un poco de información</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo *</Label>
          <Input
            id="name"
            placeholder="Ej: María González"
            value={client.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Edad *</Label>
          <Input
            id="age"
            type="number"
            placeholder="Ej: 30"
            min={5}
            max={120}
            value={client.age || ''}
            onChange={(e) => set('age', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Género *</Label>
          <Select value={client.gender} onValueChange={(v) => set('gender', v)}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Seleccioná tu género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="femenino">Femenino</SelectItem>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="no-binario">No binario</SelectItem>
              <SelectItem value="prefiero-no-decir">Prefiero no decirlo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Ej: +54 9 351 000 0000"
            value={client.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Correo electrónico *</Label>
          <Input
            id="email"
            type="email"
            placeholder="Ej: maria@mail.com"
            value={client.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6 p-3 bg-stone-50 rounded-lg border border-stone-200">
        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-xs text-stone-500">
          Nos encontramos en <span className="font-medium text-stone-700">Av. San Martín y esq. Catamarca</span>
        </p>
      </div>
    </div>
  )
}
