import { Injectable } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pokemon } from 'src/db/entities/pokemon.entity';
import { Repository } from 'typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';

@Injectable()
export class PokemonService {

  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    private readonly logger: MyLoggerService
  ) {}

  async create(createPokemonDto: Object): Promise<Pokemon> {
    this.logger.log('(S) Creating pokemon: ', PokemonService.name);
    const pokemon = this.pokemonRepository.create(createPokemonDto);
    return this.pokemonRepository.save(pokemon);
  }

  async findAll() {
    this.logger.log('(S) Fetching all pokemons: ', PokemonService.name);
    return this.pokemonRepository.find();
  }

  async findOne(id: number) {
    this.logger.log('(S) Fetching pokemon by id: '+id, PokemonService.name);
    return this.pokemonRepository.findOne({ where: { id } });
  }

  async findPokesByUser(userId: number) {
    this.logger.log('(S) Fetching pokemon by user: '+userId, PokemonService.name);
    return this.pokemonRepository.find({ where: { userId } });
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    this.logger.log('(S) Updating pokemon: '+id, PokemonService.name);
    return this.pokemonRepository.update(id, updatePokemonDto);
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
