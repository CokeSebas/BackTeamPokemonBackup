import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournaments } from '../../db/entities/tournaments.entity';
import { Repository } from 'typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';

@Injectable()
export class TournamentsService {

  constructor(
    @InjectRepository(Tournaments)
    private readonly tournamentRepository: Repository<Tournaments>,
    private readonly logger: MyLoggerService
  ) { }

  async findAll() {
    this.logger.log('(S) Find all tournaments', TournamentsService.name);
    return this.tournamentRepository.find();
  }
}
