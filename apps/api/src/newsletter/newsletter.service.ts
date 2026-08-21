import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto'

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const firstName = dto.firstName.trim()
    const lastName = dto.lastName.trim()
    const email = dto.email.trim().toLowerCase()

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        isNewsletterSub: true,
      },
      create: {
        firstName,
        lastName,
        email,
        isNewsletterSub: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isNewsletterSub: true,
      },
    })

    return {
      success: true,
      message: 'Newsletter subscription saved successfully.',
      user,
    }
  }
}