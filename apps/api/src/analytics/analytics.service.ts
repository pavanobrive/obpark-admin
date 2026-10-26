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

  async getRevenueTrend(days = 7) {
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
