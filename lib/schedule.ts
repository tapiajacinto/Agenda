import { format, isBefore, startOfDay } from 'date-fns'

// day 1=Mon, 2=Tue, 3=Wed, 4=Thu (date-fns: 0=Sun, 1=Mon...)
const SCHEDULE: Record<number, { start: string; end: string }[]> = {
  1: [ // Monday
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
  ],
  2: [ // Tuesday
    { start: '19:00', end: '20:00' },
    { start: '20:00', end: '21:00' },
    { start: '21:00', end: '22:00' },
  ],
  3: [ // Wednesday
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
  ],
  4: [ // Thursday
    { start: '19:00', end: '20:00' },
    { start: '20:00', end: '21:00' },
    { start: '21:00', end: '22:00' },
  ],
}

export function isValidDay(date: Date): boolean {
  const day = date.getDay() // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu
  return [1, 2, 3, 4].includes(day) && !isBefore(startOfDay(date), startOfDay(new Date()))
}

export function getSlotsForDate(date: Date): { start: string; end: string }[] {
  const day = date.getDay()
  return SCHEDULE[day] ?? []
}

export function formatDateES(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

export function buildWhatsAppMessage(
  template: string,
  params: { nombre: string; servicio: string; fecha: string; hora: string }
): string {
  return template
    .replace('{nombre}', params.nombre)
    .replace('{servicio}', params.servicio)
    .replace('{fecha}', params.fecha)
    .replace('{hora}', params.hora)
}
