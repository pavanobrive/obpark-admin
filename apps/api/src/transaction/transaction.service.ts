import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PaymentStatus } from '@prisma/client'

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async listTransactions(filters: { status?: PaymentStatus; limit?: number; offset?: number }) {
    const { status, limit = 20, offset = 0 } = filters
    const where: any = status ? { status } : {}

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          order: { select: { id: true, orderNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.payment.count({ where }),
    ])

    return {
      transactions: payments.map((p) => {
        const customerName = p.user
          ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() || p.user.email
          : 'Customer'

        return {
          id: p.id,
          orderId: p.orderId,
          orderNumber: p.order?.orderNumber || '—',
          customerId: p.userId,
          name: customerName,
          date: p.createdAt,
          total: Number(p.amount),
          method: p.gateway || 'Razorpay',
          status:
            p.status === PaymentStatus.SUCCESS
              ? 'Complete'
              : p.status === PaymentStatus.FAILED
              ? 'Failed'
              : 'Pending',
        }
      }),
      total,
    }
  }

  async getSummary() {
    const [totalRevenue, completed, pending, failed] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({ where: { status: PaymentStatus.SUCCESS } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
    ])

    return {
      totalRevenue: Number(totalRevenue._sum?.amount ?? 0),
      completed,
      pending,
      failed,
    }
  }
}
