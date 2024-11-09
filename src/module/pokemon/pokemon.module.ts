import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { PokemonResolver } from './pokemon.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pokemon } from '../../db/entities/pokemon.entity';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { ImageValidatorService } from '../common/img-validator/img-validator.service';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from '../common/common.module';
import { JwtMiddleware } from '../common/jwt-token/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { SubFormatsModule } from '../subFormats/subFormats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pokemon
    ]),
    JwtModule.register({ 
      secret: 'trxt385J*', 
      signOptions: { expiresIn: '1d' } 
    }),
    HttpModule,
    CommonModule,
    SubFormatsModule
  ],
  controllers: [PokemonController],
  providers: [PokemonService, PokemonResolver, MyLoggerService, ImageValidatorService],
  exports: [PokemonResolver]
})

export class PokemonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware) // Aplicamos el middleware
      .forRoutes(
        'pokemon/pokes-user',
        'pokemon/poke-user'
      )
  }  
}
