import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MyLoggerService } from '../logger/myLogger.service';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly logger: MyLoggerService,
    private readonly jwtService: JwtService,
  ) {}

  async createToken(key: string, variable: any): Promise<string> {
    this.logger.log('(S) Creating token: ', JwtTokenService.name);
    const payload = { [key] : variable };
    return this.jwtService.sign(payload); // Usa la configuración del módulo JWT
  }

  async validateToken(token: string): Promise<any> {
    this.logger.log('(S) Validating token: ', JwtTokenService.name);
    try {
      return this.jwtService.verify(token); // Verifica el token usando el secret correcto
    } catch (err) {
      this.logger.error('Token validation failed', err);
      throw err;
    }
  }

  async decodeToken(token: string): Promise<any> {
    this.logger.log('(S) Decoding token: ', JwtTokenService.name);
    return this.jwtService.decode(token);
  }
}
