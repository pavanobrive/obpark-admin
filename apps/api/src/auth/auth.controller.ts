import { Controller, Post, Body, Res, Req } from '@nestjs/common'
import type { Response, Request } from 'express'
import { AuthService } from './auth.service'

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
      return { user: null, accessToken: null }
    }
    const result = await this.authService.refresh(refreshToken)
    this.setRefreshCookie(res, result.refreshToken)
    return { user: result.user, accessToken: result.accessToken }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken
    if (refreshToken) await this.authService.logout(refreshToken)
    res.clearCookie('refreshToken')
    return { success: true }
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
  }
}