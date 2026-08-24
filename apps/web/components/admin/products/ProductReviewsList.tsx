'use client'

import { Star, Check, X, Trash2 } from 'lucide-react'
import { useProductReviews, useApproveReview, useRejectReview, useDeleteReview } from '@/hooks/useProductReviews'

const STATUS_STYLE: Record<string, string> = {
  Published: 'bg-green-100 text-green-600',
  Pending: 'bg-amber-100 text-amber-600',
  Rejected: 'bg-red-100 text-red-500',
}

export function ProductReviewsList() {
  const { data: reviews = [], isLoading } = useProductReviews()
  const approveReview = useApproveReview()
  const rejectReview = useRejectReview()
  const deleteReview = useDeleteReview()

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Customer Reviews</h3>

        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : !reviews.length ? (
          <p className="text-sm text-gray-400 text-center py-10">No reviews yet</p>
        ) : (
          <div className="divide-y">
            {reviews.map((r) => (
              <div key={r.id} className="py-4 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-800 text-sm">{r.customerName}</p>
                    <span className="text-xs text-gray-400">on {r.productName}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      aria-label="Approve review"
                      onClick={() => approveReview.mutate(r.id)}
                      disabled={approveReview.isPending || r.status === 'Published'}
                      className="text-gray-400 hover:text-green-600 disabled:opacity-40"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Reject review"
                      onClick={() => rejectReview.mutate(r.id)}
                      disabled={rejectReview.isPending || r.status === 'Rejected'}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-40"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Delete review"
                      onClick={() => { if (confirm('Delete this review?')) deleteReview.mutate(r.id) }}
                      disabled={deleteReview.isPending}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}