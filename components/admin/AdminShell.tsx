'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Flower2, LayoutDashboard, MessageSquare, Megaphone, Calendar,
  Settings, LogOut, Menu, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/admin/turnos', label: 'Turnos', icon: Calendar },
  { href: '/admin/mensajes', label: 'Mensajes', icon: MessageSquare },
  { href: '/admin/anuncios', label: 'Anuncios', icon: Megaphone },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('padma_admin')) {
      router.replace('/admin')
    }
  }, [router])

  const logout = () => {
    sessionStorage.removeItem('padma_admin')
    router.push('/admin')
  }

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-200 flex flex-col transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Flower2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-800">Padma Admin</p>
            <p className="text-xs text-stone-400">Panel de control</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
          <a href="/" className="flex items-center gap-3 px-3 py-2 mt-1 w-full rounded-lg text-xs text-stone-400 hover:text-emerald-600 transition-colors">
            ← Ver sitio principal
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-stone-100">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-semibold text-stone-800 text-sm">Padma Admin</span>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
