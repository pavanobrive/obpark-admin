'use client'

import { useState } from 'react'
import { MoreVertical, Search, Filter, ArrowUpDown, MoreHorizontal, Plus } from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'
import { Header } from '@/components/admin/layout/Header'
import { useTransactions, useTransactionSummary } from '@/hooks/useTransactions'

const TABS = ['All order', 'Complete', 'Pending', 'Failed']

const STATUS_STYLE: Record<string, string> = {
  Complete: 'text-green-600', Pending: 'text-amber-600', Failed: 'text-red-500',
}

const STATUS_DOT: Record<string, string> = {
  Complete: 'bg-green-500', Pending: 'bg-amber-500', Failed: 'bg-red-500',
}

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState('All order')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data: summary } = useTransactionSummary()
  const { data, isLoading, isError } = useTransactions()
  const transactions = data?.transactions ?? []

  const filtered = transactions
    .filter((t) => activeTab === 'All order' || t.status === activeTab)
    .filter((t) => t.name?.toLowerCase().includes(search.toLowerCase()))

  const kpis = [
    { label: 'Total Revenue', value: summary ? `₹${summary.totalRevenue.toLocaleString('en-IN')}` : '—' },
    { label: 'Completed Transactions', value: summary?.completed ?? '—' },
    { label: 'Pending Transactions', value: summary?.pending ?? '—' },
    { label: 'Failed Transactions', value: summary?.failed ?? '—' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Transactions" onMenuClick={() => setDrawerOpen(true)} />

      <div className="p-6 space-y-6">
        {/* KPI cards + Payment method */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="bg-white border rounded-xl p-5 shadow-md">
                <div className="flex items-start justify-between">
                  <p className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-700`}>{k.label}</p>
                  <MoreVertical className="h-4 w-4 text-gray-300" />
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-1">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Payment Method card */}
          <div className="bg-white border rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <p className={`${microgrammaBold.className} font-semibold text-gray-800 text-[16px]`}>Payment Method</p>
              <MoreVertical className="h-4 w-4 text-gray-300" />
            </div>
            <div className="rounded-xl p-4 text-white mb-3" style={{ background: 'linear-gradient(135deg, #074139, #0f6b5c)' }}>
              <p className="text-xs opacity-80 mb-4">Razorpay / UPI Gateway</p>
              <p className="text-lg tracking-widest mb-3">•••• •••• •••• 2345</p>
              <div className="flex justify-between text-xs">
                <span>Obrive Merchant</span>
                <span>Active</span>
              </div>
            </div>
            <button className={`${microgrammaBold.className} w-full py-2 rounded-lg border text-[14px] text-gray-600 flex items-center justify-center gap-1.5`}>
              <Plus className="h-4 w-4" /> Add Payment Method
            </button>
          </div>
        </div>

        {/* Filter tabs + table */}
        <div className="bg-white border rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex bg-gray-50 rounded-lg p-1 text-sm overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                  style={activeTab === tab ? { color: '#074139' } : {}}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search payment history"
                  className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-48"
                />
              </div>
              <button className="p-2 rounded-lg border text-gray-500"><Filter className="h-4 w-4" /></button>
              <button className="p-2 rounded-lg border text-gray-500"><ArrowUpDown className="h-4 w-4" /></button>
              <button className="p-2 rounded-lg border text-gray-500"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-3 font-medium">Customer Id</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={7} className="py-6 text-center text-gray-400">Loading transactions...</td></tr>
                )}
                {isError && (
                  <tr><td colSpan={7} className="py-6 text-center text-red-500">Failed to load transactions</td></tr>
                )}
                {!isLoading && !isError && filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-6 text-center text-gray-400">No transactions found</td></tr>
                )}
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-3 text-gray-700">{t.customerId?.slice(0, 8) ?? '—'}</td>
                    <td className="py-3 text-gray-700 font-medium">{t.name}</td>
                    <td className="py-3 text-gray-500">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 text-gray-700">₹{Number(t.total).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-gray-600">{t.method}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[t.status] ?? 'bg-gray-400'}`} />
                        <span className={STATUS_STYLE[t.status] ?? 'text-gray-500'}>{t.status}</span>
                      </span>
                    </td>
                    <td className="py-3"><button className="text-blue-500 text-xs font-medium">View Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <button className={`${microgrammaBold.className} text-[16px] font-bold text-[#074139] bg-white rounded-[5px] shadow-sm px-4 py-2 leading-none`}>← Previous</button>
            <div className="flex gap-1 flex-wrap">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={`w-8 h-8 rounded-lg text-sm ${n === 1 ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`} style={n === 1 ? { backgroundColor: '#074139' } : {}}>{n}</button>
              ))}
            </div>
            <button className={`${microgrammaBold.className} text-[16px] font-bold text-[#074139] bg-white rounded-[5px] shadow-sm px-4 py-2 leading-none`}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}