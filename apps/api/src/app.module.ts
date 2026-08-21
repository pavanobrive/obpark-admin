import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { NewsletterModule } from './newsletter/newsletter.module'
import { AppController } from './app.controller'
import { CouponModule } from './coupon/coupon.module'
import { CategoryModule } from './category/category.module'
import { CustomersModule } from './customers/customers.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CategoryModule,
    CouponModule,
    NewsletterModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}