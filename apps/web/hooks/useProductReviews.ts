// TODO: no reviews model exists in your Prisma schema at all — no Review table,
// no ProductReview relation, no review endpoints. This is fully placeholder
// until a backend model + moderation endpoints (approve/reject/delete) are built.
export interface ProductReview {
  id: string
  productName: string
  customerName: string
  rating: number
  comment: string
  date: string
  status: 'Published' | 'Pending' | 'Rejected'
}

const PLACEHOLDER_REVIEWS: ProductReview[] = [
  { id: '1', productName: 'Engine Oil Filter', customerName: 'Ravi Kumar', rating: 5, comment: 'Perfect fit for my Swift, easy install.', date: '05-01-2025', status: 'Published' },
  { id: '2', productName: 'Brake Pad Set', customerName: 'Priya Sharma', rating: 4, comment: 'Good quality, slightly noisy first week.', date: '03-01-2025', status: 'Published' },
  { id: '3', productName: 'Car Battery 12V', customerName: 'Arjun Reddy', rating: 2, comment: 'Died within a month, requesting replacement.', date: '01-01-2025', status: 'Pending' },
  { id: '4', productName: 'LED Headlight Bulb', customerName: 'Sneha Iyer', rating: 5, comment: 'Bright and durable, great value.', date: '28-12-2024', status: 'Published' },
]

export function useProductReviews() {
  return { data: PLACEHOLDER_REVIEWS, isLoading: false }
}