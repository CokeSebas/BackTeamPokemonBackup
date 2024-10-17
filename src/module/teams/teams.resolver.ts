import { Injectable } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { MyLoggerService } from "../common/logger/myLogger.service";
import { CreateTeamDto } from "./dto/create-team.dto";

@Injectable()
export class TeamsResolver {

  constructor(
    private readonly teamsService: TeamsService,
    private readonly  logger: MyLoggerService
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
  
    let salida = [], data = {};
  
    if(team){
      data = {
        'team_name': team.teamName,
        'url_paste': team.urlPaste,
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
    
  //async getTeamsByUser(id: number){
  //  this.logger.log('(R) Getting teams by user: '+id, TeamsResolver.name);
  //  let teams = await this.teamsService.findByUser(id);
  //}
}
