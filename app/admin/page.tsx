'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flower2, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_password')
      .single()

    if (data?.value === password) {
      sessionStorage.setItem('padma_admin', '1')
      router.push('/admin/dashboard')
    } else {
      toast.error('Contraseña incorrecta')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 to-teal-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <Flower2 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-stone-800">Panel de Administración</h1>
          <p className="text-stone-500 text-sm mt-1">Padma Yoga Espacio</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {loading ? 'Verificando...' : 'Ingresar'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-stone-400 hover:text-emerald-600">← Volver al inicio</a>
        </div>
      </div>
    </div>
  )
}
