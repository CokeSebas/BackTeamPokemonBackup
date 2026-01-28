import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pokemon } from '../../db/entities/list-pokemons.entity';

@Injectable()
export class PokemonSeederService {
  private readonly logger = new Logger(PokemonSeederService.name);

  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepo: Repository<Pokemon>,
  ) {}

  async seed(): Promise<void> {
    const exists = await this.pokemonRepo.count();
    if (exists > 0) {
      this.logger.warn('⚠️ Pokémon ya existen, seed cancelado');
      return;
    }

    this.logger.log('🔄 Cargando Pokémon desde PokéAPI...');

    const response = await fetch(
      'https://pokeapi.co/api/v2/pokemon?limit=2000',
    );
    const data = await response.json();

    let inserted = 0;

    for (const item of data.results) {
      const detailRes = await fetch(item.url);
      const pokemonData = await detailRes.json();

      const pokemon = this.pokemonRepo.create({
        name: pokemonData.name,
        imageUrl:
          pokemonData.sprites.other['official-artwork'].front_default ??
          pokemonData.sprites.front_default,
      });

      await this.pokemonRepo.save(pokemon);
      inserted++;
    }

    this.logger.log(`✅ ${inserted} Pokémon insertados`);
  }


  async findAll() {
    this.logger.log('(S) Find all pokemons', PokemonSeederService.name);
    return this.pokemonRepo.find();
  }
}
