import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pokemon } from '../../db/entities/pokemon.entity';
import { Repository } from 'typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { SubFormat } from '../../db/entities/subFormat.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    private readonly logger: MyLoggerService,
    @InjectRepository(SubFormat)
    private readonly subformatRepository: Repository<SubFormat>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    this.logger.log('(S) Creating pokemon: ', PokemonService.name);

    const { subFormatId, ...pokeData } = createPokemonDto;

    // Busca el subformato y asegúrate de que existe
    const subFormat = await this.subformatRepository.findOne({ where: { id: createPokemonDto['subFormatId'] } });
    if (!subFormat) {
      throw new NotFoundException('Subformat not found');
    }

    const pokemon = this.pokemonRepository.create({
      ...pokeData,
      subFormat,
    });

    return this.pokemonRepository.save(pokemon);
  }

  async findAll() {
    this.logger.log('(S) Fetching all pokemons: ', PokemonService.name);
    return this.pokemonRepository.find({ where: { isPublic: true } });
  }

  async findAllJoin() {
    this.logger.log('(S) Fetching all pokemons: ', PokemonService.name);
    return this.pokemonRepository
      .createQueryBuilder('p')                  // Alias 'p' para la tabla pokemon
      .innerJoinAndSelect('p.subFormat', 's')   // INNER JOIN con la tabla subformats
      .where('p.is_public = :isPublic', { isPublic: true }) // Condición para is_public = true
      .orderBy('p.id', 'DESC')
      .getMany();                               // Devuelve los resultados
  }

  async findAllPokesHome(){
    this.logger.log('(S) Fetching all pokemons: ', PokemonService.name);
    return this.pokemonRepository.find({where: { isPublic: true }, order: {id: 'desc'}});
  }

  async findOne(id: number) {
    this.logger.log('(S) Fetching pokemon by id: '+id, PokemonService.name);
    return this.pokemonRepository.findOne({ where: { id } });
  }

  async findOneJoin(id: number) {
    this.logger.log('(S) Fetching pokemon by id: '+id, PokemonService.name);
    return this.pokemonRepository
      .createQueryBuilder('p')                  // Alias 'p' para la tabla pokemon
      .innerJoinAndSelect('p.subFormat', 's')   // INNER JOIN con la tabla subformats
      .where('p.id = :id', { id })           // Condición para el id
      .getOne();                              // Devuelve el primer resultado
  }

  async findPokesByUser(userId: number) {
    this.logger.log('(S) Fetching pokemon by user: '+userId, PokemonService.name);
    return this.pokemonRepository.find({ where: { userId } });
  }

  async findPokesByUserJoin(userId: number) {
    this.logger.log('(S) Fetching pokemon by user: '+userId, PokemonService.name);
    return this.pokemonRepository
      .createQueryBuilder('p')                  // Alias 'p' para la tabla pokemon
      .innerJoinAndSelect('p.subFormat', 's')   // INNER JOIN con la tabla subformats
      .where('p.user_id = :userId', { userId })           // Condición para el id
      .orderBy('p.id', 'DESC')
      .getMany();                              // Devuelve el primer resultado
  }

  async update(id: number, updatePokemonDto: UpdatePokemonDto) {
    this.logger.log('(S) Updating pokemon: '+id, PokemonService.name);
    return this.pokemonRepository.update(id, updatePokemonDto);
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
