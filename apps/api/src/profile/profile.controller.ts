import { Controller, Get, Patch, Body } from '@nestjs/common'
import { ProfileService } from './profile.service'

@Controller()
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('me')
  getProfile() {
    return this.profileService.getProfile()
  }

  @Patch('profile')
  updateProfile(@Body() dto: { firstName?: string; lastName?: string; phone?: string; email?: string }) {
    return this.profileService.updateProfile(dto)
  }
}