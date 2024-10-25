import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Headers } from '@nestjs/common';
import { Response } from 'express';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsResolver } from './teams.resolver';
import { MyLoggerService } from '../common/logger/myLogger.service';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly logger: MyLoggerService,
    private readonly teamsService: TeamsService,
    private readonly teamsResolver: TeamsResolver
  ) {}

  @Post()
  async create(@Body() createTeamDto: CreateTeamDto, @Res() res: Response): Promise<Object> {
    this.logger.log('(C) Creating team', TeamsController.name);
    const salida = await this.teamsResolver.create(createTeamDto);

    if(salida[0].status == 'success'){
      return res.status(salida[0].code).json({salida});
    }else{
      return res.status(salida[0].code).json({salida});
    }
  }

  @Get()
  async findAll(@Res() res: Response) {
    this.logger.log('(C) Getting all teams', TeamsController.name);
    const salida = await this.teamsResolver.getAll();
     return res.status(salida[0].code).json(salida[0]);
  }

  @Get('/teams-home')
  async getTeamsHome(@Res() res: Response) {
    this.logger.log('(C) Getting all teams', TeamsController.name);
    const salida = await this.teamsResolver.getTeamsHome();
    return res.status(salida[0].code).json(salida[0]);
  }

  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    this.logger.log('(C) Getting team by id: '+id, TeamsController.name);
    const salida = await this.teamsResolver.getTeamById(+id);
    return res.status(salida[0].code).json(salida[0]);
    //return this.teamsService.findOne(+id);
  }

  @Get('team-user/:id')
  async getTeamByUser(@Res() res: Response, @Param('id') id: string, @Headers('authorization') token: string) {
    this.logger.log('(C) Getting user team by team id: '+id, TeamsController.name);
    const salida = await this.teamsResolver.getUserTeam(+id, token);
    return res.status(salida[0].code).json(salida[0]);
  }

  @Get('/teams-user/:id')
  async getTeamsByUser(@Res() res: Response, @Param('id') id: string) {
    this.logger.log('(C) Getting teams by user: '+id, TeamsController.name);
    const salida = await this.teamsResolver.getTeamsByUser(+id);
    return res.status(salida[0].code).json(salida[0]);
  }

  @Post('/edit/:id')
  async editTeam(@Res() res: Response, @Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    this.logger.log('(C) Edit team: '+id, TeamsController.name);
    const salida = await this.teamsResolver.editTeam(+id, updateTeamDto);
    return res.status(salida[0].code).json(salida[0].data);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(+id);
  }
}
