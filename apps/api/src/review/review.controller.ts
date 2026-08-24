import { Controller, Get, Patch, Delete, Param } from '@nestjs/common'
import { ReviewService } from './review.service'

@Controller('admin/reviews')
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