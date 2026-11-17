'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Sidebar } from '@/components/admin/layout/Sidebar'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen)
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar)

  useEffect(() => {
    if (!isHydrated) return

    if (!isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isHydrated, isAuthenticated])

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F0FAF5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="text-xs font-medium text-emerald-800 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[#F0FAF5]/40 text-gray-900">
      {/* Desktop Sidebar: Static pinned to viewport while the page content scrolls */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 lg:shrink-0 sticky top-0 h-screen z-30">
        <Sidebar />
      </aside>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={closeMobileSidebar}
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${
            isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sliding Sidebar Panel */}
        <div
          className={`relative h-full w-72 max-w-[85%] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            onClick={closeMobileSidebar}
            aria-label="Close menu"
            className="absolute right-3.5 top-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-20"
          >
            <X className="h-5 w-5" />
          </button>

          <Sidebar onNavigate={closeMobileSidebar} />
        </div>
      </div>

      {/* Main Content Column: Moves & scrolls freely */}
      <div className="flex flex-1 flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
