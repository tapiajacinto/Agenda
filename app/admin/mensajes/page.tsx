'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { MessageSquare, Save, Info } from 'lucide-react'

export default function MensajesPage() {
  const [msg, setMsg] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['confirmation_message', 'whatsapp_business_phone'])
      for (const row of data ?? []) {
        if (row.key === 'confirmation_message') setMsg(row.value ?? '')
        if (row.key === 'whatsapp_business_phone') setPhone(row.value ?? '')
      }
    }
    load()
  }, [])

  useEffect(() => {
    setPreview(
      msg
        .replace('{nombre}', 'María González')
        .replace('{servicio}', 'Yoga')
        .replace('{fecha}', 'Lunes 20 de enero de 2025')
        .replace('{hora}', '15:00 – 16:00')
    )
  }, [msg])

  const save = async () => {
    setSaving(true)
    const updates = [
      supabase.from('settings').update({ value: msg, updated_at: new Date().toISOString() }).eq('key', 'confirmation_message'),
      supabase.from('settings').update({ value: phone, updated_at: new Date().toISOString() }).eq('key', 'whatsapp_business_phone'),
    ]
    await Promise.all(updates)
    toast.success('Configuración guardada')
    setSaving(false)
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Mensajes de confirmación</h1>
          <p className="text-stone-500 text-sm mt-1">Configurá el mensaje que se envía por WhatsApp al confirmar un turno</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-terra-600" /> Mensaje de confirmación
            </CardTitle>
            <CardDescription>
              Usá las variables: <code className="bg-stone-100 px-1 rounded text-xs">{'{nombre}'}</code>{' '}
              <code className="bg-stone-100 px-1 rounded text-xs">{'{servicio}'}</code>{' '}
              <code className="bg-stone-100 px-1 rounded text-xs">{'{fecha}'}</code>{' '}
              <code className="bg-stone-100 px-1 rounded text-xs">{'{hora}'}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Texto del mensaje</Label>
              <Textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={5}
                placeholder="Hola {nombre}! Tu turno de {servicio} fue confirmado..."
              />
            </div>

            {preview && (
              <div className="p-4 bg-terra-50 border border-terra-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-3.5 h-3.5 text-terra-600" />
                  <span className="text-xs font-medium text-terra-700">Vista previa del mensaje</span>
                </div>
                <p className="text-sm text-stone-700 whitespace-pre-wrap">{preview}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">WhatsApp del negocio</CardTitle>
            <CardDescription>Número al que se enviará el mensaje (con código de país, ej: 5493511234567)</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5493511234567"
            />
          </CardContent>
        </Card>

        <Button onClick={save} disabled={saving} className="bg-terra-600 hover:bg-terra-700 gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </AdminShell>
  )
}
