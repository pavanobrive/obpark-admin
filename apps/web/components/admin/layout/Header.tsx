'use client'

import { Search, Bell, Menu, X, ArrowRight, ShieldCheck, Command } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { microgrammaBold } from '@/lib/fonts'
import { ADMIN_NAV_ITEMS } from '@/lib/adminNav'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import Link from 'next/link'
import Image from 'next/image'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const user = useAuthStore((state) => state.user)
  const openMobileSidebar = useUIStore((state) => state.openMobileSidebar)

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A'
  const userName = user?.name || 'Admin'

  // Handle clicking outside of search box
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Global Ctrl+K / Cmd+K shortcut to focus search
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return ADMIN_NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  function goTo(href: string) {
    router.push(href)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter' && results.length > 0) {
      goTo(results[selectedIndex]?.href || results[0].href)
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  function handleMenuToggle() {
    if (onMenuClick) {
      onMenuClick()
    }
    openMobileSidebar()
  }

  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-gray-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all">
      <div className="px-4 sm:px-6 lg:px-6 py-2 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Button & Title */}
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          <button
            onClick={handleMenuToggle}
            aria-label="Open mobile menu"
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-[#074139] hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#074139]/20"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span className="text-[#074139] font-bold">{title}</span>
            </div>
          </div>
        </div>

        {/* Center Section: Global Command Search Bar */}
        <div ref={boxRef} className="hidden md:flex items-center flex-1 max-w-md lg:max-w-lg mx-4 relative">
          <div className="relative w-full group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-[#074139] transition-colors" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search actions, pages, orders..."
              className="w-full pl-10 pr-20 py-1.5 bg-gray-50/90 border border-gray-200 rounded-sm text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-all duration-200 focus:bg-white focus:border-[#074139]/40 focus:ring-4 focus:ring-[#074139]/5 shadow-xs"
            />
            {query ? (
              <button
                onClick={() => {
                  setQuery('')
                  setOpen(false)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[0.625rem] font-mono text-gray-400 bg-white border border-gray-200 rounded shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Search Dropdown Modal */}
          {open && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-30 animate-in fade-in-50 zoom-in-95 duration-150">
              {results.length > 0 ? (
                <div className="p-1.5 space-y-0.5">
                  <div className="px-3 py-1.5 text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                    Quick Navigation
                  </div>
                  {results.map((item, index) => {
                    const isSelected = index === selectedIndex
                    return (
                      <button
                        key={item.href}
                        onClick={() => goTo(item.href)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors text-left ${isSelected
                          ? 'bg-[#074139] text-white shadow-xs'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon
                            className={`h-4 w-4 ${isSelected ? 'text-[#59D0B5]' : 'text-gray-400'
                              }`}
                          />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <span
                          className={`text-xs ${isSelected ? 'text-emerald-200' : 'text-gray-400'
                            }`}
                        >
                          {item.href}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : query.trim() ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  <p>No matching page found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching for orders, products, or customers</p>
                </div>
              ) : (
                <div className="p-3 text-xs text-gray-400">
                  <p className="px-2 py-1 font-medium text-gray-500">Popular Shortcuts</p>
                  <div className="mt-1 space-y-1">
                    {ADMIN_NAV_ITEMS.slice(0, 4).map((item) => (
                      <button
                        key={item.href}
                        onClick={() => goTo(item.href)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-left transition-colors"
                      >
                        <item.icon className="h-3.5 w-3.5 text-gray-400" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Status Badge, Notifications, Profile Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Status Badge */}
          {/* <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-800 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Online</span>
          </div> */}

          {/* Notifications */}
          {/* <button
            aria-label="View notifications"
            className="relative w-10 h-10 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-[#074139]/20"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button> */}

          {/* Profile Card / Link */}
          <Link
            href="/admin/adminrole"
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-gray-50 border border-gray-200/80 hover:bg-gray-100/80 hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#074139] to-[#1A817F] text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-100 shrink-0">
              {userInitial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#074139] transition-colors leading-tight">
                {userName}
              </p>
              <p className="text-xs text-gray-600 font-medium leading-tight">Role: Admin</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
