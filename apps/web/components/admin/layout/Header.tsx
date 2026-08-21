'use client'

import { Search, Bell, Sun, Menu } from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <div className="bg-white border-b px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <button onClick={onMenuClick} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden mr-2">
        <Menu className="h-5 w-5" />
      </button>

      <h1 className={`${microgrammaBold.className} text-[24px] font-bold text-gray-800 shrink-0`}>{title}</h1>

      <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search data, users, or reports"
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden sm:flex w-9 h-9 rounded-full bg-gray-50 border items-center justify-center">
          <Bell className="h-4 w-4 text-gray-500" />
        </button>
        <button className="hidden sm:flex w-9 h-9 rounded-full bg-gray-50 border items-center justify-center">
          <Sun className="h-4 w-4 text-gray-500" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gray-300" />
      </div>
    </div>
  )
}