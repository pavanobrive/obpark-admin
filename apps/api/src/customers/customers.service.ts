import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async listCustomers(search?: string) {
    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}

    const users = await this.prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            total: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return users.map((u, index) => {
      const orderCount = u.orders.length

      const totalSpend = u.orders.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      )

      return {
        // Display ID: 1, 2, 3, 4...
        id: String(index + 1),

        name: u.name || 'Unnamed',

        phone: u.phone ?? '—',

        orderCount,

        totalSpend,

        status:
          totalSpend > 4000
            ? 'VIP'
            : orderCount === 0
              ? 'Inactive'
              : 'Active',
      }
    })
  }

  async getTotalCustomers() {
    return this.prisma.user.count()
  }
}