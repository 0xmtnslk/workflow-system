import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      return response.status(401).json({ message: 'E-posta veya şifre hatalı' });
    }

    const cookie = this.authService.getCookieWithJwtToken(user);
    response.setHeader('Set-Cookie', cookie);
    
    const { passwordHash, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return { message: 'Başarıyla çıkış yapıldı' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    const { passwordHash, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }
}
