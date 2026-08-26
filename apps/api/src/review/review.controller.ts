import { Controller, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common'
import { ReviewService } from './review.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get()
  list() {
    return this.reviewService.listReviews()
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.reviewService.approve(id)
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.reviewService.reject(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id)
  }
}