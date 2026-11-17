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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  RotateCcw,
  CreditCard,
  ArrowRight,
  Package,
} from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'
import type { AdminOrder } from './types'

interface OrderOverviewProps {
  orders: AdminOrder[]
  isLoading?: boolean
  onSwitchToTable?: (filterStatus?: string) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Status visual mapping
const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#074139', // OBPARK Dark Emerald
  CONFIRMED: '#10b981', // Emerald
  SHIPPED: '#6366f1',   // Indigo
  PROCESSING: '#3b82f6',// Blue
  PENDING: '#f59e0b',   // Amber
  CANCELLED: '#ef4444', // Red
  REFUNDED: '#9ca3af',  // Gray
}

const STATUS_DISPLAY_NAMES: Record<string, string> = {
  DELIVERED: 'Delivered',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  PROCESSING: 'Processing',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}

export function OrderOverview({ orders, isLoading, onSwitchToTable }: OrderOverviewProps) {
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()) // 0-indexed
  const [trendMetric, setTrendMetric] = useState<'both' | 'orders' | 'revenue'>('both')

  // Month navigation handlers
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

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate()
  }, [selectedYear, selectedMonth])

  // Filter and aggregate orders for the selected month
  const {
    monthlyOrders,
    chartData,
    statusBreakdown,
    paymentBreakdown,
    totalOrdersCount,
    totalRevenue,
    deliveredCount,
    fulfillmentRate,
    averageOrderValue,
    pendingActionCount,
    recentActionableOrders,
  } = useMemo(() => {
    const inMonth: AdminOrder[] = []

    orders.forEach((o) => {
      if (!o.createdAt) {
        const isCurrent = selectedYear === now.getFullYear() && selectedMonth === now.getMonth()
        if (isCurrent) inMonth.push(o)
        return
      }
      const d = new Date(o.createdAt)
      if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
        inMonth.push(o)
      }
    })

    // Day bucket mapping
    const dayBuckets: Record<number, { orders: number; revenue: number }> = {}
    for (let day = 1; day <= daysInMonth; day++) {
      dayBuckets[day] = { orders: 0, revenue: 0 }
    }

    inMonth.forEach((o) => {
      const orderAmount = Number(o.total || o.totalAmount || 0)
      const isCancelled = o.status === 'CANCELLED' || o.status === 'REFUNDED'

      if (o.createdAt) {
        const day = new Date(o.createdAt).getDate()
        if (dayBuckets[day]) {
          dayBuckets[day].orders += 1
          if (!isCancelled) {
            dayBuckets[day].revenue += orderAmount
          }
        }
      } else {
        dayBuckets[1].orders += 1
        if (!isCancelled) {
          dayBuckets[1].revenue += orderAmount
        }
      }
    })

    let runningOrders = 0
    let runningRevenue = 0
    const chart = Object.keys(dayBuckets).map((dStr) => {
      const d = parseInt(dStr, 10)
      const count = dayBuckets[d].orders
      const rev = dayBuckets[d].revenue
      runningOrders += count
      runningRevenue += rev
      return {
        day: `${d}`,
        dateLabel: `${MONTH_NAMES[selectedMonth].slice(0, 3)} ${d}`,
        orders: count,
        revenue: rev,
        cumulativeOrders: runningOrders,
        cumulativeRevenue: runningRevenue,
      }
    })

    // Status breakdown
    const statusCounts: Record<string, number> = {}
    inMonth.forEach((o) => {
      const s = (o.status || 'PENDING').toUpperCase()
      statusCounts[s] = (statusCounts[s] || 0) + 1
    })

    const statusChartData = Object.entries(statusCounts).map(([statusKey, count]) => ({
      name: STATUS_DISPLAY_NAMES[statusKey] || statusKey,
      rawStatus: statusKey,
      value: count,
      color: STATUS_COLORS[statusKey] || '#94a3b8',
    }))

    // Payment breakdown
    let paidCount = 0
    let unpaidCount = 0
    inMonth.forEach((o) => {
      const pStatus = (o.payment?.status || o.paymentStatus || '').toUpperCase()
      if (pStatus === 'PAID' || pStatus === 'COMPLETED' || pStatus === 'SUCCESS') {
        paidCount++
      } else {
        unpaidCount++
      }
    })

    // Totals & KPIs
    const validOrders = inMonth.filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
    const rev = validOrders.reduce((acc, o) => acc + Number(o.total || o.totalAmount || 0), 0)
    const delivered = inMonth.filter(o => o.status === 'DELIVERED').length
    const confirmed = inMonth.filter(o => o.status === 'CONFIRMED' || o.status === 'SHIPPED').length
    const fulfilledTotal = delivered + confirmed
    const rate = inMonth.length > 0 ? Math.round((fulfilledTotal / inMonth.length) * 100) : 0
    const aov = validOrders.length > 0 ? Math.round(rev / validOrders.length) : 0
    const pendingAction = inMonth.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING')

    // Recent 5 actionable orders
    const actionable = [...pendingAction]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5)

    return {
      monthlyOrders: inMonth,
      chartData: chart,
      statusBreakdown: statusChartData,
      paymentBreakdown: { paid: paidCount, unpaid: unpaidCount },
      totalOrdersCount: inMonth.length,
      totalRevenue: rev,
      deliveredCount: delivered,
      fulfillmentRate: rate,
      averageOrderValue: aov,
      pendingActionCount: pendingAction.length,
      recentActionableOrders: actionable,
    }
  }, [orders, selectedYear, selectedMonth, daysInMonth, now])

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth()

  return (
    <div className="space-y-6">
      {/* Month Selection Bar */}
      <div className="bg-white border rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-[#074139]">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`${microgrammaBold.className} text-[1.125rem] font-bold text-gray-800`}>
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </h3>
              {isCurrentMonth && (
                <span className="text-[0.625rem] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Current Month
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Select any past or active month to analyze order performance and trends
            </p>
          </div>
        </div>

        {/* Controls: Prev / DatePicker / Next / Today */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-md hover:bg-white hover:shadow-xs text-gray-600 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <label className="relative cursor-pointer px-2 py-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#074139]">
              <input
                type="month"
                value={monthInputFormatted}
                onChange={handleDateInputChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span>Calendar</span>
            </label>

            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 rounded-md hover:bg-white hover:shadow-xs text-gray-600 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={handleResetToCurrentMonth}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-[#074139] hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              This Month
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards for the Month */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-start justify-between">
            <p className="text-xs text-gray-400 font-medium">Orders Placed</p>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#074139]">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {isLoading ? '—' : totalOrdersCount}
          </p>
          <p className="text-[0.6875rem] text-gray-400 mt-1">In {MONTH_NAMES[selectedMonth].slice(0, 3)}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-start justify-between">
            <p className="text-xs text-gray-400 font-medium">Net Revenue</p>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {isLoading ? '—' : `₹${totalRevenue.toLocaleString()}`}
          </p>
          <p className="text-[0.6875rem] text-teal-700 font-medium mt-1">Excludes cancelled</p>
        </div>

        {/* Fulfillment Rate */}
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-start justify-between">
            <p className="text-xs text-gray-400 font-medium">Fulfillment Rate</p>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {isLoading ? '—' : `${fulfillmentRate}%`}
          </p>
          <p className="text-[0.6875rem] text-blue-600 font-medium mt-1">{deliveredCount} delivered</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-start justify-between">
            <p className="text-xs text-gray-400 font-medium">Avg Order Value</p>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {isLoading ? '—' : `₹${averageOrderValue.toLocaleString()}`}
          </p>
          <p className="text-[0.6875rem] text-gray-400 mt-1">Per active order</p>
        </div>

        {/* Action Needed (Pending/Processing) */}
        <div className="bg-white border rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <p className="text-xs text-gray-400 font-medium">Pending Action</p>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {isLoading ? '—' : pendingActionCount}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[0.6875rem] text-gray-400">Processing or pending</span>
            {onSwitchToTable && pendingActionCount > 0 && (
              <button
                onClick={() => onSwitchToTable('Pending')}
                className="text-[0.6875rem] text-blue-600 hover:underline flex items-center gap-0.5"
              >
                Inspect <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts Row: Trend Graph + Status Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Daily Order Trends Area Chart */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className={`${microgrammaBold.className} text-[1rem] font-bold text-gray-800`}>
                Order Volume & Revenue Velocity
              </h4>
              <p className="text-xs text-gray-400">
                Daily order generation curve for {MONTH_NAMES[selectedMonth]} {selectedYear}
              </p>
            </div>

            {/* Metric toggles */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setTrendMetric('both')}
                className={`px-3 py-1 rounded-md transition-all ${
                  trendMetric === 'both' ? 'bg-white text-[#074139] shadow-xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Combined
              </button>
              <button
                onClick={() => setTrendMetric('orders')}
                className={`px-3 py-1 rounded-md transition-all ${
                  trendMetric === 'orders' ? 'bg-white text-[#074139] shadow-xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setTrendMetric('revenue')}
                className={`px-3 py-1 rounded-md transition-all ${
                  trendMetric === 'revenue' ? 'bg-white text-[#074139] shadow-xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Revenue (₹)
              </button>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                Loading order trends...
              </div>
            ) : totalOrdersCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                <Package className="h-8 w-8 text-gray-300 mb-2" />
                <p>No orders recorded in {MONTH_NAMES[selectedMonth]} {selectedYear}</p>
                <p className="text-[0.6875rem] text-gray-400 mt-1">Use the calendar navigation above to check other months</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#074139" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#074139" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    yAxisId="orders"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  {(trendMetric === 'revenue' || trendMetric === 'both') && (
                    <YAxis
                      yAxisId="revenue"
                      orientation="right"
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                  )}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const row = payload[0].payload
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-gray-800">{row.dateLabel}, {selectedYear}</p>
                          <div className="flex items-center gap-2 text-emerald-800 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#074139]" />
                            <span>Orders: {row.orders}</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600 font-medium">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>Revenue: ₹{row.revenue.toLocaleString()}</span>
                          </div>
                          <div className="text-[0.6875rem] text-gray-400 pt-1 border-t border-gray-100">
                            Cumulative: {row.cumulativeOrders} orders (₹{row.cumulativeRevenue.toLocaleString()})
                          </div>
                        </div>
                      )
                    }}
                  />
                  {(trendMetric === 'orders' || trendMetric === 'both') && (
                    <Area
                      yAxisId="orders"
                      type="monotone"
                      dataKey="orders"
                      stroke="#074139"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#orderGrad)"
                      name="Orders"
                    />
                  )}
                  {(trendMetric === 'revenue' || trendMetric === 'both') && (
                    <Area
                      yAxisId={trendMetric === 'both' ? 'revenue' : 'orders'}
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray={trendMetric === 'both' ? '4 2' : undefined}
                      fillOpacity={1}
                      fill="url(#revGrad)"
                      name="Revenue"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right (1 col): Order Statuses Pie / Donut Chart */}
        <div className="bg-white border rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className={`${microgrammaBold.className} text-[1rem] font-bold text-gray-800`}>
                Order Status Distribution
              </h4>
              <span className="text-[0.6875rem] text-gray-400 font-medium">
                {totalOrdersCount} total
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Live lifecycle breakdown for this month
            </p>
          </div>

          <div className="h-[210px] w-full relative flex items-center justify-center">
            {isLoading ? (
              <div className="text-gray-400 text-xs">Loading statuses...</div>
            ) : statusBreakdown.length === 0 ? (
              <div className="text-center text-gray-400 text-xs">
                No orders in this period
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const item = payload[0].payload
                        const pct = totalOrdersCount > 0 ? Math.round((item.value / totalOrdersCount) * 100) : 0
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-md text-xs">
                            <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </p>
                            <p className="text-gray-600 mt-1">
                              {item.value} order{item.value === 1 ? '' : 's'} ({pct}%)
                            </p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-gray-800">{totalOrdersCount}</span>
                  <span className="text-[0.625rem] text-gray-400 uppercase tracking-wider">Orders</span>
                </div>
              </>
            )}
          </div>

          {/* Status Breakdown Legend & Quick Action */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100 max-h-[140px] overflow-y-auto">
            {statusBreakdown.map((item) => {
              const pct = totalOrdersCount > 0 ? Math.round((item.value / totalOrdersCount) * 100) : 0
              return (
                <div
                  key={item.name}
                  onClick={() => onSwitchToTable && onSwitchToTable(item.rawStatus)}
                  className={`flex items-center justify-between text-xs py-1 px-1.5 rounded-md hover:bg-gray-50 transition-colors ${
                    onSwitchToTable ? 'cursor-pointer' : ''
                  }`}
                  title={onSwitchToTable ? `Click to filter table by ${item.name}` : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-semibold">{item.value}</span>
                    <span className="text-[0.6875rem] text-gray-400 w-8 text-right">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Payment Breakdown & Action Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Summary */}
        <div className="bg-white border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`${microgrammaBold.className} text-[0.9375rem] font-bold text-gray-800`}>
              Payment Reconciliation
            </h4>
            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Payment confirmation ratio for orders initiated in this month
          </p>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-3">
              <p className="text-[0.6875rem] font-semibold text-emerald-800 uppercase tracking-wider">
                Paid / Settled
              </p>
              <p className="text-xl font-bold text-emerald-900 mt-1">
                {paymentBreakdown.paid}
              </p>
              <p className="text-[0.625rem] text-emerald-700 mt-0.5">
                {totalOrdersCount > 0
                  ? `${Math.round((paymentBreakdown.paid / totalOrdersCount) * 100)}% of month`
                  : '—'}
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-3">
              <p className="text-[0.6875rem] font-semibold text-amber-800 uppercase tracking-wider">
                Unpaid / Pending
              </p>
              <p className="text-xl font-bold text-amber-900 mt-1">
                {paymentBreakdown.unpaid}
              </p>
              <p className="text-[0.625rem] text-amber-700 mt-0.5">
                {totalOrdersCount > 0
                  ? `${Math.round((paymentBreakdown.unpaid / totalOrdersCount) * 100)}% of month`
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Items: Orders Needing Attention */}
        <div className="bg-white border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`${microgrammaBold.className} text-[0.9375rem] font-bold text-gray-800`}>
                Action Items ({pendingActionCount})
              </h4>
              <p className="text-xs text-gray-400">
                Orders in Pending or Processing state awaiting fulfillment
              </p>
            </div>
            {onSwitchToTable && (
              <button
                onClick={() => onSwitchToTable('Pending')}
                className="text-xs text-[#074139] hover:underline font-semibold flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="space-y-2 pt-1">
            {recentActionableOrders.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                All orders in this month are fulfilled or closed!
              </div>
            ) : (
              recentActionableOrders.map((order) => {
                const customerName = order.customerName ||
                  (order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : '') ||
                  order.email ||
                  'Guest Buyer'
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 transition-all text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {order.orderNumber || `#${order.id.slice(0, 8)}`}
                        </span>
                        <span
                          className={`text-[0.625rem] px-1.5 py-0.5 rounded font-bold uppercase ${
                            order.status === 'PROCESSING'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[0.6875rem] mt-0.5 truncate max-w-[200px]">
                        {customerName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ₹{Number(order.total || order.totalAmount || 0).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-[0.625rem]">
                        {order.items?.length || 1} item{(order.items?.length || 1) === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
