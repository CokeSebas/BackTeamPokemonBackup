import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { PokemonResolver } from './pokemon.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pokemon } from 'src/db/entities/pokemon.entity';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { ImageValidatorService } from '../common/img-validator/img-validator.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pokemon
    ]),
    HttpModule
  ],
  controllers: [PokemonController],
  providers: [PokemonService, PokemonResolver, MyLoggerService, ImageValidatorService],
  exports: [PokemonResolver]
})
export class PokemonModule {}
