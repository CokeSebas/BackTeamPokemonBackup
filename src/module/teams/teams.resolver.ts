import { Injectable } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { MyLoggerService } from "../common/logger/myLogger.service";
import { CreateTeamDto } from "./dto/create-team.dto";
import { lastValueFrom } from 'rxjs';
import { HttpService } from "@nestjs/axios";
import { ImageValidatorService } from "../common/img-validator/img-validator.service";
import { JwtTokenService } from "../common/jwt-token/jwt-token.service";
import { UpdateTeamDto } from "./dto/update-team.dto";

@Injectable()
export class TeamsResolver {

  constructor(
    private readonly teamsService: TeamsService,
    private readonly logger: MyLoggerService,
    private readonly httpService: HttpService,
    private readonly imgValidatorService: ImageValidatorService,
    private readonly jwtTokenService: JwtTokenService
  ){}

  async create(createTeamDto: CreateTeamDto): Promise<Object> {
    this.logger.log('(R) Creating team', TeamsResolver.name)
    let salida = [];

    const teamSave = {
      teamName: createTeamDto.team_name,
      urlPaste: createTeamDto.url_paste,
      formatId: createTeamDto.format_id,
      dateCreated: createTeamDto.date_created,
      userId: createTeamDto.user_id,
      descUso: createTeamDto.desc_uso,
      tournamentUsing: createTeamDto.tournament_using,
      musFav: createTeamDto.mus_fav,
      counters: createTeamDto.counters,
      damageCalcs: createTeamDto.damage_calcs,
      isPublic: createTeamDto.is_public
    }

    const team = await this.teamsService.create(teamSave);

    if(team){
      salida = [{
        message: 'Team created',
        status: 'success',
        code: 200
      }];
    }else{
      salida = [{
        message: 'Error creating team',
        status: 'error',
        code: 500
      }];
    }
    return salida;
  }

  async getAll(){
    this.logger.log('(R) Getting all teams: ', TeamsResolver.name);
    let teams = await this.teamsService.findAll();

    let salida = [], datos = [];

    teams.forEach((element, idx) => {

      if(element.isPublic == true){
          let aux = {
            'id': element.id,
            'team_name': element.teamName,
            'url_paste': element.urlPaste,
            'format_id': element.formatId,
            'desc_uso': element.descUso,
            'tournament_using': element.tournamentUsing,
            'mus_fav': element.musFav,
            'counters': element.counters,
            'damage_calcs': element.damageCalcs,
            //'user_id': element.userId
          }
    
          datos.push(aux);
          idx++;
      }

    });

    salida = [{
      message: 'Teams obtained correctly',
      status: 'success',
      code: 200,
      data: datos
    }];

    return salida;
  }

  async getTeamsHome(){
    this.logger.log('(R) Getting all teams: ', TeamsResolver.name);
    let teams = await this.teamsService.findAll();

    let salida = [], datos = [];

    teams.forEach((element, idx) => {

      if(element.isPublic == true){
        if(idx < 5){
          let aux = {
            'id': element.id,
            'team_name': element.teamName,
            'url_paste': element.urlPaste,
            'format_id': element.formatId,
            'desc_uso': element.descUso,
            'tournament_using': element.tournamentUsing,
            'mus_fav': element.musFav,
            'counters': element.counters,
            'damage_calcs': element.damageCalcs,
            //'user_id': element.userId
          }
    
          datos.push(aux);
          idx++;
        }
      }

    });

    salida = [{
      message: 'Teams obtained correctly',
      status: 'success',
      code: 200,
      data: datos
    }];

    return salida;
  }

  async getTeamById(id: number){
    this.logger.log('(R) Getting team by id: '+id, TeamsResolver.name);
    let team = await this.teamsService.findOne(id);
  
    let salida = [], data = {}, pokes = {};
  
    if(team){
      const teamJson = await this.getTeamJson(team.urlPaste+'/json');
      // Separar los bloques de información para cada Pokémon
      const pokemonBlocks = teamJson.paste.trim().split(/\n\s*(?=[^\n]+ @ )/);

      // Procesar cada bloque para extraer los detalles del Pokémon
      const pokemonArray = await Promise.all(pokemonBlocks.map(async block => {
          const lines = block.split('\n');

          // Extraer el nombre y la especie
          const [nameSpecies, item] = lines[0].split(' @ ');
          let nickname, species;

          let speciesName = nameSpecies.replace('(M)','');
          speciesName = speciesName.replace('(F)','');

          // Verificar si hay un apodo (nickname) o no
          const nicknameMatch = speciesName.match(/(.+?) \((.+)\)/);
          if (nicknameMatch) {
              // Si hay un apodo
              [nickname, species] = nicknameMatch.slice(1, 3);
          } else {
              // Si no hay apodo, tomar directamente la especie
              nickname = null; // No tiene apodo
              species = nameSpecies;
          }

          // Extraer la habilidad
          const ability = lines[1].replace('Ability: ', '');

          // Extraer el nivel
          const level = parseInt(lines[2].replace('Level: ', ''), 10);
          
          // Inicializar variable shiny
          let shiny = false;

          // Verificar si la línea "Shiny" está presente
          const shinyIndex = lines.findIndex(line => line.startsWith('Shiny:'));
          if (shinyIndex !== -1) {
              const shinyLine = lines[shinyIndex].replace('Shiny: ', '').trim();
              shiny = shinyLine.toLowerCase() === 'yes'; // Convertir a booleano
          }

          // Extraer el tipo Tera
          const teraTypeIndex = shinyIndex !== -1 ? shinyIndex + 1 : 3; // Ajustar índice si hay línea Shiny
          const teraType = lines[teraTypeIndex].replace('Tera Type: ', '');

          // Extraer los EVs
          const evsIndex = shinyIndex !== -1 ? shinyIndex + 2 : 4; // Ajustar índice si hay línea Shiny
          const evs = lines[evsIndex].replace('EVs: ', '');

          // Extraer la naturaleza
          const natureIndex = shinyIndex !== -1 ? shinyIndex + 3 : 5; // Ajustar índice si hay línea Shiny
          const nature = lines[natureIndex].replace(' Nature', '');

          // Extraer los IVs si están presentes
          const ivsLineIndex = shinyIndex !== -1 ? shinyIndex + 4 : 6; // Ajustar índice si hay línea Shiny
          const ivsLine = lines[ivsLineIndex] && lines[ivsLineIndex].startsWith('IVs: ') ? lines[ivsLineIndex].replace('IVs: ', '') : null;

          // Extraer los movimientos
          const movesStartIndex = ivsLine ? (shinyIndex !== -1 ? shinyIndex + 5 : 7) : (shinyIndex !== -1 ? shinyIndex + 4 : 6);
          const moves = lines.slice(movesStartIndex).map(line => line.replace('- ', '').trim());

          let pokeImg = '';

          let imgName = species.trim().toLowerCase();
          imgName = imgName.replace('(m)', '');
          imgName = imgName.replace('(f)', '');
          imgName = imgName.trim();

          // Comprobar si la imagen existe en las diferentes URLs
          if (await this.imgValidatorService.checkImageExists('https://play.pokemonshowdown.com/sprites/gen5/' + imgName + '.png')) {
              pokeImg = 'https://play.pokemonshowdown.com/sprites/gen5/' + imgName + '.png';
          } else if (await this.imgValidatorService.checkImageExists('https://play.pokemonshowdown.com/sprites/dex/' + imgName.replace('-', '') + '.png')) {
              pokeImg = 'https://play.pokemonshowdown.com/sprites/dex/' + imgName.replace('-', '') + '.png';
          }
          
          // Crear el objeto con la información extraída
          return {
              nickname,
              species,
              pokeImg,
              item,
              ability,
              level,
              shiny, // Agregar la propiedad shiny
              teraType,
              evs,
              nature,
              ivs: ivsLine,
              moves
          };
      }));

            
      data = {
        'team_name': team.teamName,
        'url_paste': team.urlPaste,
        'url_json': team.urlPaste+'/json',
        'pokemons': pokemonArray,
        'desc_uso': team.descUso,
        'tournament_using': team.tournamentUsing,
        'mus_fav': team.musFav,
        'counters': team.counters,
        'damage_calcs': team.damageCalcs,
        'is_public': team.isPublic,
        'format_id': team.formatId,
        'user_id': team.userId
      }
  
      salida = [{
        data: data,
        message: 'Team obtained correctly',
        status: 'success',
        code: 200
      }];
    }else{
      salida = [{
        message: 'Team not found',
        status: 'error',
        code: 404
      }];
    }
    return salida;
  }

  async getUserTeam(id: number, token: string){
    this.logger.log('(R) Getting user team: '+id, TeamsResolver.name);

    let salida = [], data = {};

    let team = await this.teamsService.findOne(id);

    const tokerUser = token.split(' ')[1];    
    const idUser = await this.jwtTokenService.decodeToken(tokerUser);

    if(team.userId == idUser.userId){
      if(team){
        const teamJson = await this.getTeamJson(team.urlPaste+'/json');

        // Separar los bloques de información para cada Pokémon
        const pokemonBlocks = teamJson.paste.trim().split(/\n\s*(?=[^\n]+ @ )/);

        // Procesar cada bloque para extraer los detalles del Pokémon
        const pokemonArray = await Promise.all(pokemonBlocks.map(async block => {
            const lines = block.split('\n');

            // Extraer el nombre y la especie
            const [nameSpecies, item] = lines[0].split(' @ ');
            let nickname, species;

            let speciesName = nameSpecies.replace('(M)','');
            speciesName = speciesName.replace('(F)','');

            // Verificar si hay un apodo (nickname) o no
            const nicknameMatch = speciesName.match(/(.+?) \((.+)\)/);
            if (nicknameMatch) {
                // Si hay un apodo
                [nickname, species] = nicknameMatch.slice(1, 3);
            } else {
                // Si no hay apodo, tomar directamente la especie
                nickname = null; // No tiene apodo
                species = nameSpecies;
            }

            // Extraer la habilidad
            const ability = lines[1].replace('Ability: ', '');

            // Extraer el nivel
            const level = parseInt(lines[2].replace('Level: ', ''), 10);
            
            // Inicializar variable shiny
            let shiny = false;

            // Verificar si la línea "Shiny" está presente
            const shinyIndex = lines.findIndex(line => line.startsWith('Shiny:'));
            if (shinyIndex !== -1) {
                const shinyLine = lines[shinyIndex].replace('Shiny: ', '').trim();
                shiny = shinyLine.toLowerCase() === 'yes'; // Convertir a booleano
            }

            // Extraer el tipo Tera
            const teraTypeIndex = shinyIndex !== -1 ? shinyIndex + 1 : 3; // Ajustar índice si hay línea Shiny
            const teraType = lines[teraTypeIndex].replace('Tera Type: ', '');

            // Extraer los EVs
            const evsIndex = shinyIndex !== -1 ? shinyIndex + 2 : 4; // Ajustar índice si hay línea Shiny
            const evs = lines[evsIndex].replace('EVs: ', '');

            // Extraer la naturaleza
            const natureIndex = shinyIndex !== -1 ? shinyIndex + 3 : 5; // Ajustar índice si hay línea Shiny
            const nature = lines[natureIndex].replace(' Nature', '');

            // Extraer los IVs si están presentes
            const ivsLineIndex = shinyIndex !== -1 ? shinyIndex + 4 : 6; // Ajustar índice si hay línea Shiny
            const ivsLine = lines[ivsLineIndex] && lines[ivsLineIndex].startsWith('IVs: ') ? lines[ivsLineIndex].replace('IVs: ', '') : null;

            // Extraer los movimientos
            const movesStartIndex = ivsLine ? (shinyIndex !== -1 ? shinyIndex + 5 : 7) : (shinyIndex !== -1 ? shinyIndex + 4 : 6);
            const moves = lines.slice(movesStartIndex).map(line => line.replace('- ', '').trim());

            let pokeImg = '';

            let imgName = species.trim().toLowerCase();
            imgName = imgName.replace('(m)', '');
            imgName = imgName.replace('(f)', '');
            imgName = imgName.trim();

            // Comprobar si la imagen existe en las diferentes URLs
            if (await this.imgValidatorService.checkImageExists('https://play.pokemonshowdown.com/sprites/gen5/' + imgName + '.png')) {
                pokeImg = 'https://play.pokemonshowdown.com/sprites/gen5/' + imgName + '.png';
            } else if (await this.imgValidatorService.checkImageExists('https://play.pokemonshowdown.com/sprites/dex/' + imgName.replace('-', '') + '.png')) {
                pokeImg = 'https://play.pokemonshowdown.com/sprites/dex/' + imgName.replace('-', '') + '.png';
            }
            
            // Crear el objeto con la información extraída
            return {
                nickname,
                species,
                pokeImg,
                item,
                ability,
                level,
                shiny, // Agregar la propiedad shiny
                teraType,
                evs,
                nature,
                ivs: ivsLine,
                moves
            };
        }));

              
        data = {
          'team_name': team.teamName,
          'url_paste': team.urlPaste,
          'url_json': team.urlPaste+'/json',
          'pokemons': pokemonArray,
          'desc_uso': team.descUso,
          'tournament_using': team.tournamentUsing,
          'mus_fav': team.musFav,
          'counters': team.counters,
          'damage_calcs': team.damageCalcs,
          'is_public': team.isPublic,
          'format_id': team.formatId,
          'user_id': team.userId
        }
    
        salida = [{
          data: data,
          message: 'Team obtained correctly',
          status: 'success',
          code: 200
        }];
      }else{
        salida = [{
          message: 'Team not found',
          status: 'error',
          code: 404
        }];
      }
    }else{
      salida = [{
        data: null,
        message: 'Usuario no es dueño del team',
        status: 'error',
        code: 201
      }];
    }

    //verificar user id con el obtenido en el token, o en la query, verificar el quipo mediante id del teamm e id del usuario, aplicar lo mismo para los teams y en modulo pokes
    
    return salida;
  }

  async getTeamsByUser(id: number){
    this.logger.log('(R) Getting teams by user: '+id, TeamsResolver.name);
    let teams = await this.teamsService.findTeamsByUser(id);

    let salida = [], datos = [];

    teams.forEach((element, idx) => {

      let aux = {
        'id': element.id,
        'team_name': element.teamName,
        'url_paste': element.urlPaste,
        'format_id': element.formatId,
        'desc_uso': element.descUso,
        'tournament_using': element.tournamentUsing,
        'mus_fav': element.musFav,
        'counters': element.counters,
        'damage_calcs': element.damageCalcs,
        //'user_id': element.userId
      }

      datos.push(aux);
      idx++;

    });

    salida = [{
      message: 'Teams obtained correctly',
      status: 'success',
      code: 200,
      data: datos
    }];

    return salida;
  }


  async getTeamJson(urlPaste: string){
    try {
        const response = await lastValueFrom(this.httpService.get(urlPaste));
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        throw new Error('Error al obtener los datos del equipo de Pokémon');
    }
  }

  async editTeam(id: number, updateTeamDto: UpdateTeamDto): Promise<Object> {
    this.logger.log('(R) Edit team: '+id, TeamsResolver.name);

    let salida = [], data = {};

    const teamExist = await this.teamsService.findOne(id);

    if(teamExist){

      const teamUpdate = {
        teamName: updateTeamDto.team_name,
        urlPaste: updateTeamDto.url_paste,
        formatId: updateTeamDto.format_id,
        dateCreated: updateTeamDto.date_created,
        userId: updateTeamDto.user_id,
        descUso: updateTeamDto.desc_uso,
        tournamentUsing: updateTeamDto.tournament_using,
        musFav: updateTeamDto.mus_fav,
        counters: updateTeamDto.counters,
        damageCalcs: updateTeamDto.damage_calcs,
        isPublic: updateTeamDto.is_public
      }

      const team = await this.teamsService.update(id, teamUpdate);

      if(team.affected === 1){
        data = {
          message: 'Team edited correctly',
          status: 'success',
          code: 200
        };

        salida = [{
          data: data,
          message: 'Team edited correctly',
          status: 'success',
          code: 200
        }]
      }else{
        salida = [{
          message: 'Team not edited',
          status: 'error',
          code: 201 
        }];
      }
    }else{
      salida = [{
        message: 'Team not found',
        status: 'error',
        code: 404 
      }];
    }

    return salida;
  }
    
  //async getTeamsByUser(id: number){
  //  this.logger.log('(R) Getting teams by user: '+id, TeamsResolver.name);
  //  let teams = await this.teamsService.findByUser(id);
  //}
}
