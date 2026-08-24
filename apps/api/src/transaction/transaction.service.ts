import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async listTransactions(filters: { status?: string; limit?: number; offset?: number }) {
    const { status, limit = 20, offset = 0 } = filters
    const where: any = status ? { status } : {}

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: { order: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.payment.count({ where }),
    ])

    return {
      transactions: payments.map((p) => ({
        id: p.id,
        customerId: p.order.userId,
        name: p.order.user.name,
        date: p.createdAt,
        total: Number(p.amount),
        method: 'Razorpay',
        status: p.status === 'CAPTURED' ? 'Complete' : p.status === 'FAILED' ? 'Failed' : 'Pending',
      })),
      total,
    }
  }

  async getSummary() {
    const [totalRevenue, completed, pending, failed] = await Promise.all([
      this.prisma.payment.aggregate({ where: { status: 'CAPTURED' }, _sum: { amount: true } }),
      this.prisma.payment.count({ where: { status: 'CAPTURED' } }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),
    ])
    return { totalRevenue: Number(totalRevenue._sum.amount ?? 0), completed, pending, failed }
  }
}