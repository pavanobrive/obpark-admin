import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { OrderStatus } from '@prisma/client'

const COUNT_STATUSES: OrderStatus[] = [
  OrderStatus.DELIVERED,
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.CANCELLED,
]

const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
]

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOrderStatusBreakdown() {
    const counts = await Promise.all(
      COUNT_STATUSES.map((s) => this.prisma.order.count({ where: { status: s } }))
    )
    const total = counts.reduce((a, b) => a + b, 0) || 1
    return COUNT_STATUSES.map((name, i) => ({
      name,
      value: Math.round((counts[i] / total) * 100),
    }))
  }

  async getRevenueTrend(year?: number, month?: number, days = 7) {
    if (year !== undefined && month !== undefined) {
      // Month is 1-indexed (1 to 12)
      const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0)
      const endDate = new Date(year, month, 1, 0, 0, 0, 0)
      const daysInMonth = new Date(year, month, 0).getDate()

      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: { gte: startDate, lt: endDate },
          status: { in: REVENUE_STATUSES },
        },
        select: { createdAt: true, totalAmount: true },
      })

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const buckets: Record<number, number> = {}
      const orderCountBuckets: Record<number, number> = {}
      for (let i = 1; i <= daysInMonth; i++) {
        buckets[i] = 0
        orderCountBuckets[i] = 0
      }

      orders.forEach((o) => {
        const d = new Date(o.createdAt).getDate()
        if (buckets[d] !== undefined) {
          buckets[d] += Number(o.totalAmount)
          orderCountBuckets[d] += 1
        }
      })

      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        return {
          day: `${day}`,
          dateLabel: `${monthNames[month - 1]} ${day}`,
          value: buckets[day],
          ordersCount: orderCountBuckets[day],
        }
      })
    }

    const since = new Date()
    since.setDate(since.getDate() - days)

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        status: { in: REVENUE_STATUSES },
      },
      select: { createdAt: true, totalAmount: true },
    })

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const buckets: Record<string, number> = {}
    dayNames.forEach((d) => (buckets[d] = 0))

    orders.forEach((o) => {
      const day = dayNames[new Date(o.createdAt).getDay()]
      buckets[day] += Number(o.totalAmount)
    })

    return dayNames.map((day) => ({ day, value: buckets[day] }))
  }
}
