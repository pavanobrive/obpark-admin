import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOrderStatusBreakdown() {
    const statuses = ['DELIVERED', 'PENDING', 'PROCESSING', 'CANCELLED']
    const counts = await Promise.all(
      statuses.map((s) => this.prisma.order.count({ where: { status: s as any } }))
    )
    const total = counts.reduce((a, b) => a + b, 0) || 1
    return statuses.map((name, i) => ({ name, value: Math.round((counts[i] / total) * 100) }))
  }

  async getRevenueTrend(days = 7) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      select: { createdAt: true, total: true },
    })

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const buckets: Record<string, number> = {}
    dayNames.forEach((d) => (buckets[d] = 0))

    orders.forEach((o) => {
      const day = dayNames[new Date(o.createdAt).getDay()]
      buckets[day] += Number(o.total)
    })

    return dayNames.map((day) => ({ day, value: buckets[day] }))
  }
}