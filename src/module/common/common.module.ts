import { Module } from '@nestjs/common';
import { MyLoggerService } from './logger/myLogger.service'
import { PasswordEncriptService } from './password-encript/password-encript.service';

@Module({
  providers: [MyLoggerService, PasswordEncriptService], // Declara el servicio
  exports: [MyLoggerService, PasswordEncriptService],   // Exporta el servicio para que otros módulos puedan usarlo
})
export class CommonModule {}
