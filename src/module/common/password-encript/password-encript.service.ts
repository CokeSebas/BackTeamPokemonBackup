import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MyLoggerService } from '../logger/myLogger.service';

@Injectable()
export class PasswordEncriptService {

  constructor( 
    private readonly logger : MyLoggerService,
  ) {}

  async encriptPassword(password: string): Promise<string> {

    this.logger.log('(S) Encriptando password', PasswordEncriptService.name);

    const hashedPassword = await bcrypt.hash(password, 10);  // 10 es el número de rondas para el hash

    return hashedPassword;
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {

    this.logger.log('(S) Comparando password', PasswordEncriptService.name);
    
    return await bcrypt.compare(password, hashedPassword);
  }
}
