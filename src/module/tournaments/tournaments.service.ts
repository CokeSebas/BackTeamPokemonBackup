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

  async create(createTournamentDto): Promise<Object> {
    this.logger.log('(S) Creating tournament', TournamentsService.name);
    const tournament = this.tournamentRepository.create(createTournamentDto);
    return this.tournamentRepository.save(tournament);
  }

  async getTournamentsByUser(userId: number) {
    this.logger.log('(S) Fetching tournaments by user: '+userId, TournamentsService.name);
    return this.tournamentRepository.find({ where: { userId } });
  }

  async findAll() {
    this.logger.log('(S) Find all tournaments', TournamentsService.name);
    return this.tournamentRepository.find();
  }


  async getTournamentWithStanding(tournamentId: number) {
    return this.tournamentRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect(
        't.standings',
        'ts',
      )
      .where('t.id = :tournamentId', { tournamentId })
      .orderBy('ts.position', 'ASC')
      .getOne();
  }

}
