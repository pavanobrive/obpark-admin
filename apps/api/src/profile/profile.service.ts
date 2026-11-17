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

    let dbUser: any = null
    if (user.email) {
      dbUser = await this.prisma.users.findFirst({ where: { email: user.email } }).catch(() => null)
    }

    const dob = dbUser?.dob ? new Date(dbUser.dob).toISOString().split('T')[0] : ''
    const location = dbUser?.city || dbUser?.address || ''
    const avatarUrl = dbUser?.profileImage || undefined

    return {
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      email: user.email,
      phone: user.phone ?? dbUser?.phoneNumber ?? '',
      dob,
      location,
      avatarUrl,
      role: user.role,
      bio: '',
      socials: [
        { provider: 'Google', linked: false },
        { provider: 'Facebook', linked: false },
        { provider: 'X', linked: false },
      ],
    }
  }

  async updateProfile(
    userId: string,
    dto: {
      firstName?: string
      lastName?: string
      phone?: string
      email?: string
      dob?: string
      location?: string
      avatarUrl?: string
      bio?: string
    },
  ) {
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

    let dobDate: Date | null | undefined = undefined
    if (dto.dob !== undefined) {
      if (!dto.dob) {
        dobDate = null
      } else {
        const parsed = new Date(dto.dob)
        if (!isNaN(parsed.getTime())) {
          dobDate = parsed
        }
      }
    }

    try {
      if (updated.email) {
        const existingUsers = await this.prisma.users.findFirst({ where: { email: updated.email } })
        if (existingUsers) {
          await this.prisma.users.update({
            where: { id: existingUsers.id },
            data: {
              firstName: newFirst,
              lastName: newLast,
              phoneNumber: dto.phone ?? user.phone,
              city: dto.location !== undefined ? dto.location : existingUsers.city,
              dob: dobDate !== undefined ? dobDate : existingUsers.dob,
              profileImage: dto.avatarUrl !== undefined ? dto.avatarUrl : existingUsers.profileImage,
            },
          })
        } else {
          await this.prisma.users.create({
            data: {
              email: updated.email,
              firstName: newFirst,
              lastName: newLast,
              phoneNumber: dto.phone ?? user.phone,
              city: dto.location || undefined,
              dob: dobDate || undefined,
              profileImage: dto.avatarUrl || undefined,
              role: user.role,
            },
          })
        }
      }
    } catch (e) {
      console.warn('Failed to sync to users table:', e)
    }

    return {
      firstName: updated.firstName ?? newFirst,
      lastName: updated.lastName ?? newLast,
      email: updated.email,
      phone: updated.phone ?? '',
      dob: dto.dob ?? '',
      location: dto.location ?? '',
      avatarUrl: dto.avatarUrl,
      role: updated.role,
      bio: dto.bio ?? '',
    }
  }
}
