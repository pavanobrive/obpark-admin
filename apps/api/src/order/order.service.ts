import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const COMPLETED_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const CANCELED_STATUSES = ['CANCELLED', 'REFUNDED']

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async listOrders(limit = 10, offset = 0) {
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { productName: true, quantity: true } },
          payment: { select: { status: true } },
        },
      }),
      this.prisma.order.count(),
    ])
    return { orders, total }
  }

  async getOrderCounts() {
    const since = new Date()
    since.setDate(since.getDate() - 7)

    const [newOrders, completed, canceled] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: since } } }),
      this.prisma.order.count({ where: { status: { in: COMPLETED_STATUSES as any } } }),
      this.prisma.order.count({ where: { status: { in: CANCELED_STATUSES as any } } }),
    ])

    return { newOrders, completed, canceled }
  }

  async updateStatus(orderId: string, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    })
  }
}