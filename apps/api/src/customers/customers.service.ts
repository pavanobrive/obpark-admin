import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async listCustomers(search?: string) {
    const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {}
    const users = await this.prisma.user.findMany({
      where,
      include: { orders: { select: { total: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return users.map((u) => {
      const orderCount = u.orders.length
      const totalSpend = u.orders.reduce((sum, o) => sum + Number(o.total), 0)
      return {
        id: u.id, name: u.name, phone: u.phone ?? '—', orderCount, totalSpend,
        status: totalSpend > 4000 ? 'VIP' : orderCount === 0 ? 'Inactive' : 'Active',
      }
    })
  }
}