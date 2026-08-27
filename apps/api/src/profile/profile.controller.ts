import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller()
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('me')
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.profileService.getProfile(user.userId)
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: { userId: string },
    @Body() dto: { firstName?: string; lastName?: string; phone?: string; email?: string },
  ) {
    return this.profileService.updateProfile(user.userId, dto)
  }
}