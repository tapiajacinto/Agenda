'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { Announcement } from '@/types'

const EMPTY: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> = {
  title: '', content: '', image_url: '', link: '', active: true,
}

export default function AnunciosPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY })
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    setItems(data ?? [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    setSaving(true)
    const { error } = await supabase.from('announcements').insert({
      title: form.title,
      content: form.content,
      image_url: form.image_url,
      link: form.link,
      active: true,
    })
    if (error) { toast.error(error.message) }
    else { toast.success('Anuncio creado'); setForm({ ...EMPTY }); setOpen(false); load() }
    setSaving(false)
  }

  const toggle = async (id: string, active: boolean) => {
    await supabase.from('announcements').update({ active: !active }).eq('id', id)
    load()
  }

  const remove = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id)
    toast.success('Anuncio eliminado')
    load()
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Anuncios y Promociones</h1>
            <p className="text-stone-500 text-sm mt-1">Gestión de novedades que se muestran en el sitio</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> Nuevo anuncio
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="hidden" />
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear anuncio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1">
                  <Label>Título *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Clase especial de Año Nuevo" />
                </div>
                <div className="space-y-1">
                  <Label>Descripción</Label>
                  <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} placeholder="Detalles del anuncio..." />
                </div>
                <div className="space-y-1">
                  <Label>URL de imagen</Label>
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <Label>Enlace (opcional)</Label>
                  <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
                </div>
                <Button onClick={save} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {saving ? 'Guardando...' : 'Publicar anuncio'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-stone-400">
              <p>No hay anuncios aún. Creá el primero.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <Card key={item.id} className={!item.active ? 'opacity-50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <Badge variant={item.active ? 'default' : 'secondary'} className={item.active ? 'bg-emerald-500 text-white' : ''}>
                        {item.active ? 'Activo' : 'Oculto'}
                      </Badge>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => toggle(item.id, item.active)} title={item.active ? 'Ocultar' : 'Mostrar'}>
                        {item.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(item.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {item.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.title} className="w-20 h-20 object-cover rounded-lg shrink-0" />
                    )}
                    <div>
                      <p className="text-sm text-stone-600">{item.content}</p>
                      {item.link && <a href={item.link} className="text-xs text-emerald-600 underline mt-1 inline-block">{item.link}</a>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
