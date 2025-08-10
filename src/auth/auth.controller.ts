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

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

function refreshCookieOptions(config: ConfigService) {
  const isProd = config.get('NODE_ENV') === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'lax' : 'lax',
    path: '/',
  } as const;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    description: 'Payload para criação de usuário',
    type: RegisterDto,
    examples: {
      valid: {
        summary: 'Exemplo válido',
        value: {
          email: 'michael-scott@dundermufflin.com',
          name: 'Michael Gary Scott',
          password: 'thatswhatshesaid@123',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        user: {
          id: 'cme53rrft0000c70kvu1ptvth',
          email: 'michael-scott@dundermufflin.com',
          name: 'Michael Gary Scott',
          role: 'USER',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Falha de validação',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password too weak'],
        error: 'Bad Request',
      },
    },
  })
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

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    description: 'Credenciais de acesso',
    type: LoginDto,
    examples: {
      valid: {
        value: {
          email: 'michael-scott@dundermufflin.com',
          password: 'thatswhatshesaid@123',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Autenticado com sucesso',
    schema: {
      example: {
        user: {
          id: 'cme53rrft0000c70kvu1ptvth',
          email: 'michael-scott@dundermufflin.com',
          name: 'Michael Gary Scott',
          role: 'USER',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
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
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({
    description: 'Token renovado',
    schema: {
      example: {
        user: {
          id: 'cme53rrft0000c70kvu1ptvth',
          email: 'michael-scott@dundermufflin.com',
          name: 'Michael Gary Scott',
          role: 'USER',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....',
      },
    },
  })
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
  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({
    description: 'Logout realizado',
    schema: { example: { success: true } },
  })
  async logout(
    @GetUser('sub') userId: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    await this.auth.logout(userId);
    res.clearCookie('refresh_token', { path: '/' });
    return { success: true };
  }
}
