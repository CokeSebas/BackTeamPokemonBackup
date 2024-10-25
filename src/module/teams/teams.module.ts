import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TeamsResolver } from './teams.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teams } from 'src/db/entities/team.entity';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { HttpModule } from '@nestjs/axios';
import { ImageValidatorService } from '../common/img-validator/img-validator.service';
import { CommonModule } from '../common/common.module';
import { JwtMiddleware } from '../common/jwt-token/jwt.middleware';
import { JwtTokenService } from '../common/jwt-token/jwt-token.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teams]),
    JwtModule.register({ 
      secret: 'trxt385J*', 
      signOptions: { expiresIn: '1d' } 
    }),
    HttpModule,
    CommonModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService, TeamsResolver, MyLoggerService, ImageValidatorService, JwtTokenService],
  exports: [TeamsResolver]

})

export class TeamsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware) // Aplicamos el middleware
      .forRoutes(
        'teams/teams-user', // Ruta específica
        'teams/team-user',
      );
  }
}