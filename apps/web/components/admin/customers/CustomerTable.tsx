'use client'

import { FileText, Trash2 } from 'lucide-react'
import type { Customer } from './types'
import { microgrammaBold } from '@/lib/fonts'

const STATUS_STYLE: Record<string, string> = {
  Active: 'text-green-600', Inactive: 'text-red-500', VIP: 'text-amber-600',
}

interface CustomerTableProps {
  customers: Customer[]
  isLoading: boolean
  selectedId: string | null
  onSelect: (customer: Customer) => void
}

export function CustomerTable({ customers, isLoading, selectedId, onSelect }: CustomerTableProps) {
  return (
    <div className="lg:col-span-2 bg-white border rounded-xl p-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="pb-3 font-medium">Customer Id</th>
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Phone</th>
              <th className="pb-3 font-medium">Order Count</th>
              <th className="pb-3 font-medium">Total Spend</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : !customers.length ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">No customers found</td></tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.id + c.name}
                  onClick={() => onSelect(c)}
                  className={`border-b last:border-0 cursor-pointer hover:bg-gray-50 ${selectedId === c.id + c.name ? 'bg-green-50' : ''}`}
                >
                  <td className="py-3 text-gray-700">{c.id}</td>
                  <td className="py-3 text-gray-700 font-medium">{c.name}</td>
                  <td className="py-3 text-gray-500">{c.phone}</td>
                  <td className="py-3 text-gray-700">{c.orders}</td>
                  <td className="py-3 text-gray-700">₹{c.spend.toLocaleString('en-IN')}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${c.status === 'Active' ? 'bg-green-500' : c.status === 'VIP' ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <span className={STATUS_STYLE[c.status]}>{c.status}</span>
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-gray-600"><FileText className="h-4 w-4" /></button>
                      <button onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <button 
        className={`${microgrammaBold.className} text-[16px] font-bold text-[#074139] bg-white rounded-[5px] shadow-sm px-4 py-2 leading-none`}
        >← Previous</button>
        <div className="flex gap-1 flex-wrap">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={`w-8 h-8 rounded-lg text-sm ${n === 1 ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`} style={n === 1 ? { backgroundColor: '#074139' } : {}}>{n}</button>
          ))}
        </div>
        <button  className={`${microgrammaBold.className} text-[16px] font-bold text-[#074139] bg-white rounded-[5px] shadow-sm px-4 py-2 leading-none`}
        >Next →</button>
      </div>
    </div>
  )
}