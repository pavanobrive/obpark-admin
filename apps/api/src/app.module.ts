import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AppController } from './app.controller'
import { CouponModule } from './coupon/coupon.module'
import { CategoryModule } from './category/category.module'
import { CustomersModule } from './customers/customers.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { TransactionModule } from './transaction/transaction.module'
import { AdminModule } from './admin/admin.module'
import { OrderModule } from './order/order.module'
import { ReviewModule } from './review/review.module'
import { MediaModule } from './media/media.module'
import { ProfileModule } from './profile/profile.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    MediaModule,
    OrderModule,
    AdminModule,
    CategoryModule,
    ReviewModule,
    CouponModule,
    CustomersModule,
    AnalyticsModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}