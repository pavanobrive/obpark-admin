import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  private async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async getProfile(userId: string) {
    const user = await this.getUserById(userId)
    const firstName = user.firstName || (user.name ? user.name.split(' ')[0] : '')
    const lastName = user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : '')
    return {
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      email: user.email,
      phone: user.phone ?? '',
      dob: '',
      location: '',
      avatarUrl: undefined,
      socials: [
        { provider: 'Google', linked: false },
        { provider: 'Facebook', linked: false },
        { provider: 'X', linked: false },
      ],
    }
  }

  async updateProfile(userId: string, dto: { firstName?: string; lastName?: string; phone?: string; email?: string; dob?: string; location?: string; avatarUrl?: string }) {
    const user = await this.getUserById(userId)

    const newFirst = dto.firstName ?? user.firstName ?? (user.name ? user.name.split(' ')[0] : '')
    const newLast = dto.lastName ?? user.lastName ?? (user.name ? user.name.split(' ').slice(1).join(' ') : '')
    const name = [newFirst, newLast].filter(Boolean).join(' ')

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: newFirst,
        lastName: newLast,
        name,
        phone: dto.phone ?? user.phone,
        email: dto.email ?? user.email,
      },
    })

    try {
      if (updated.email) {
        await this.prisma.users.updateMany({
          where: { email: updated.email },
          data: {
            firstName: newFirst,
            lastName: newLast,
            phoneNumber: dto.phone ?? user.phone,
            city: dto.location || undefined,
            profileImage: dto.avatarUrl || undefined,
          },
        })
      }
    } catch {
      // non-blocking
    }

    return {
      firstName: updated.firstName ?? newFirst,
      lastName: updated.lastName ?? newLast,
      email: updated.email,
      phone: updated.phone ?? '',
      dob: dto.dob ?? '',
      location: dto.location ?? '',
      avatarUrl: dto.avatarUrl,
    }
  }
}
