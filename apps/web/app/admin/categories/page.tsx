'use client'

import { useState } from 'react'
import { Plus, MoreVertical, Search, Filter, ArrowUpDown, MoreHorizontal, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'
import { Header } from '@/components/admin/layout/Header'

const CATEGORY_TILES = [
  { name: 'Engine Parts', icon: '🔧' },
  { name: 'Brakes & Suspension', icon: '🛞' },
  { name: 'Electrical', icon: '🔋' },
  { name: 'Body & Exterior', icon: '🚗' },
  { name: 'Interior', icon: '💺' },
  { name: 'Lighting', icon: '💡' },
  { name: 'Tyres', icon: '🛞' },
  { name: 'Accessories', icon: '🧰' },
]

const TABS = ['All Product', 'Featured Products', 'On Sale', 'Out of Stock']

// TODO: replace with GET /categories + per-category product count once that query exists
const PRODUCTS = [
  { name: 'Engine Oil Filter', date: '01-01-2025', orders: 25 },
  { name: 'Brake Pad Set', date: '01-01-2025', orders: 20 },
  { name: 'Car Battery 12V', date: '01-01-2025', orders: 35 },
  { name: 'LED Headlight Bulb', date: '01-01-2025', orders: 40 },
  { name: 'Air Filter', date: '01-01-2025', orders: 45 },
  { name: 'Wiper Blade Set', date: '01-01-2025', orders: 55 },
  { name: 'Spark Plug (Set of 4)', date: '01-01-2025', orders: 20 },
]

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState('All Product')
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Categories" onMenuClick={() => setDrawerOpen(true)} />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className={`${microgrammaBold.className} font-semibold text-[22px] text-gray-800`}>Discover</h2>
          <div className="flex gap-2">
            <button className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] text-white font-medium`} style={{ backgroundColor: '#074139' }}>
              <Plus className="h-4 w-4" /> Add Category
            </button>
            <button className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] border font-medium text-gray-600`}>
              More Action <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category tiles */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-[700px]">
            {CATEGORY_TILES.map((cat) => (
              <div key={cat.name} className="bg-white border rounded-xl p-4 flex flex-col items-center gap-2 w-32 shrink-0 hover:shadow-sm cursor-pointer">
                <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-2xl">{cat.icon}</div>
                <p className={`${microgrammaBold.className} text-[14px] font-medium text-gray-700 text-center`}>{cat.name}</p>
              </div>
            ))}
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
                  {tab === 'All Product' ? `All Product (${PRODUCTS.length})` : tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input placeholder="Search your product" className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-44" />
              </div>
              <button className="p-2 rounded-lg border text-gray-500"><Filter className="h-4 w-4" /></button>
              <button className="p-2 rounded-lg border text-gray-500"><Plus className="h-4 w-4" /></button>
              <button className="p-2 rounded-lg border text-gray-500"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 bg-green-50">
                  <th className="px-3 py-2.5 font-medium rounded-l-lg">No.</th>
                  <th className="px-3 py-2.5 font-medium">Product</th>
                  <th className="px-3 py-2.5 font-medium">Created Date</th>
                  <th className="px-3 py-2.5 font-medium">Order</th>
                  <th className="px-3 py-2.5 font-medium rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                        <span className="text-gray-700 font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500">{p.date}</td>
                    <td className="px-3 py-3 text-gray-700">{p.orders}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                        <button className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <button 
            className={`${microgrammaBold.className} text-[16px] font-bold text-[#074139] bg-white rounded-[5px] shadow-sm px-4 py-2 leading-none`}
            >← Previous</button>
            <div className="flex gap-1 flex-wrap">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`w-8 h-8 rounded-lg text-sm ${n === 1 ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  style={n === 1 ? { backgroundColor: '#074139' } : {}}
                >
                  {n}
                </button>
              ))}
            </div>
            <button 
            className={`${microgrammaBold.className} text-[16px] font-bold text-[#074139] bg-white rounded-[5px] shadow-sm px-4 py-2 leading-none`}
            >Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}