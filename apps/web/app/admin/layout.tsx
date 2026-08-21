// apps/web/app/admin/layout.tsx
'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from '@/components/admin/layout/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 border-r">
        <Sidebar />
      </aside>

      {/* Floating hamburger — mobile only, always visible, above everything */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-3 left-3 z-[60] w-10 h-10 rounded-full bg-white border shadow-md flex items-center justify-center text-gray-600"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}>
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 max-w-[85%] shadow-xl transition-transform ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}