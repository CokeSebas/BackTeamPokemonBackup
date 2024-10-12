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
    this.logger.log('(C) Creating team', TeamsResolver.name)
    let salida = [];

    const team = this.teamsService.create(createTeamDto);

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

    teams.forEach(element => {
      let aux = {
        'team_name': element.teamName,
        'url_paste': element.urlPaste,
        'format_id': element.formatId,
        'user_id': element.userId
      }

      datos.push(aux);
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
