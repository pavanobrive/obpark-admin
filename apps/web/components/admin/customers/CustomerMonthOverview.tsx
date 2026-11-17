'use client'

import React, { useState, useMemo } from 'react'
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
  Users,
  UserCheck,
  CreditCard,
  MapPin,
  Sparkles,
  ShoppingBag,
} from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'
import type { Customer } from './types'

interface CustomerMonthOverviewProps {
  customers: Customer[]
  isLoading?: boolean
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function CustomerMonthOverview({ customers, isLoading }: CustomerMonthOverviewProps) {
  // Current date as reference default
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()) // 0-indexed

  // Quick navigation handlers
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

  // Format YYYY-MM for native month picker input
  const monthInputFormatted = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`

  // Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate()
  }, [selectedYear, selectedMonth])

  // Process customer data for the selected month
  const {
    monthlyCustomers,
    chartData,
    totalNewCustomers,
    activeCount,
    totalMonthlySpend,
    totalOrders,
    cityBreakdown,
    statusBreakdown,
  } = useMemo(() => {
    // Filter customers whose registration falls in the selected month
    const inMonth: Customer[] = []

    customers.forEach((c) => {
      if (!c.createdAt) {
        // Fallback: If no createdAt is recorded, consider in current month if selected is current
        const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth()
        if (isCurrentMonth) inMonth.push(c)
        return
      }

      const createdDate = new Date(c.createdAt)
      if (
        createdDate.getFullYear() === selectedYear &&
        createdDate.getMonth() === selectedMonth
      ) {
        inMonth.push(c)
      }
    })

    // Group by day of the month (1 to daysInMonth)
    const dayBuckets: Record<number, { count: number; spend: number }> = {}
    for (let day = 1; day <= daysInMonth; day++) {
      dayBuckets[day] = { count: 0, spend: 0 }
    }

    inMonth.forEach((c) => {
      if (c.createdAt) {
        const d = new Date(c.createdAt).getDate()
        if (dayBuckets[d]) {
          dayBuckets[d].count += 1
          dayBuckets[d].spend += c.totalSpend || 0
        }
      } else {
        // If customer has no exact timestamp, distribute on 1st of month
        dayBuckets[1].count += 1
        dayBuckets[1].spend += c.totalSpend || 0
      }
    })

    let runningTotal = 0
    const chart = Object.keys(dayBuckets).map((dStr) => {
      const d = parseInt(dStr, 10)
      const newUsers = dayBuckets[d].count
      runningTotal += newUsers
      return {
        day: `${d}`,
        dateLabel: `${MONTH_NAMES[selectedMonth].slice(0, 3)} ${d}`,
        newUsers,
        cumulative: runningTotal,
        spend: dayBuckets[d].spend,
      }
    })

    // Metrics calculation
    const totalNew = inMonth.length
    const active = inMonth.filter((c) => c.status === 'Active' || c.status === 'VIP').length
    const spend = inMonth.reduce((acc, c) => acc + (c.totalSpend || 0), 0)
    const orders = inMonth.reduce((acc, c) => acc + (c.orderCount || 0), 0)

    // City distribution
    const cities: Record<string, number> = {}
    inMonth.forEach((c) => {
      const city = c.city && c.city !== '—' ? c.city : 'Not Specified'
      cities[city] = (cities[city] || 0) + 1
    })

    const topCities = Object.entries(cities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Status distribution
    const statuses = {
      Active: inMonth.filter((c) => c.status === 'Active').length,
      VIP: inMonth.filter((c) => c.status === 'VIP').length,
      Inactive: inMonth.filter((c) => c.status === 'Inactive').length,
    }

    return {
      monthlyCustomers: inMonth,
      chartData: chart,
      totalNewCustomers: totalNew,
      activeCount: active,
      totalMonthlySpend: spend,
      totalOrders: orders,
      cityBreakdown: topCities,
      statusBreakdown: statuses,
    }
  }, [customers, selectedYear, selectedMonth, daysInMonth, now])

  const selectedMonthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
  const isSelectedCurrent = selectedYear === now.getFullYear() && selectedMonth === now.getMonth()

  return (
    <div className="space-y-6">
      {/* Month Picker Header & Controls Capsule */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#074139] border border-emerald-100">
              <CalendarIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className={`${microgrammaBold.className} text-[1.125rem] font-bold text-gray-800 flex items-center gap-2`}>
                <span>{selectedMonthLabel}</span>
                {isSelectedCurrent && (
                  <span className="text-[0.625rem] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 tracking-normal font-sans">
                    Current Month
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">
                Monthly customer acquisition, engagement, and spend analytics
              </p>
            </div>
          </div>
        </div>

        {/* Calendar & Navigation Controls */}
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

            {/* Native Calendar Month Picker Input with Custom Visual Pill */}
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

      {/* Monthly KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Signups */}
        <div className="bg-white border rounded-xl p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">New Customers</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {isLoading ? '—' : totalNewCustomers}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#074139]">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[0.6875rem] text-emerald-700 font-medium mt-3 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Registered in {MONTH_NAMES[selectedMonth].slice(0, 3)} {selectedYear}</span>
          </p>
        </div>

        {/* Metric 2: Active / Verified Rate */}
        <div className="bg-white border rounded-xl p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {isLoading ? '—' : activeCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[0.6875rem] text-gray-400 mt-3">
            {totalNewCustomers > 0
              ? `${Math.round((activeCount / totalNewCustomers) * 100)}% engagement rate`
              : '0% in selected month'}
          </p>
        </div>

        {/* Metric 3: Total Monthly Spend */}
        <div className="bg-white border rounded-xl p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Customer Spend</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                ₹{isLoading ? '—' : totalMonthlySpend.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[0.6875rem] text-gray-400 mt-3">
            Purchases by cohort members
          </p>
        </div>

        {/* Metric 4: Total Orders in Cohort */}
        <div className="bg-white border rounded-xl p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {isLoading ? '—' : totalOrders}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[0.6875rem] text-gray-400 mt-3">
            {totalNewCustomers > 0
              ? `Avg ${(totalOrders / totalNewCustomers).toFixed(1)} orders / user`
              : '0 orders'}
          </p>
        </div>
      </div>

      {/* Main Area Chart: Daily Registration Trend across the Month */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h4 className={`${microgrammaBold.className} text-base font-bold text-gray-800`}>
              Daily Customer Registration Curve
            </h4>
            <p className="text-xs text-gray-400">
              Day 1 to Day {daysInMonth} of {selectedMonthLabel}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#074139]" />
              <span className="text-gray-600 font-medium">Daily New Signups</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-gray-400">Cumulative</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-56 flex items-center justify-center text-sm text-gray-400">
            Loading monthly overview...
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="monthCustomerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#074139" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#074139" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="monthCumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#59D0B5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#59D0B5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  stroke="#94A3B8"
                  interval={Math.floor(daysInMonth / 10)}
                  tickFormatter={(val) => `D${val}`}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  stroke="#94A3B8"
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white/95 backdrop-blur-xs border border-gray-200 p-3 rounded-xl shadow-lg text-xs">
                          <p className="font-bold text-gray-800">{data.dateLabel}, {selectedYear}</p>
                          <div className="mt-1.5 space-y-1">
                            <p className="text-emerald-800 font-semibold flex items-center justify-between gap-4">
                              <span>New Signups:</span>
                              <span>{data.newUsers}</span>
                            </p>
                            <p className="text-gray-500 flex items-center justify-between gap-4">
                              <span>Cumulative Total:</span>
                              <span>{data.cumulative}</span>
                            </p>
                            {data.spend > 0 && (
                              <p className="text-amber-700 flex items-center justify-between gap-4 pt-1 border-t border-gray-100">
                                <span>Day Spend:</span>
                                <span>₹{data.spend.toLocaleString('en-IN')}</span>
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
                  dataKey="newUsers"
                  stroke="#074139"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#monthCustomerGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#59D0B5"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#monthCumulativeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Secondary Row: Status Composition & Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`${microgrammaBold.className} text-sm font-bold text-gray-800 flex items-center gap-2`}>
              <Sparkles className="h-4 w-4 text-[#074139]" />
              <span>Customer Status Breakdown</span>
            </h4>
            <span className="text-xs text-gray-400">{selectedMonthLabel}</span>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Active Customers',
                count: statusBreakdown.Active,
                color: 'bg-emerald-500',
                badgeBg: 'bg-emerald-50 text-emerald-800',
              },
              {
                label: 'VIP Members',
                count: statusBreakdown.VIP,
                color: 'bg-amber-500',
                badgeBg: 'bg-amber-50 text-amber-800',
              },
              {
                label: 'Inactive / Pending',
                count: statusBreakdown.Inactive,
                color: 'bg-gray-400',
                badgeBg: 'bg-gray-50 text-gray-600',
              },
            ].map((item) => {
              const pct = totalNewCustomers > 0
                ? Math.round((item.count / totalNewCustomers) * 100)
                : 0
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <span className="text-gray-500 font-mono">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${Math.max(pct, item.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Geographic / Top Cities Distribution */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`${microgrammaBold.className} text-sm font-bold text-gray-800 flex items-center gap-2`}>
              <MapPin className="h-4 w-4 text-[#074139]" />
              <span>Top Locations ({selectedMonthLabel})</span>
            </h4>
            <span className="text-xs text-gray-400">By City</span>
          </div>

          {cityBreakdown.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              No geographical customer data recorded for this month
            </p>
          ) : (
            <div className="space-y-3">
              {cityBreakdown.map(([city, count]) => {
                const max = cityBreakdown[0][1] || 1
                const pct = Math.round((count / max) * 100)
                return (
                  <div key={city} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800">{city}</span>
                      <span className="text-gray-500 font-mono">{count} customers</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#074139] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
