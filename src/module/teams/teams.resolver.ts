import { Injectable } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { MyLoggerService } from "../common/logger/myLogger.service";
import { CreateTeamDto } from "./dto/create-team.dto";
import { lastValueFrom } from 'rxjs';
import { HttpService } from "@nestjs/axios";
import { ImageValidatorService } from "../common/img-validator/img-validator.service";
import { JwtTokenService } from "../common/jwt-token/jwt-token.service";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { UsersResolver } from "../users/users.resolver";

@Injectable()
export class TeamsResolver {

  private paradoxPastPokes = ['flutter mane', 'great tusk', 'scream tail', 'brute bonnet', 'slither wing', 'sandy shocks', 'roaring moon', 'walking wake', 'gouging fire', 'raging bolt'];

  constructor(
    private readonly teamsService: TeamsService,
    private readonly logger: MyLoggerService,
    private readonly httpService: HttpService,
    private readonly imgValidatorService: ImageValidatorService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly usersResolver: UsersResolver
  ){}

  async create(createTeamDto: CreateTeamDto): Promise<Object> {
    this.logger.log('(R) Creating team', TeamsResolver.name)
    let salida = [];

    const team = await this.teamsService.create(createTeamDto);

    //console.log(team);

    if(team){
      
      await this.actualizarPokes();

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
    //let teams = await this.teamsService.findAll();
    let teams = await this.teamsService.findAllJoin();

    let salida = [], datos = [];

    teams.forEach((element, idx) => {

      let aux = {
        'id': element.id,
        'team_name': element.teamName,
        'url_paste': element.urlPaste,
        'format_id': element.formatId,
        //'desc_uso': element.descUso,
        //'tournament_using': element.tournamentUsing,
        //'mus_fav': element.musFav,
        //'counters': element.counters,
        //'damage_calcs': element.damageCalcs,
        'subFormatId': element.subformat.id,
        'subFormatName': element.subformat.subFormatName,
        'subFormatDesc': element.subformat.abrevSubFormat,
        //'user_id': element.userId,
        "poke1": element.poke1, 
        "poke2": element.poke2, 
        "poke3": element.poke3, 
        "poke4": element.poke4, 
        "poke5": element.poke5, 
        "poke6": element.poke6, 
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

  async getTeamsHome(){
    this.logger.log('(R) Getting all teams home: ', TeamsResolver.name);
    let teams = await this.teamsService.findAllHomeJoin();

    let salida = [], datos = [];

    teams.forEach((element, idx) => {
      if(idx <= 5){
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
          'subFormatId': element.subformat.id,
          'subFormatName': element.subformat.subFormatName,
          'subFormatDesc': element.subformat.abrevSubFormat,
          //'user_id': element.userId,
           "poke1": element.poke1, 
          "poke2": element.poke2, 
          "poke3": element.poke3, 
          "poke4": element.poke4, 
          "poke5": element.poke5, 
          "poke6": element.poke6, 
        }
  
        datos.push(aux);
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
    //let team = await this.teamsService.findOne(id);
    let team = await this.teamsService.findOneJoin(id);
  
    let salida = [], data = {};
  
    if(team){
      const teamJson = await this.getTeamJson(team.urlPaste.trim()+'/json');

      data = await this.getDetailTeam(teamJson, team);
  
      salida = [{
        data: data,
        teamJson: teamJson.paste,
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

    let team = await this.teamsService.findOneJoin(id);

    const tokerUser = token.split(' ')[1];    
    const idUser = await this.jwtTokenService.decodeToken(tokerUser);

    if(team.userId == idUser.userId){
      if(team){
        const teamJson = await this.getTeamJson(team.urlPaste.trim()+'/json');

        data = await this.getDetailTeam(teamJson, team);
    
        salida = [{
          data: data,
          teamJson: teamJson.paste,
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

    return salida;
  }
  async getUserTeamSheet(id: number, token: string){
    this.logger.log('(R) Getting user team: '+id, TeamsResolver.name);

    let salida = [], data = {}, dataUser = {};

    let team = await this.teamsService.findOneJoin(id);

    const tokerUser = token.split(' ')[1];    
    const idUser = await this.jwtTokenService.decodeToken(tokerUser);

    if(team.userId == idUser.userId){
      if(team){
        const teamJson = await this.getTeamJson(team.urlPaste.trim()+'/json');

        data = await this.getDetailTeam(teamJson, team);

        let user = await this.usersResolver.getUserById(idUser.userId);
        const { name, lastName, nickName } = user[0].data;
   
        dataUser = {
          'name': name + ' ' + lastName,
          'nickName': nickName,
          //popid
        }

        salida = [{
          data: data,
          dataUser: dataUser,
          teamJson: teamJson.paste,
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

    return salida;
  }

  async getTeamsByUser(id: number){
    this.logger.log('(R) Getting teams by user: '+id, TeamsResolver.name);
    let teams = await this.teamsService.findTeamsByUserJoin(id);

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
        'subFormatId': element.subformat.id,
        'subFormatName': element.subformat.subFormatName,
        'subFormatDesc': element.subformat.abrevSubFormat,
        "poke1": element.poke1, 
        "poke2": element.poke2, 
        "poke3": element.poke3, 
        "poke4": element.poke4, 
        "poke5": element.poke5, 
        "poke6": element.poke6, 
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

      /*
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
        */

      //console.log(updateTeamDto);

      const team = await this.teamsService.update(id, updateTeamDto);

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

  async getDetailTeam(teamJson: any, team: any, onlyImages = false) {

    /* ===============================
      NORMALIZAR ENTRADA (ORDEN LIBRE)
    =============================== */

    let rawText = '';

    if (Array.isArray(teamJson.paste)) {
      rawText = teamJson.paste.join('\n');
    } else {
      rawText = teamJson.paste;
    }

    // Normalizar saltos de línea
    rawText = rawText.replace(/\r/g, '');

    // Separar por Pokémon cuando detecta "Nombre @ Item"
    const pokemonBlocks = rawText
      .split(/\n(?=[^\n]+ @ )/)
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const pokemonArray = await Promise.all(
      pokemonBlocks.map(async (block) => {

        const rawLines = block.split('\n');

        // Limpiar líneas, eliminar vacías y eliminar "Level:"
        const lines = rawLines
          .map(l => l.trim())
          .filter(l => l !== '' && !l.startsWith('Level:'));

        /* ===============================
          NAME + ITEM
        =============================== */

        let nameSpecies: string;
        let item: string | null = null;

        if (lines[0].includes(' @ ')) {
          [nameSpecies, item] = lines[0].split(' @ ');
        } else {
          nameSpecies = lines[0];
        }

        // Eliminar género
        let cleanedName = nameSpecies
          .replace(/\(M\)/g, '')
          .replace(/\(F\)/g, '')
          .trim();

        let nickname: string | null = null;
        let species: string;

        const nicknameMatch = cleanedName.match(/(.+?) \((.+)\)/);

        if (nicknameMatch) {
          nickname = nicknameMatch[1];
          species = nicknameMatch[2];
        } else {
          species = cleanedName;
        }

        /* ===============================
          ATRIBUTOS DINÁMICOS
        =============================== */

        const ability =
          lines.find(l => l.startsWith('Ability:'))?.replace('Ability: ', '') || null;

        const shinyLine = lines.find(l => l.startsWith('Shiny:'));
        const shiny = shinyLine
          ? shinyLine.replace('Shiny: ', '').toLowerCase() === 'yes'
          : false;

        const teraType =
          lines.find(l => l.startsWith('Tera Type:'))?.replace('Tera Type: ', '') || null;

        const evs =
          lines.find(l => l.startsWith('EVs:'))?.replace('EVs: ', '') || null;

        const nature =
          lines.find(l => l.includes('Nature'))?.replace(' Nature', '') || null;

        const ivsLine =
          lines.find(l => l.startsWith('IVs:'))?.replace('IVs: ', '') || null;

        const moves = lines
          .filter(l => l.startsWith('- '))
          .map(l => l.replace('- ', '').trim());

        /* ===============================
          IMAGEN
        =============================== */

        let pokeImg = '';

        let imgName = species.trim().toLowerCase();
        imgName = imgName.replace(/\(m\)|\(f\)/g, '').trim();

        if (await this.imgValidatorService.checkImageExists(
          `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`
        )) {
          pokeImg = `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`;

        } else if (await this.imgValidatorService.checkImageExists(
          `https://play.pokemonshowdown.com/sprites/dex/${imgName.replace('-', '')}.png`
        )) {
          pokeImg = `https://play.pokemonshowdown.com/sprites/dex/${imgName.replace('-', '')}.png`;

        } else if (
          imgName === 'tauros-paldea-aqua' ||
          imgName === 'tauros-paldea-blaze' ||
          imgName === 'tauros-paldea-combat' ||
          imgName === 'urshifu-rapid-strike'
        ) {
          imgName = imgName.replace(/-(?=[^-]*$)/, '');
          pokeImg = `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`;

        } else if (imgName.includes('iron')) {
          imgName = imgName.replace(' ', '');
          pokeImg = `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`;

        } else if (this.paradoxPastPokes.includes(imgName)) {
          imgName = imgName.replace(' ', '');
          pokeImg = `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`;

        } else if (imgName.includes('necrozma-')) {
          imgName = imgName.replace(/-(?=[^-]*$)/, '');
          pokeImg = `https://play.pokemonshowdown.com/sprites/gen5/${imgName}.png`;
        }

        /* ===============================
          RETURN
        =============================== */

        if (onlyImages) {
          return { pokeImg };
        }

        return {
          nickname,
          species,
          pokeImg,
          item,
          ability,
          shiny,
          teraType,
          evs,
          nature,
          ivs: ivsLine,
          moves
        };
      })
    );

    if (onlyImages) {
      return pokemonArray;
    }

    return {
      team_name: team.teamName,
      url_paste: team.urlPaste,
      url_json: team.urlPaste + '/json',
      pokemons: pokemonArray,
      desc_uso: team.descUso,
      tournament_using: team.tournamentUsing,
      mus_fav: team.musFav,
      counters: team.counters,
      damage_calcs: team.damageCalcs,
      is_public: team.isPublic,
      format_id: team.formatId,
      user_id: team.userId,
      subFormatId: team.subformat.id,
      subFormatName: team.subformat.subFormatName,
      subFormatDesc: team.subformat.abrevSubFormat
    };
  }


  async actualizarPokes(){
    console.log('actualizando pokes');
    let salida = [];
    try {
      let teams = await this.teamsService.getallTeamsUpdate();

      //return teams;

      for await (const team of teams) {
        const teamJson = await this.getTeamJson(team.urlPaste.trim()+'/json');

        let data = await this.getDetailTeam(teamJson, team, true);
        //console.log('teamJson', teamJson);
        //console.log(team.id);
        //console.log(data[0]);
        
        const pokes = Array.from({ length: 6 }, (_, i) => data[i]?.pokeImg || null);

        let aux = {
          id: team.id,
          poke1: pokes[0],
          poke2: pokes[1],
          poke3: pokes[2],
          poke4: pokes[3],
          poke5: pokes[4],
          poke6: pokes[5],
        };

        await this.teamsService.updateTeamPokes(team.id, ...pokes);


        salida.push(aux);
      }
      
      return salida;
      
    } catch (error) {
      throw new Error(error);
      
    }
  }

}
