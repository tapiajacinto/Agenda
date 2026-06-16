'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Save, Plus, Trash2, ExternalLink } from 'lucide-react'
import { Setting, SocialMedia } from '@/types'

const EDITABLE_KEYS = [
  'welcome_title', 'welcome_subtitle', 'studio_name', 'studio_address',
  'studio_phone', 'studio_email', 'admin_password',
]

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [social, setSocial] = useState<SocialMedia[]>([])
  const [newSocial, setNewSocial] = useState({ platform: '', url: '' })
  const [saving, setSaving] = useState(false)

  const loadSettings = async () => {
    const { data } = await supabase.from('settings').select('*').in('key', EDITABLE_KEYS)
    setSettings(data ?? [])
  }
  const loadSocial = async () => {
    const { data } = await supabase.from('social_media').select('*').order('display_order')
    setSocial(data ?? [])
  }

  useEffect(() => { loadSettings(); loadSocial() }, [])

  const setSetting = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value } : s))
  }

  const save = async () => {
    setSaving(true)
    await Promise.all(settings.map((s) =>
      supabase.from('settings').update({ value: s.value, updated_at: new Date().toISOString() }).eq('key', s.key)
    ))
    toast.success('Configuración guardada')
    setSaving(false)
  }

  const addSocial = async () => {
    if (!newSocial.platform || !newSocial.url) { toast.error('Completá plataforma y URL'); return }
    await supabase.from('social_media').insert({
      platform: newSocial.platform,
      url: newSocial.url,
      display_order: social.length,
    })
    setNewSocial({ platform: '', url: '' })
    loadSocial()
  }

  const removeSocial = async (id: string) => {
    await supabase.from('social_media').delete().eq('id', id)
    loadSocial()
  }

  const getVal = (key: string) => settings.find((s) => s.key === key)?.value ?? ''
  const getLabel = (key: string) => settings.find((s) => s.key === key)?.label ?? key

  return (
    <AdminShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Configuración general</h1>
          <p className="text-stone-500 text-sm mt-1">Ajustá los textos, redes sociales y acceso al sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información del estudio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['welcome_title', 'welcome_subtitle', 'studio_name', 'studio_address', 'studio_phone', 'studio_email'].map((key) => (
              <div key={key} className="space-y-1">
                <Label>{getLabel(key)}</Label>
                <Input value={getVal(key)} onChange={(e) => setSetting(key, e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Redes sociales</CardTitle>
            <CardDescription>Se muestran en el hero del sitio principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {social.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                <ExternalLink className="w-4 h-4 text-stone-400" />
                <span className="text-sm font-medium text-stone-700 w-20 capitalize">{s.platform}</span>
                <span className="text-xs text-stone-500 flex-1 truncate">{s.url}</span>
                <Button variant="ghost" size="icon" onClick={() => removeSocial(s.id)} className="text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Separator />
            <div className="flex gap-2">
              <Input
                placeholder="instagram"
                value={newSocial.platform}
                onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                className="w-32"
              />
              <Input
                placeholder="https://instagram.com/..."
                value={newSocial.url}
                onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
              />
              <Button onClick={addSocial} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acceso al panel</CardTitle>
            <CardDescription>Cambiá la contraseña de administrador</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={getVal('admin_password')}
                onChange={(e) => setSetting('admin_password', e.target.value)}
                placeholder="Nueva contraseña"
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar todo'}
        </Button>
      </div>
    </AdminShell>
  )
}
