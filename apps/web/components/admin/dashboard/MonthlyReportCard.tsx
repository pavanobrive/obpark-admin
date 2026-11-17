'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Users,
  Package,
} from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'
import { api } from '@/lib/api'

interface MonthlyTrendItem {
  day: string
  dateLabel?: string
  value: number
  ordersCount?: number
}

interface MonthlyReportCardProps {
  stats?: {
    totalUsers: number
    totalProducts: number
    stockProducts: number
    outOfStockProducts: number
    totalRevenue: number
  }
  statsLoading?: boolean
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function MonthlyReportCard({ stats, statsLoading }: MonthlyReportCardProps) {
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()) // 0-indexed

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear((y) => y - 1)
    } else {
      setSelectedMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear((y) => y + 1)
    } else {
      setSelectedMonth((m) => m + 1)
    }
  }

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return
    const [yearStr, monthStr] = e.target.value.split('-')
    const parsedYear = parseInt(yearStr, 10)
    const parsedMonth = parseInt(monthStr, 10) - 1
    if (!isNaN(parsedYear) && !isNaN(parsedMonth)) {
      setSelectedYear(parsedYear)
      setSelectedMonth(parsedMonth)
    }
  }

  const handleResetToCurrentMonth = () => {
    setSelectedYear(now.getFullYear())
    setSelectedMonth(now.getMonth())
  }

  const monthInputFormatted = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`
  const selectedMonthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
  const isSelectedCurrent = selectedYear === now.getFullYear() && selectedMonth === now.getMonth()

  // Fetch monthly revenue trend from backend
  const { data: trendData = [], isLoading: trendLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'revenue-trend', selectedYear, selectedMonth + 1],
    queryFn: () =>
      api.get<MonthlyTrendItem[]>(
        `/admin/analytics/revenue-trend?year=${selectedYear}&month=${selectedMonth + 1}`
      ),
  })

  // Calculate monthly aggregates
  const { totalMonthRevenue, totalMonthOrders, peakDay } = useMemo(() => {
    let rev = 0
    let orders = 0
    let peak: { day: string; value: number } | null = null

    trendData.forEach((item) => {
      rev += item.value || 0
      orders += item.ordersCount || 0
      if (!peak || item.value > peak.value) {
        peak = { day: item.day, value: item.value }
      }
    })

    return {
      totalMonthRevenue: rev,
      totalMonthOrders: orders,
      peakDay: peak,
    }
  }, [trendData])

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate()
  }, [selectedYear, selectedMonth])

  const hasAnyRevenue = trendData.some((d) => d.value > 0)

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
      {/* Header with Title and Month Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`${microgrammaBold.className} font-bold text-[1.125rem] text-gray-800`}>
              Report for {selectedMonthLabel}
            </h2>
            {isSelectedCurrent && (
              <span className="text-[0.625rem] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                This Month
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Daily revenue performance, order volume, and platform activity
          </p>
        </div>

        {/* Calendar Picker Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-lg text-gray-600 hover:text-[#074139] hover:bg-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Native Calendar Month Picker Input */}
            <div className="relative mx-1">
              <input
                type="month"
                value={monthInputFormatted}
                onChange={handleDateInputChange}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                title="Select month from calendar"
              />
              <div className="px-3 py-1 bg-white border border-gray-200/90 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs flex items-center gap-1.5 cursor-pointer hover:border-[#074139] transition-colors">
                <CalendarIcon className="h-3.5 w-3.5 text-[#074139]" />
                <span>Pick Month</span>
              </div>
            </div>

            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-lg text-gray-600 hover:text-[#074139] hover:bg-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {!isSelectedCurrent && (
            <button
              onClick={handleResetToCurrentMonth}
              className="px-3 py-1.5 text-xs font-medium text-[#074139] bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl transition-colors shadow-2xs"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex gap-4 sm:gap-6 pb-3 border-b border-gray-100 overflow-x-auto custom-scrollbar">
        {/* Month Revenue */}
        <div className="shrink-0 border-b-2 border-[#074139] pb-1">
          <p className="text-[1rem] font-bold text-gray-900">
            {trendLoading ? '—' : `₹${totalMonthRevenue.toLocaleString('en-IN')}`}
          </p>
          <p className="text-xs text-gray-600 font-medium">Month Revenue</p>
        </div>

        {/* Month Orders */}
        <div className="shrink-0 pb-1">
          <p className="text-[1rem] font-bold text-gray-800">
            {trendLoading ? '—' : totalMonthOrders.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 font-medium">Month Orders</p>
        </div>

        {/* Total Customers */}
        <div className="shrink-0 pb-1">
          <p className="text-[1rem] font-bold text-gray-800">
            {statsLoading ? '—' : (stats?.totalUsers ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 font-medium">Total Customers</p>
        </div>

        {/* Total Catalog Products */}
        <div className="shrink-0 pb-1">
          <p className="text-[1rem] font-bold text-gray-800">
            {statsLoading ? '—' : (stats?.totalProducts ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 font-medium">Catalog Products</p>
        </div>

        {/* In-Stock vs Out of Stock */}
        <div className="shrink-0 pb-1">
          <p className="text-[1rem] font-bold text-emerald-700">
            {statsLoading ? '—' : (stats?.stockProducts ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 font-medium">In Stock</p>
        </div>
      </div>

      {/* Daily Revenue Trend Area Chart across the Month */}
      <div className="pt-2">
        {trendLoading ? (
          <div className="h-44 flex items-center justify-center text-xs text-gray-600 font-medium">
            Loading {selectedMonthLabel} revenue curve...
          </div>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardMonthRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#074139" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A2F1DF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  fontSize={9}
                  stroke="#94A3B8"
                  interval={Math.floor(daysInMonth / 10)}
                  tickFormatter={(val) => `D${val}`}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={9}
                  stroke="#94A3B8"
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as MonthlyTrendItem
                      return (
                        <div className="bg-white/95 backdrop-blur-xs border border-gray-200 p-2.5 rounded-xl shadow-lg text-xs">
                          <p className="font-bold text-gray-800">
                            {d.dateLabel || `Day ${d.day}`}, {selectedYear}
                          </p>
                          <div className="mt-1 space-y-0.5">
                            <p className="text-emerald-800 font-semibold flex items-center justify-between gap-4">
                              <span>Revenue:</span>
                              <span>₹{Number(d.value).toLocaleString('en-IN')}</span>
                            </p>
                            {d.ordersCount !== undefined && (
                              <p className="text-gray-500 flex items-center justify-between gap-4">
                                <span>Paid Orders:</span>
                                <span>{d.ordersCount}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#074139"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#dashboardMonthRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {!trendLoading && !hasAnyRevenue && (
          <p className="text-xs text-gray-400 text-center mt-2">
            No paid orders recorded in {selectedMonthLabel} yet
          </p>
        )}
      </div>
    </div>
  )
}
