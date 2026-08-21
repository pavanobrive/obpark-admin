'use client'

import { useState } from 'react'
import { MoreVertical, Search, Filter, ArrowUpDown, MoreHorizontal, Plus } from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'
import { Header } from '@/components/admin/layout/Header'

const TABS = ['All order', 'Completed', 'Pending', 'Canceled']

// TODO: replace with real payment/FASTag recharge data — check against FastagModule / recharge_transactions table
const TRANSACTIONS = [
  { id: '#CUST001', name: 'Ravi Kumar', date: '01-01-2025', total: 2904, method: 'UPI', status: 'Complete' },
  { id: '#CUST002', name: 'Priya Sharma', date: '01-01-2025', total: 2904, method: 'Card', status: 'Complete' },
  { id: '#CUST003', name: 'Arjun Reddy', date: '01-01-2025', total: 2904, method: 'UPI', status: 'Complete' },
  { id: '#CUST004', name: 'Sneha Iyer', date: '01-01-2025', total: 2904, method: 'Netbanking', status: 'Complete' },
  { id: '#CUST005', name: 'Vikram Singh', date: '01-01-2025', total: 2904, method: 'Card', status: 'Canceled' },
  { id: '#CUST006', name: 'Anjali Nair', date: '01-01-2025', total: 2904, method: 'UPI', status: 'Pending' },
]

const STATUS_STYLE: Record<string, string> = {
  Complete: 'text-green-600', Pending: 'text-amber-600', Canceled: 'text-red-500',
}

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState('All order')
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Transactions" onMenuClick={() => setDrawerOpen(true)} />

      <div className="p-6 space-y-6">
        {/* KPI cards + Payment method */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {[
              { label: 'Total Revenue', value: '—', trend: 'needs backend' },
              { label: 'Completed Transactions', value: '—', trend: 'needs backend' },
              { label: 'Pending Transactions', value: '—', trend: 'needs backend' },
              { label: 'Failed Transactions', value: '—', trend: 'needs backend' },
            ].map((k) => (
              <div key={k.label} className="bg-white border rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <p className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-700`}>{k.label}</p>
                  <MoreVertical className="h-4 w-4 text-gray-300" />
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-1">{k.value}</p>
                <p className="text-xs text-gray-400 mt-1">{k.trend}</p>
              </div>
            ))}
          </div>

          {/* Payment Method card */}
          <div className="bg-white border rounded-xl p-5">
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
        <div className="bg-white border rounded-xl p-4">
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
                <input placeholder="Search payment history" className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-48" />
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
                {TRANSACTIONS.map((t, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 text-gray-700">{t.id}</td>
                    <td className="py-3 text-gray-700 font-medium">{t.name}</td>
                    <td className="py-3 text-gray-500">{t.date}</td>
                    <td className="py-3 text-gray-700">₹{t.total.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-gray-600">{t.method}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${t.status === 'Complete' ? 'bg-green-500' : t.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className={STATUS_STYLE[t.status]}>{t.status}</span>
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