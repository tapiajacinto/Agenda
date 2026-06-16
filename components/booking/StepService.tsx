'use client'

import { Service } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flower2, Hand } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  services: Service[]
  selected: Service | null
  onSelect: (service: Service) => void
}

const iconMap: Record<string, React.ReactNode> = {
  lotus: <Flower2 className="w-10 h-10 text-emerald-600" />,
  hands: <Hand className="w-10 h-10 text-emerald-600" />,
}

export function StepService({ services, selected, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-stone-800">¿Qué servicio deseas?</h2>
        <p className="text-stone-500 mt-1">Elegí el tipo de clase o sesión que quieras reservar</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {services.map((service) => (
          <Card
            key={service.id}
            onClick={() => onSelect(service)}
            className={cn(
              'cursor-pointer transition-all border-2 hover:border-emerald-400 hover:shadow-md',
              selected?.id === service.id
                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                : 'border-stone-200'
            )}
          >
            <CardHeader className="items-center text-center pb-2">
              <div className="p-3 bg-emerald-100 rounded-full mb-2">
                {iconMap[service.icon] ?? <Flower2 className="w-10 h-10 text-emerald-600" />}
              </div>
              <CardTitle className="text-xl text-stone-800">{service.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-stone-600 text-sm">
                {service.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
