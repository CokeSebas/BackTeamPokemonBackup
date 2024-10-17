import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { PokemonResolver } from './pokemon.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pokemon } from 'src/db/entities/pokemon.entity';
import { MyLoggerService } from '../common/logger/myLogger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pokemon
    ])
  ],
  controllers: [PokemonController],
  providers: [PokemonService, PokemonResolver, MyLoggerService],
  exports: [PokemonResolver]
})
export class PokemonModule {}
