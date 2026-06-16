'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Flower2, LayoutDashboard, Calendar, TrendingUp,
  Settings, LogOut, Menu, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/admin/turnos', label: 'Turnos', icon: Calendar },
  { href: '/admin/finanzas', label: 'Finanzas', icon: TrendingUp },
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
        'fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-stone-100 flex flex-col transition-transform duration-200 shadow-sm',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm">
            <Flower2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-800">Padma Admin</p>
            <p className="text-xs text-stone-400">Panel de control</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                )}
              >
                <Icon className={cn('w-4 h-4', active ? 'text-emerald-600' : 'text-stone-400')} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-stone-100 space-y-0.5">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-all"
          >
            <LogOut className="w-4 h-4 text-stone-400" />
            Cerrar sesión
          </button>
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-xs text-stone-400 hover:text-emerald-600 transition-colors"
          >
            ← Ver sitio principal
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="bg-white border-b border-stone-100 px-4 py-3 flex items-center gap-3 lg:hidden sticky top-0 z-30">
          <button onClick={() => setOpen(!open)} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <Flower2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-stone-800 text-sm">Padma Admin</span>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
