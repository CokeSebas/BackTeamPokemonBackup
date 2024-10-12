import { Injectable } from "@nestjs/common";
import { PokemonService } from "./pokemon.service";
import { MyLoggerService } from "../common/logger/myLogger.service";
import { CreatePokemonDto } from "./dto/create-pokemon.dto";
import { UpdatePokemonDto } from "./dto/update-pokemon.dto";

@Injectable()
export class PokemonResolver {

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly logger: MyLoggerService,
  ) {}

  async create(createPokemonDto: CreatePokemonDto): Promise<Object> {
    this.logger.log('(S) Creating pokemon: ', PokemonResolver.name);

    let salida = {};

    const pokemon = this.pokemonService.create(createPokemonDto);

    if (pokemon) {
      salida = {
        message: 'Pokemon created',
        status: 'success',
        code: 200
      }
    } else {
      salida = {
        message: 'Error creating pokemon',
        status: 'error',
        code: 500
      }
    }

    return salida;

  }

  async getAll() {
    this.logger.log('(R) Getting all pokemons: ', PokemonResolver.name);
    let pokemons = await this.pokemonService.findAll();
    let salida = [], data = [];

    pokemons.forEach(element => {
      let aux = {
        'name': element.name,
        'item': element.item,
        'ability': element.ability,
        'teraType': element.teraType,
        'evsHp': element.evsHp,
        'evsAtk': element.evsAtk,
        'evsDef': element.evsDef,
        'evsSpa': element.evsSpa,
        'evsSpd': element.evsSpd,
        'evsSpe': element.evsSpe,
        'ivsHp': element.ivsHp,
        'ivsAtk': element.ivsAtk,
        'ivsDef': element.ivsDef,
        'ivsSpa': element.ivsSpa,
        'ivsSpd': element.ivsSpd,
        'ivsSpe': element.ivsSpe,
        'nature': element.nature,
        'move1': element.move1,
        'move2': element.move2,
        'move3': element.move3,
        'move4': element.move4,
      };

      data.push(aux);
    });

    salida = [{
      message: 'Pokemons obtained correctly',
      status: 'success',
      code: 200,
      data: data
    }];


    return salida;
  }

  async editPokemon(id: number, updatePokemonDto: UpdatePokemonDto) {
    this.logger.log('(S) Edit pokemon: ', PokemonResolver.name);
    
    let salida = [], data = {};

    const pokemonExist = await this.pokemonService.findOne(id);

    if (pokemonExist) {

      const pokemon = await this.pokemonService.update(id, updatePokemonDto);

      if(pokemon.affected == 1){
        data = {
          message: 'Pokemon updated',
          status: 'success',
          code: 200 
        };

        salida = [{
          'data': data,
          'message': 'Pokemon updated',
          'status': 'success',
          'code': 200
        }];
      }else{ 
        salida = [{
          message: 'Error updating pokemon',
          status: 'error',
          code: 500
        }];
      }
    }else{
      salida = [{
        message: 'Pokemon not found',
        status: 'error',
        code: 404
      }];
    }

    return salida;
  }

}
