import { Controller, Get, Param } from '@nestjs/common';
import { PointsperpositionService } from './pointsperposition.service';
import { MyLoggerService } from '../common/logger/myLogger.service';

@Controller('pointsperposition')
export class PointsperpositionController {
  constructor(
    private readonly pointsperpositionService: PointsperpositionService,
    private readonly logger: MyLoggerService
  ) {}


  @Get()
  findAll() {
    this.logger.log('(C) Getting all points per position: ', PointsperpositionController.name);
    return this.pointsperpositionService.findAll();
  }

  @Get('/typeTournament/:idTournament')
  findAllByTypeTournament(@Param('idTournament') idTournament: number) {
    this.logger.log('(C) Getting all points per position by type tournament: ', PointsperpositionController.name);
    return this.pointsperpositionService.findByTournament(idTournament);
  }

}
