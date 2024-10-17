import { Module } from '@nestjs/common';
import { MyLoggerService } from './logger/myLogger.service'
import { PasswordEncriptService } from './password-encript/password-encript.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [MyLoggerService, PasswordEncriptService, JwtService], // Declara el servicio
  exports: [MyLoggerService, PasswordEncriptService, JwtService],   // Exporta el servicio para que otros módulos puedan usarlo
})
export class CommonModule {}
