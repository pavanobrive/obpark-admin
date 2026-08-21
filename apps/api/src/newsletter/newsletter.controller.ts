import { Body, Controller, Post } from '@nestjs/common'
import { NewsletterService } from './newsletter.service'
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto'

@Controller('newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body() body: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(body)
  }
}