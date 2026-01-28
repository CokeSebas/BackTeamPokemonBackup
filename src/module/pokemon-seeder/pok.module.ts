import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pokemon } from '../../db/entities/list-pokemons.entity';
import { PokemonController } from './pokemon-seeder.controller';
import { PokemonSeederService } from './pokemon-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pokemon])],
  controllers: [PokemonController],
  providers: [PokemonSeederService],
})
export class PokModule {}
