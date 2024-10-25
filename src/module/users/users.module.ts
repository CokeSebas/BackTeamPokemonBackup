import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { PasswordEncriptService } from '../common/password-encript/password-encript.service';
import { UsersResolver } from './users.resolver';
import { JwtTokenService } from '../common/jwt-token/jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from '../common/mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // Registra la entidad User como un repositorio
    JwtModule.register({ 
      secret: 'trxt385J*', 
      signOptions: { expiresIn: '1d' } 
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, MyLoggerService, PasswordEncriptService, UsersResolver, JwtTokenService, MailService],
  exports: [UsersResolver],
})
export class UsersModule {}
