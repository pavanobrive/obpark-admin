import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { OrderStatus } from '@prisma/client'

const COMPLETED_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
]

const CANCELED_STATUSES: OrderStatus[] = [
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
]

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
          user: { select: { firstName: true, lastName: true, email: true } },
          items: { select: { productName: true, quantity: true, unitPrice: true, totalPrice: true } },
          payments: { select: { status: true, amount: true, gateway: true } },
        },
      }),
      this.prisma.order.count(),
    ])

    const mapped = orders.map((o) => {
      const customerName = o.user
        ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() || o.user.email
        : 'Customer'

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName,
        email: o.user?.email,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        tax: Number(o.tax),
        shippingCharge: Number(o.shippingCharge),
        totalAmount: Number(o.totalAmount),
        total: Number(o.totalAmount), // alias
        status: o.status,
        shippingAddress: o.shippingAddress,
        items: o.items,
        paymentStatus: o.payments[0]?.status || 'PENDING',
        payment: o.payments[0] ? { status: o.payments[0].status } : null,
        createdAt: o.createdAt,
      }
    })

    return { orders: mapped, total }
  }

  async getOrderCounts() {
    const since = new Date()
    since.setDate(since.getDate() - 7)

    const [newOrders, completed, canceled] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: since } } }),
      this.prisma.order.count({ where: { status: { in: COMPLETED_STATUSES } } }),
      this.prisma.order.count({ where: { status: { in: CANCELED_STATUSES } } }),
    ])

    return { newOrders, completed, canceled }
  }

  async updateStatus(orderId: string, status: OrderStatus | string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
    })
  }
}
