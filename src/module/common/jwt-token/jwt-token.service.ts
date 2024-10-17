import { Injectable } from '@nestjs/common';
import { MyLoggerService } from '../logger/myLogger.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService {

  constructor(
    private readonly logger: MyLoggerService,
    private readonly jwtService: JwtService
  ) {}

  async createToken(userId: number): Promise<string> {
    this.logger.log('(S) Creating token: ', JwtTokenService.name);
    const payload = { userId };
    return this.jwtService.sign(payload);
  }
}
