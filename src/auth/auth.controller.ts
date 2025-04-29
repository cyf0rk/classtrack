import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { Role } from 'db';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; role?: Role },
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.role || Role.USER,
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
