'use client'

import { Search, Bell, Sun, Menu } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { microgrammaBold } from '@/lib/fonts'
import { ADMIN_NAV_ITEMS } from '@/lib/adminNav'
import Image from 'next/image'

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return ADMIN_NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q))
  }, [query])

  function goTo(href: string) {
    router.push(href)
    setQuery('')
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && results.length > 0) goTo(results[0].href)
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm px-5 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
      <button onClick={onMenuClick} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden mr-2 transition-colors">
        <Menu className="h-5 w-5" />
      </button>

      <h1 className={`${microgrammaBold.className} text-[22px] lg:text-[26px] font-bold text-gray-900 shrink-0 tracking-tight`}>
        {title}
      </h1>

      <div ref={boxRef} className="hidden md:flex items-center gap-4 flex-1 max-w-lg mx-10 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => query && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search data, users, or reports"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100"
          />
        </div>
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-30">
            {results.map((item) => (
              <button
                key={item.href}
                onClick={() => goTo(item.href)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors"
              >
                <item.icon className="h-4 w-4 text-gray-400" />
                {item.label}
              </button>
            ))}
          </div>
        )}
        {open && query.trim() && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400 z-30">
            No matching page
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button className="hidden sm:flex w-10 h-10 rounded-full bg-gray-50 border border-gray-200 items-center justify-center hover:bg-gray-100 transition-colors">
          <Bell className="h-4 w-4 text-gray-500" />
        </button>
        <button className="hidden sm:flex w-10 h-10 rounded-full bg-gray-50 border border-gray-200 items-center justify-center hover:bg-gray-100 transition-colors">
          <Sun className="h-4 w-4 text-gray-500" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200">
  <Image
    src="/favicon.svg"
    alt="User"
    width={40}
    height={40}
    className="w-full h-full object-cover"
  />
</div>
      </div>
    </div>
  )
}