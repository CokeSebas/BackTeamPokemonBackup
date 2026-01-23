import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { Response } from 'express';
import { TournamentResolver } from "./tournament.resolver";

@Controller('tournaments')
export class TournamentsController {
  constructor(
    private readonly tournamentsService: TournamentsService,
    private readonly logger: MyLoggerService,
    private readonly tournamentResolver: TournamentResolver
  ) {}

  @Get()
  findAll() {
    this.logger.log('(C) Getting all tournaments: ', TournamentsController.name);
    return this.tournamentsService.findAll();
  }

  @Post()
  async create(@Body() createTournamentDto: CreateTournamentDto, @Res() res: Response): Promise<Object> {
    this.logger.log('(C) Creating tournament', TournamentsController.name);

    const salida = await this.tournamentResolver.create(createTournamentDto);

    if(salida[0].status == 'success'){
      return res.status(salida[0].code).json({salida});
    }else{
      return res.status(salida[0].code).json({salida});
    }
  }

  @Get('torneos-user/:id')
  async getTournamentsByUser(@Res() res: Response, @Param('id') id: number) {
    this.logger.log('(C) Getting tournaments by user: ', TournamentsController.name);
    const salida = await this.tournamentResolver.getTournamentsByUser(id);

    return res.status(salida[0].code).json(salida[0]);
  }
}