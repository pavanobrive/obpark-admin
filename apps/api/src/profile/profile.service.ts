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
    const [firstName, ...rest] = user.name.split(' ')
    return {
      firstName: firstName ?? '',
      lastName: rest.join(' '),
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

  async updateProfile(userId: string, dto: { firstName?: string; lastName?: string; phone?: string; email?: string }) {
    const user = await this.getUserById(userId)
    const currentParts = user.name.split(' ')
    const currentFirst = currentParts[0] ?? ''
    const currentLast = currentParts.slice(1).join(' ')

    const newFirst = dto.firstName ?? currentFirst
    const newLast = dto.lastName ?? currentLast
    const name = [newFirst, newLast].filter(Boolean).join(' ')

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone: dto.phone ?? user.phone,
        email: dto.email ?? user.email,
      },
    })

    const [firstName, ...rest] = updated.name.split(' ')
    return {
      firstName: firstName ?? '',
      lastName: rest.join(' '),
      email: updated.email,
      phone: updated.phone ?? '',
    }
  }
}