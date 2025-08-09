import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';

function refreshCookieOptions(config: ConfigService) {
  const isProd = config.get('NODE_ENV') === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'lax' : 'lax',
    path: '/', // send to all routes (or restrict to /api/auth/refresh)
  } as const;
}

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.auth.register(dto);
    res.setCookie(
      'refresh_token',
      result.refreshToken,
      refreshCookieOptions(this.config),
    );
    return { user: result.user, accessToken: result.accessToken };
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } }) // 5 logins/min/IP
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.auth.login(dto);
    res.setCookie(
      'refresh_token',
      result.refreshToken,
      refreshCookieOptions(this.config),
    );
    return { user: result.user, accessToken: result.accessToken };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(
    @GetUser('sub') userId: string,
    @Res({ passthrough: true }) res: FastifyReply,
    @Req() req: FastifyRequest & { refreshToken?: string },
  ) {
    const result = await this.auth.refresh(userId, req.refreshToken!);
    res.setCookie(
      'refresh_token',
      result.refreshToken,
      refreshCookieOptions(this.config),
    );
    return { user: result.user, accessToken: result.accessToken };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(
    @GetUser('sub') userId: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    await this.auth.logout(userId);
    res.clearCookie('refresh_token', { path: '/' });
    return { success: true };
  }
}
