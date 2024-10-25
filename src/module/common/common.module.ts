import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MyLoggerService } from './logger/myLogger.service';
import { PasswordEncriptService } from './password-encript/password-encript.service';
import { ImageValidatorService } from './img-validator/img-validator.service';
import { JwtTokenService } from './jwt-token/jwt-token.service';
import { JwtMiddleware } from './jwt-token/jwt.middleware';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    ConfigModule, // Importamos el módulo de configuración
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Cargamos el secret desde .env
        signOptions: { expiresIn: '1h' }, // Tiempo de expiración
      }),
    }),
  ],
  providers: [
    MyLoggerService,
    PasswordEncriptService,
    ImageValidatorService,
    JwtTokenService,
    JwtMiddleware,
    MailService,
  ],
  exports: [
    MyLoggerService,
    PasswordEncriptService,
    ImageValidatorService,
    JwtTokenService,
    JwtMiddleware,
    MailService
  ],
})
export class CommonModule {}
