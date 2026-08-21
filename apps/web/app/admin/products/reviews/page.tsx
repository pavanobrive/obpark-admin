'use client'

import { useState } from 'react'
import { Header } from '@/components/admin/layout/Header'
import { ProductReviewsList } from '@/components/admin/products/ProductReviewsList'

export default function ProductReviewsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Product Reviews" onMenuClick={() => setDrawerOpen(true)} />
      <div className="p-6 space-y-6">
        <ProductReviewsList />
      </div>
    </div>
  )
}