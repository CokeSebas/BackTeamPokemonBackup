import { Injectable } from "@nestjs/common";
import { PokemonService } from "./pokemon.service";
import { MyLoggerService } from "../common/logger/myLogger.service";
import { CreatePokemonDto } from "./dto/create-pokemon.dto";
import { UpdatePokemonDto } from "./dto/update-pokemon.dto";
import { ImageValidatorService } from "../common/img-validator/img-validator.service";
import { JwtTokenService } from "../common/jwt-token/jwt-token.service";

@Injectable()
export class PokemonResolver {

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly logger: MyLoggerService,
    private readonly imgValidatorService: ImageValidatorService,
     private readonly jwtTokenService: JwtTokenService
  ) {}

  async create(createPokemonDto: CreatePokemonDto): Promise<Object> {
    this.logger.log('(R) Creating pokemon: ', PokemonResolver.name);

    let salida = [];

    // Separar por líneas utilizando split()
    let lines = createPokemonDto.paste_sd.split(/\r?\n/);
    lines = lines.filter(line => !line.includes('Level'));
    lines = lines.filter(line => !line.includes('Shiny:'));
 
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


    const namePoke = name.trim().toLowerCase();
    let pokeImg = '';

    //createPokemonDto.url_image

    if(await this.imgValidatorService.checkImageExists('https://play.pokemonshowdown.com/sprites/gen5/'+namePoke+'.png') == true) {
      pokeImg = 'https://play.pokemonshowdown.com/sprites/gen5/'+namePoke+'.png';
    }else if (await this.imgValidatorService.checkImageExists('https://play.pokemonshowdown.com/sprites/dex/'+namePoke.replace('-', '')+'.png') == true) {
      pokeImg = 'https://play.pokemonshowdown.com/sprites/dex/'+namePoke.replace('-', '')+'.png';
    }


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
      isPublic: createPokemonDto.is_public,
      urlImage: pokeImg
    }    

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

    for await (const element of pokemons) {
               
      const evs = element.evsHp +' HP / ' + element.evsAtk + ' Atk / ' + element.evsDef + ' Def / ' + element.evsSpa+ ' SpA / ' + element.evsSpd+ ' SpD / ' + element.evsSpe+ ' Spe';
      const ivs = element.ivsHp +' HP / ' + element.ivsAtk + ' Atk / ' + element.ivsDef + ' Def / ' + element.ivsSpa+ ' SpA / ' + element.ivsSpd+ ' SpD / ' + element.ivsSpe+ ' Spe';

      const moves = [element.move1, element.move2, element.move3, element.move4];

      const pasteSd = `
        ${element.name} @ ${element.item}
        Ability: ${element.ability}
        Tera Type: ${element.teraType}
        EVs: ${element.evsHp} HP / ${element.evsAtk} Atk / ${element.evsDef} Def / ${element.evsSpa} SpA / ${element.evsSpd} SpD / ${element.evsSpe} Spe
        ${element.nature} Nature
        - ${element.move1}
        - ${element.move2}
        - ${element.move3}
        - ${element.move4}
        `;

      let aux = {
        'id': element.id,
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
        'evs': evs,
        'ivs': ivs,
        'moves': moves,
        'imgPokemon': element.urlImage,
        'isPublic': element.isPublic,
        'spreadUse': element.spreadUse,
        'teamMates': element.teamMates,
        'calculosPrincipales': element.calculosPrincipales,
        'nickPoke': element.nickPoke,
        'pasteSd': pasteSd
      };

      data.push(aux);
      
    }

    salida = [{
      message: 'Pokemons obtained correctly',
      status: 'success',
      code: 200,
      data: data
    }];

    return salida;

  }

  async getPokesHome(){
    this.logger.log('(R) Getting all pokemons: ', PokemonResolver.name);
    let pokemons = await this.pokemonService.findAllPokesHome();
    let salida = [], data = [];

    let idx = 0;
    for await (const element of pokemons) {
      if(idx < 6) {

        let aux = {
          'name': element.name,
          'item': element.item,
          'ability': element.ability,
          'teraType': element.teraType,
          'id': element.id,
          'imgPokemon': element.urlImage,
        };
  
        data.push(aux);

        idx++;
      }
    }

    salida = [{
      message: 'Pokemons obtained correctly',
      status: 'success',
      code: 200,
      data: data
    }];

    return salida;
  }

  async getPokemonById(id: number) {
    this.logger.log('(R) Getting pokemon: ', PokemonResolver.name);
    let pokemon = await this.pokemonService.findOne(id);
    let salida = [], data = [];

    if (pokemon) {
  
      const evs = pokemon.evsHp +' HP / ' + pokemon.evsAtk + ' Atk / ' + pokemon.evsDef + ' Def / ' + pokemon.evsSpa+ ' SpA / ' + pokemon.evsSpd+ ' SpD / ' + pokemon.evsSpe+ ' Spe';
      const ivs = pokemon.ivsHp +' HP / ' + pokemon.ivsAtk + ' Atk / ' + pokemon.ivsDef + ' Def / ' + pokemon.ivsSpa+ ' SpA / ' + pokemon.ivsSpd+ ' SpD / ' + pokemon.ivsSpe+ ' Spe';

      const moves = [pokemon.move1, pokemon.move2, pokemon.move3, pokemon.move4];

      let namePoke = pokemon.name;
      if(pokemon.nickPoke != pokemon.name){ 
        namePoke = pokemon.nickPoke +' (' + pokemon.name + ')';
      }

      const pasteSd = `
        ${namePoke} @ ${pokemon.item}
        Ability: ${pokemon.ability}
        Tera Type: ${pokemon.teraType}
        EVs: ${pokemon.evsHp} HP / ${pokemon.evsAtk} Atk / ${pokemon.evsDef} Def / ${pokemon.evsSpa} SpA / ${pokemon.evsSpd} SpD / ${pokemon.evsSpe} Spe
        ${pokemon.nature} Nature
        - ${pokemon.move1}
        - ${pokemon.move2}
        - ${pokemon.move3}
        - ${pokemon.move4}
        `;

      let aux = {
        'id': pokemon.id,
        'name': pokemon.name,
        'namePoke': namePoke,
        'item': pokemon.item,
        'ability': pokemon.ability,
        'teraType': pokemon.teraType,
        'evsHp': pokemon.evsHp,
        'evsAtk': pokemon.evsAtk,
        'evsDef': pokemon.evsDef,
        'evsSpa': pokemon.evsSpa,
        'evsSpd': pokemon.evsSpd,
        'evsSpe': pokemon.evsSpe,
        'ivsHp': pokemon.ivsHp,
        'ivsAtk': pokemon.ivsAtk,
        'ivsDef': pokemon.ivsDef,
        'ivsSpa': pokemon.ivsSpa,
        'ivsSpd': pokemon.ivsSpd,
        'ivsSpe': pokemon.ivsSpe,
        'nature': pokemon.nature,
        'move1': pokemon.move1,
        'move2': pokemon.move2,
        'move3': pokemon.move3,
        'move4': pokemon.move4,
        'evs': evs,
        'ivs': ivs,
        'moves': moves,
        'urlImage': pokemon.urlImage,
        'isPublic': pokemon.isPublic,
        'spreadUse': pokemon.spreadUse,
        'teamMates': pokemon.teamMates,
        'calculosPrincipales': pokemon.calculosPrincipales,
        'nickPoke': pokemon.nickPoke,
        'pasteSd': pasteSd
      };

      data.push(aux);
    }

    salida = [{
      message: 'Pokemon obtained correctly',
      status: 'success',
      code: 200,
      data: data
    }];

    return salida;
  }

  async pokemonByUser(id: number, token: string) {
    this.logger.log('(R) Pokemon by user: ', PokemonResolver.name);

    let pokemon = await this.pokemonService.findOne(id);
    let salida = [], data = [];

    const tokerUser = token.split(' ')[1];    
    const idUser = await this.jwtTokenService.decodeToken(tokerUser);

    if(pokemon.userId == idUser.userId){
      if (pokemon) {
  
        const evs = pokemon.evsHp +' HP / ' + pokemon.evsAtk + ' Atk / ' + pokemon.evsDef + ' Def / ' + pokemon.evsSpa+ ' SpA / ' + pokemon.evsSpd+ ' SpD / ' + pokemon.evsSpe+ ' Spe';
        const ivs = pokemon.ivsHp +' HP / ' + pokemon.ivsAtk + ' Atk / ' + pokemon.ivsDef + ' Def / ' + pokemon.ivsSpa+ ' SpA / ' + pokemon.ivsSpd+ ' SpD / ' + pokemon.ivsSpe+ ' Spe';
  
        const moves = [pokemon.move1, pokemon.move2, pokemon.move3, pokemon.move4];

        let namePoke = pokemon.name;
        if(pokemon.nickPoke != pokemon.name){ 
          namePoke = pokemon.nickPoke +' (' + pokemon.name + ')';
        }
  
        const pasteSd = `
          ${namePoke} @ ${pokemon.item}
          Ability: ${pokemon.ability}
          Tera Type: ${pokemon.teraType}
          EVs: ${pokemon.evsHp} HP / ${pokemon.evsAtk} Atk / ${pokemon.evsDef} Def / ${pokemon.evsSpa} SpA / ${pokemon.evsSpd} SpD / ${pokemon.evsSpe} Spe
          ${pokemon.nature} Nature
          - ${pokemon.move1}
          - ${pokemon.move2}
          - ${pokemon.move3}
          - ${pokemon.move4}
          `;
  
        let aux = {
          'id': pokemon.id,
          'name': pokemon.name,
          'namePoke': namePoke,
          'item': pokemon.item,
          'ability': pokemon.ability,
          'teraType': pokemon.teraType,
          'evsHp': pokemon.evsHp,
          'evsAtk': pokemon.evsAtk,
          'evsDef': pokemon.evsDef,
          'evsSpa': pokemon.evsSpa,
          'evsSpd': pokemon.evsSpd,
          'evsSpe': pokemon.evsSpe,
          'ivsHp': pokemon.ivsHp,
          'ivsAtk': pokemon.ivsAtk,
          'ivsDef': pokemon.ivsDef,
          'ivsSpa': pokemon.ivsSpa,
          'ivsSpd': pokemon.ivsSpd,
          'ivsSpe': pokemon.ivsSpe,
          'nature': pokemon.nature,
          'move1': pokemon.move1,
          'move2': pokemon.move2,
          'move3': pokemon.move3,
          'move4': pokemon.move4,
          'evs': evs,
          'ivs': ivs,
          'moves': moves,
          'urlImage': pokemon.urlImage,
          'isPublic': pokemon.isPublic,
          'spreadUse': pokemon.spreadUse,
          'teamMates': pokemon.teamMates,
          'calculosPrincipales': pokemon.calculosPrincipales,
          'nickPoke': pokemon.nickPoke,
          'pasteSd': pasteSd
        };
  
        data.push(aux);
      }
  
      salida = [{
        message: 'Pokemon obtained correctly',
        status: 'success',
        code: 200,
        data: data
      }];
    }else{
      salida = [{
        data: null,
        message: 'Usuario no es dueño del Pokemon',
        status: 'error',
        code: 201
      }];
    }


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

  async pokemonsByUser(id: number) {
    this.logger.log('(R) Pokemons by user: ', PokemonResolver.name);
    const pokemons = await this.pokemonService.findPokesByUser(id);

    let salida = [], data = [];

    for await (const element of pokemons) {
               
      const evs = element.evsHp +' HP / ' + element.evsAtk + ' Atk / ' + element.evsDef + ' Def / ' + element.evsSpa+ ' SpA / ' + element.evsSpd+ ' SpD / ' + element.evsSpe+ ' Spe';
      const ivs = element.ivsHp +' HP / ' + element.ivsAtk + ' Atk / ' + element.ivsDef + ' Def / ' + element.ivsSpa+ ' SpA / ' + element.ivsSpd+ ' SpD / ' + element.ivsSpe+ ' Spe';

      const moves = [element.move1, element.move2, element.move3, element.move4];

      const pasteSd = `
        ${element.name} @ ${element.item}
        Ability: ${element.ability}
        Tera Type: ${element.teraType}
        EVs: ${element.evsHp} HP / ${element.evsAtk} Atk / ${element.evsDef} Def / ${element.evsSpa} SpA / ${element.evsSpd} SpD / ${element.evsSpe} Spe
        ${element.nature} Nature
        - ${element.move1}
        - ${element.move2}
        - ${element.move3}
        - ${element.move4}
        `;

      let aux = {
        'id': element.id,
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
        'evs': evs,
        'ivs': ivs,
        'moves': moves,
        'imgPokemon': element.urlImage,
        'isPublic': element.isPublic,
        'spreadUse': element.spreadUse,
        'teamMates': element.teamMates,
        'calculosPrincipales': element.calculosPrincipales,
        'nickPoke': element.nickPoke,
        'pasteSd': pasteSd
      };

      data.push(aux);
      
    }

    salida = [{
      message: 'Pokemons obtained correctly',
      status: 'success',
      code: 200,
      data: data
    }];


    return salida;



    //return pokemons;
  }

}
