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
    this.logger.log('(R) Creating pokemon: ', PokemonResolver.name);

    let salida = [];

    // Separar por líneas utilizando split()
    const lines = createPokemonDto.paste_sd.split(/\r?\n/);
    
    let ivs = '', move1 = '', move2 = '', move3 = '', move4 = '';

    const nameAndItem = lines[0];
    const name = nameAndItem.split(' @ ')[0];
    const item = nameAndItem.split(' @ ')[1];
    const ability = lines[1].split(':')[1];
    const teraType = lines[2].split(':')[1];
    const evs = lines[3].split(':')[1];
    const nature = lines[4].split(' ')[0];
    if(lines[5].includes('IVs')) {
      ivs = lines[5].split(':')[1];
      move1 = lines[6].replace('- ', '');
      move2 = lines[7].replace('- ', '');
      move3 = lines[8].replace('- ', '');
      move4 = lines[9].replace('- ', '');
    }else{
      move1 = lines[5].replace('- ', '');
      move2 = lines[6].replace('- ', '');
      move3 = lines[7].replace('- ', '');
      move4 = lines[8].replace('- ', '');
    }

    // Expresión regular para capturar los pares "valor tipo"
    const regex = /(\d+)\s+(\w+)/g;

    // Objeto para almacenar los resultados
    const statsEvs: Record<string, number> = {
      HP: 0,Atk: 0,Def: 0,SpA: 0,SpD: 0,Spe: 0
    };
    // Ejecutar la expresión regular en la cadena
    let match;
    while ((match = regex.exec(evs)) !== null) {
      const value = parseInt(match[1], 10); // El número (valor de la estadística)
      const stat = match[2]; // El tipo de estadística (HP, Atk, etc.)
      statsEvs[stat] = value; // Guardar en el objeto de estadísticas
    }

    const evsMap: Record<string, number> = {
      HP: 0,Atk: 0,Def: 0,SpA: 0,SpD: 0,Spe: 0
    };
    for (const stat in evsMap) {
      if (statsEvs[stat] != 0) {
        evsMap[stat] = statsEvs[stat];
      }
    }
    // Desestructuración para asignar a las variables individuales
    const { HP: evsHp, Atk: evsAtk, Def: evsDef, SpA: evsSpA, SpD: evsSpD, Spe: evsSpe } = evsMap;


    // Objeto para almacenar los resultados
    const statsIvs: Record<string, number> = {
      HP: 31,Atk: 31,Def: 31,SpA: 31,SpD: 31,Spe: 31
    };
    // Ejecutar la expresión regular en la cadena
    while ((match = regex.exec(ivs)) !== null) {
      const value = parseInt(match[1], 10); // El número (valor de la estadística)
      const stat = match[2]; // El tipo de estadística (HP, Atk, etc.)
      statsIvs[stat] = value; // Guardar en el objeto de estadísticas
    }

    const ivsMap: Record<string, number> = {
      HP: 31,Atk: 31,Def: 31,SpA: 31,SpD: 31,Spe: 31
    };
    for (const stat in ivsMap) {
      if (statsIvs[stat] != 31) {
        ivsMap[stat] = statsIvs[stat];
      }
    }
    // Desestructuración para asignar a las variables individuales
    const { HP: ivsHp, Atk: ivsAtk, Def: ivsDef, SpA: ivsSpa, SpD: ivsSpd, Spe: ivsSpe } = ivsMap;

    const pokemonSave = {
      name: name.trim(),
      item: item.trim(),
      ability: ability.trim(),
      teraType: teraType.trim(),
      evsHp: evsHp,
      evsAtk: evsAtk,
      evsDef: evsDef,
      evsSpa: evsSpA,
      evsSpd: evsSpD,
      evsSpe: evsSpe,
      ivsHp: ivsHp,
      ivsAtk: ivsAtk,
      ivsDef: ivsDef,
      ivsSpa: ivsSpa,
      ivsSpd: ivsSpd,
      ivsSpe: ivsSpe,
      nature: nature,
      move1: move1.trim(),
      move2: move2.trim(),
      move3: move3.trim(),
      move4: move4.trim(),
      userId: createPokemonDto.user_id,
      spreadUse: createPokemonDto.spread_use,
      teamMates: createPokemonDto.team_mates,
      calculosPrincipales: createPokemonDto.calculos_principales,
      nickPoke: createPokemonDto.nick_poke,
      isPublic: createPokemonDto.is_public
    }    
    
    //console.log(pokemonSave);
    //return null;


    const pokemon = this.pokemonService.create(pokemonSave);

    if (pokemon) {
      salida = [{
        message: 'Pokemon created',
        status: 'success',
        code: 200
      }];
    } else {
      salida = [{
        message: 'Error creating pokemon',
        status: 'error',
        code: 500
      }];
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
