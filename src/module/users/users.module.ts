import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { PasswordEncriptService } from '../common/password-encript/password-encript.service';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // Registra la entidad User como un repositorio
  ],
  controllers: [UsersController],
  providers: [UsersService, MyLoggerService, PasswordEncriptService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
