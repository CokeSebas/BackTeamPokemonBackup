import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pokemon } from '../../db/entities/list-pokemons.entity';
import { PokemonSeederService } from './pokemon-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pokemon])],
  providers: [PokemonSeederService],
  exports: [PokemonSeederService],
})
export class PokemonSeederModule {}
