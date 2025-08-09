import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';
import { JwtPayload } from '../../common/types/jwt-payload';

// Util: parseia o header Cookie sem usar "any"
function getCookie(req: FastifyRequest, name: string): string | null {
  const header = req.headers['cookie'];
  if (!header) return null;

  // "a=b; c=d" => procura por "name"
  for (const part of header.split(';')) {
    const [k, ...v] = part.split('=');
    if (k?.trim() === name) {
      return decodeURIComponent(v.join('='));
    }
  }
  return null;
}

function refreshTokenFromRequest(req: FastifyRequest): string | null {
  // nome do cookie: refresh_token
  return getCookie(req, 'refresh_token');
}

// O usuário autenticado via refresh inclui o token bruto para rotação
export type JwtRefreshUser = JwtPayload & { refreshToken: string };

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      // Mantém a assinatura esperada pelo passport-jwt
      jwtFromRequest: (req: FastifyRequest) => refreshTokenFromRequest(req),
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  // Deixe explícito o tipo de retorno para calar o no-unsafe-return
  validate(req: FastifyRequest, payload: JwtPayload): JwtRefreshUser {
    const token = refreshTokenFromRequest(req);
    if (!token) {
      throw new UnauthorizedException('Missing refresh token cookie');
    }
    // Não muta req; retorna o dado que será colocado em req.user
    return { ...payload, refreshToken: token };
  }
}
