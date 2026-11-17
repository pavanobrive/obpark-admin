import { Controller, Post, Patch, Body, Res, Req, UseGuards, UnauthorizedException } from '@nestjs/common'
import type { Response, Request } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CurrentUser } from './current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: { email: string; password: string; name: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto.email, dto.password, dto.name)
    this.setRefreshCookie(res, result.refreshToken)
    return { user: result.user, accessToken: result.accessToken }
  }

  @Post('login')
  async login(
    @Body() dto: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto.email, dto.password)
    this.setRefreshCookie(res, result.refreshToken)
    return { user: result.user, accessToken: result.accessToken }
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided')
    }
    const result = await this.authService.refresh(refreshToken)
    this.setRefreshCookie(res, result.refreshToken)
    return { user: result.user, accessToken: result.accessToken }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken
    if (refreshToken) await this.authService.logout(refreshToken)
    res.clearCookie('refreshToken', { path: '/' })
    res.clearCookie('admin_session', { path: '/' })
    return { success: true }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(
    @CurrentUser() user: { userId: string },
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(user.userId, dto.currentPassword, dto.newPassword)
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('refreshToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })
    res.cookie('admin_session', 'true', {
      httpOnly: false,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })
  }
}