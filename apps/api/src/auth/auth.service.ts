import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) { }

  async register(email: string, password: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) throw new ConflictException('Email already registered')

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await this.prisma.user.create({
      data: { email, name, passwordHash },
    })

    return this.issueTokens(user.id, user.email, user.role)
  }

  async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase()
    const user =
      (await this.prisma.user.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } },
      })) || (await this.prisma.user.findUnique({ where: { email } }))
    if (!user) throw new UnauthorizedException('Invalid email or password')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid email or password')

    return this.issueTokens(user.id, user.email, user.role)
  }

  async refresh(refreshToken: string) {
    const session = await this.prisma.session.findUnique({ where: { refreshToken } })
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    const user = await this.prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) throw new UnauthorizedException('User not found')

    await this.prisma.session.deleteMany({
      where: { id: session.id },
    })
    return this.issueTokens(user.id, user.email, user.role)
  }

  async logout(refreshToken: string) {
    await this.prisma.session.deleteMany({ where: { refreshToken } })
    return { success: true }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current password and new password are required')
    }
    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long')
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException('User not found')

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new BadRequestException('Current password does not match')

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    return { success: true, message: 'Password changed successfully' }
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, email, role },
      { expiresIn: '15m' },
    )
    const refreshToken = this.jwt.sign(
      { sub: userId },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    )

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.prisma.session.create({
      data: { userId, refreshToken, expiresAt },
    })

    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    return {
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name || `${user!.firstName || ''} ${user!.lastName || ''}`.trim() || 'Admin',
        firstName: user!.firstName ?? '',
        lastName: user!.lastName ?? '',
        role: user!.role,
      },
      accessToken,
      refreshToken,
    }
  }
}