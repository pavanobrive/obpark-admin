import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async listCustomers(search?: string) {
    const where: any = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const users = await this.prisma.users.findMany({
      where,
      include: {
        orders: {
          select: {
            totalAmount: true,
          },
        },
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return users.map((u, index) => {
      const orderCount = u.orders.length
      const totalSpend = u.orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      )
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Customer'
      const primaryAddress = u.addresses[0]

      return {
        id: String(index + 1),
        userId: u.id,
        name,
        email: u.email ?? '—',
        phone: u.phoneNumber ?? '—',
        orderCount,
        totalSpend,
        avatar: u.profileImage ?? null,
        city: u.city || (primaryAddress ? primaryAddress.city : '—'),
        status: u.isActive ? 'Active' : 'Inactive',
        addresses: u.addresses.map((a) => ({
          id: a.id,
          label: a.label,
          type: a.type,
          streetAddress: a.streetAddress,
          apartmentSuite: a.apartmentSuite,
          city: a.city,
          zipCode: a.zipCode,
          country: a.country,
          isDefault: a.isDefault,
        })),
      }
    })
  }

  async getCustomerCount() {
    return this.prisma.users.count()
  }

  async getTotalCustomers() {
    return this.prisma.users.count()
  }
}
