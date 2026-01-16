import { Controller, Get } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { MyLoggerService } from '../common/logger/myLogger.service';

@Controller('tournaments')
export class TournamentsController {
  constructor(
    private readonly tournamentsService: TournamentsService,
    private readonly logger: MyLoggerService
  ) {}

  @Get()
  findAll() {
    this.logger.log('(C) Getting all tournaments: ', TournamentsController.name);
    return this.tournamentsService.findAll();
  }
}