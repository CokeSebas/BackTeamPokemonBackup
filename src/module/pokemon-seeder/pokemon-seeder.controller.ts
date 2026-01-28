import { Controller, Post, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { PokemonSeederService } from './pokemon-seeder.service';

@Controller('pokemon-seeder')
export class PokemonController {
  constructor(
    private readonly pokemonSeeder: PokemonSeederService,
  ) {}

  //@Post('seed')
  //@HttpCode(HttpStatus.OK)
  //async seedPokemon() {
//
  //  console.log('Iniciando seed de Pokémon...');
  //  await this.pokemonSeeder.seed();
  //  return {
  //    message: 'Seed de Pokémon ejecutado correctamente',
  //  };
  //}

  @Get()
  async findAll() {
    return await this.pokemonSeeder.findAll();
  }
}
