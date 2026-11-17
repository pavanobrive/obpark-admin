'use client'

import React, { useState, useEffect, useRef, useMemo, memo } from 'react'
import { Search, ChevronDown, Check, X, Loader2 } from 'lucide-react'
import { useTaxes, TaxMasterItem } from '@/hooks/useAdminProducts'

export const STANDARD_TAX_BRACKETS: TaxMasterItem[] = [
  {
    code: 'GST_18',
    description: 'Most goods & services, automotive parts, IT & electronics',
    type: 'GST',
    gstRate: 18,
  },
  {
    code: 'GST_5',
    description: 'Packaged foods, basic household items, budget transport',
    type: 'GST',
    gstRate: 5,
  },
  {
    code: 'GST_40',
    description: 'Premium cars, luxury goods, aerated drinks (Luxury/Sin)',
    type: 'GST',
    gstRate: 40,
  },
  {
    code: 'GST_0',
    description: 'Essential fresh foods, milk, healthcare, education (Exempt)',
    type: 'GST',
    gstRate: 0,
  },
]

interface HsnTaxSelectProps {
  value?: string
  currentGstRate?: number
  onChange: (code: string, item?: TaxMasterItem | null) => void
  disabled?: boolean
  className?: string
}

export const HsnTaxSelect = memo(function HsnTaxSelect({
  value = '',
  currentGstRate,
  onChange,
  disabled = false,
  className = '',
}: HsnTaxSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search query to prevent unnecessary network requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim())
    }, 200)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch taxes with search query and guarantee currently selected code is present
  const { data: taxes = [], isLoading } = useTaxes(
    debouncedQuery || undefined,
    value || undefined
  )

  // Find currently selected tax item
  const selectedTax = useMemo(() => {
    if (!value) return null
    // 1. Check standard brackets first
    const bracket = STANDARD_TAX_BRACKETS.find(
      (b) =>
        b.code.toLowerCase() === value.toLowerCase() ||
        b.code.replace('GST_', '') === value ||
        (b.code === `GST_${currentGstRate}` && !value.match(/^\d{4,8}$/))
    )
    if (bracket) return bracket

    // 2. Check fetched taxes
    return taxes.find((t) => t.code.toLowerCase() === value.toLowerCase()) || null
  }, [value, taxes, currentGstRate])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setSearchInput('')
      setDebouncedQuery('')
    }
  }, [isOpen])

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (code: string, item: TaxMasterItem | null) => {
    onChange(code, item)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    const defaultBracket = STANDARD_TAX_BRACKETS[0]
    onChange('GST_18', defaultBracket)
  }

  // Filtered standard brackets based on search input
  const filteredBrackets = useMemo(() => {
    if (!searchInput.trim()) return STANDARD_TAX_BRACKETS
    const q = searchInput.toLowerCase()
    return STANDARD_TAX_BRACKETS.filter(
      (b) =>
        b.description.toLowerCase().includes(q) ||
        `${b.gstRate}%`.includes(q) ||
        String(b.gstRate).includes(q) ||
        b.code.toLowerCase().includes(q)
    )
  }, [searchInput])

  const displayRate = selectedTax?.gstRate !== undefined
    ? Number(selectedTax.gstRate)
    : (currentGstRate !== undefined ? currentGstRate : 18)

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-h-[2.5rem] px-3 py-2 bg-white rounded-lg border text-sm text-left flex items-center justify-between gap-2 transition-all outline-none focus:border-[#074139] disabled:opacity-50 disabled:bg-gray-50"
      >
        <div className="flex-1 min-w-0">
          {selectedTax ? (
            <div className="flex items-center gap-2 truncate">
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 shrink-0 font-semibold">
                {selectedTax.type} {selectedTax.code.startsWith('GST_') ? `${selectedTax.gstRate}%` : selectedTax.code}
              </span>
              <span className="truncate text-gray-800 text-xs sm:text-sm font-medium">
                {selectedTax.description}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                {Number(selectedTax.gstRate)}% GST
              </span>
            </div>
          ) : value ? (
            <div className="flex items-center gap-2 truncate">
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 shrink-0 font-semibold">
                HSN {value}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                {displayRate}% GST
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-800 text-sm font-medium">18%: Most goods & services</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                18% GST (Default)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-gray-400">
          {value && value !== 'GST_18' && (
            <span
              onClick={handleClear}
              className="p-1 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              title="Reset to 18% default"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#074139]' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tax slab (0%, 5%, 18%, 40%) or HSN code..."
              className="w-full bg-transparent text-xs sm:text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#074139] shrink-0" />}
            {searchInput && !isLoading && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List of Options */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 text-xs sm:text-sm">
            {/* Standard GST Slabs Section */}
            {filteredBrackets.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-gray-100/70 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Four Main GST Tax Brackets
                </div>
                {filteredBrackets.map((bracket) => {
                  const isSelected =
                    value === bracket.code ||
                    (!value && bracket.code === 'GST_18') ||
                    (selectedTax?.gstRate === bracket.gstRate && value.startsWith('GST_'))

                  return (
                    <div
                      key={bracket.code}
                      onClick={() => handleSelect(bracket.code, bracket)}
                      className={`px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-emerald-50/60 transition-colors ${
                        isSelected ? 'bg-emerald-50 text-[#074139] font-medium' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className={`font-bold text-xs px-2 py-0.5 rounded shrink-0 ${
                            bracket.gstRate === 40
                              ? 'bg-rose-100 text-rose-800'
                              : bracket.gstRate === 18
                              ? 'bg-emerald-100 text-emerald-800'
                              : bracket.gstRate === 5
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {bracket.gstRate}% GST
                        </span>
                        <span className="text-xs text-gray-800 line-clamp-1">
                          {bracket.description}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#074139] shrink-0" />}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Queried HSN Codes Section */}
            {taxes.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-gray-100/70 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Specific Automotive & Ecommerce HSN Codes
                </div>
                {taxes.map((t) => {
                  const isSelected = value === t.code
                  return (
                    <div
                      key={t.code}
                      onClick={() => handleSelect(t.code, t)}
                      className={`px-3 py-2.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-emerald-50/60 transition-colors ${
                        isSelected ? 'bg-emerald-50 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold shrink-0">
                            {t.type} {t.code}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                            {Number(t.gstRate)}% GST
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#074139] shrink-0 mt-1" />}
                    </div>
                  )
                })}
              </div>
            )}

            {filteredBrackets.length === 0 && taxes.length === 0 && !isLoading && (
              <div className="py-6 text-center text-xs text-gray-400">
                No matching HSN or tax bracket found for &quot;{searchInput}&quot;.
              </div>
            )}
          </div>

          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
            <span>Choose 0%, 5%, 18%, or 40% (Luxury/Sin) bracket, or search specific HSN</span>
          </div>
        </div>
      )}
    </div>
  )
})
