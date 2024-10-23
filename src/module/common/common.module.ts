import { Module } from '@nestjs/common';
import { MyLoggerService } from './logger/myLogger.service'
import { PasswordEncriptService } from './password-encript/password-encript.service';
import { JwtService } from '@nestjs/jwt';
import { ImageValidatorService } from './img-validator/img-validator.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule
  ],
  providers: [MyLoggerService, PasswordEncriptService, JwtService, ImageValidatorService], // Declara el servicio
  exports: [MyLoggerService, PasswordEncriptService, JwtService, ImageValidatorService],   // Exporta el servicio para que otros módulos puedan usarlo
})
export class CommonModule {}
