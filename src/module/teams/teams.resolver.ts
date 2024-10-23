import { Injectable } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { MyLoggerService } from "../common/logger/myLogger.service";
import { CreateTeamDto } from "./dto/create-team.dto";
import { lastValueFrom } from 'rxjs';
import { HttpService } from "@nestjs/axios";
import { ImageValidatorService } from "../common/img-validator/img-validator.service";

@Injectable()
export class TeamsResolver {

  constructor(
    private readonly teamsService: TeamsService,
    private readonly logger: MyLoggerService,
    private readonly httpService: HttpService,
    private readonly imgValidatorService: ImageValidatorService
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

  async editTeam(id: number, updateTeamDto: CreateTeamDto): Promise<Object> {
    this.logger.log('(U) Editing team: '+id, TeamsResolver.name);
    let team = await this.teamsService.findOne(id);

    if(team){
      return this.teamsService.update(id, updateTeamDto);
    }
    return null;
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
      //console.log(teamJson.paste);

      // Separar los bloques de información para cada Pokémon
      const pokemonBlocks = teamJson.paste.trim().split(/\n\s*(?=[^\n]+ @ )/);

      // Procesar cada bloque para extraer los detalles del Pokémon
      const pokemonArray = await Promise.all(pokemonBlocks.map(async block => {
          const lines = block.split('\n');

          // Extraer el nombre y la especie, ignorando el género
          const [nameSpecies, item] = lines[0].split(' @ ');

          // Ajustar la expresión regular para capturar solo el nombre y la especie
          const nicknameMatch = nameSpecies.match(/(.+?)(?: \([MF]\))?$/); // Captura el nombre y opcionalmente el género

          let nickname, species;

          if (nicknameMatch) {
              // Si hay un apodo y/o género
              nickname = nicknameMatch[1].trim(); // Extrae el nombre del Pokémon (con apodo si existe)
              
              // La especie se puede deducir de la línea original, quitando el apodo
              species = nameSpecies.replace(nickname, '').replace(/ *\([MF]\)$/, '').trim(); // Obtener solo la especie
          } else {
              // Si no hay apodo
              nickname = null; // No tiene apodo
              species = nameSpecies;
          }

          // Asegurarse de que species no esté vacío
          if (!species) {
              species = nameSpecies; // Asigna species al nombre completo si no se extrajo correctamente
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
              species: species || nameSpecies, // Asignar species como nameSpecies si es necesario
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
    
  //async getTeamsByUser(id: number){
  //  this.logger.log('(R) Getting teams by user: '+id, TeamsResolver.name);
  //  let teams = await this.teamsService.findByUser(id);
  //}
}
