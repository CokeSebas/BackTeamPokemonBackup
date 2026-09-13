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

    const query = this.tournamentRepository
      .createQueryBuilder('tournament')
      .addSelect(`
        EXISTS (
          SELECT 1
          FROM tournament_round tr
          WHERE tr.tournament_id = tournament.id
        )
      `, 'has_round')
      .addSelect(`
        EXISTS (
          SELECT 1
          FROM tournament_standing ts
          WHERE ts.tournament_id = tournament.id
        )
      `, 'has_standing')
      .addSelect(`
        EXISTS (
          SELECT 1
          FROM tournament_round_result trr
          INNER JOIN tournament_round tr
            ON tr.id = trr.round_id
          WHERE tr.tournament_id = tournament.id
        )
      `, 'has_results')
      .orderBy('tournament.id', 'DESC');

    const { entities, raw } = await query.getRawAndEntities();

    return entities.map((tournament, index) => ({
      ...tournament,
      hasRound: raw[index].has_round === true || raw[index].has_round === 'true',
      hasStanding: raw[index].has_standing === true || raw[index].has_standing === 'true',
      hasResults: raw[index].has_results === true || raw[index].has_results === 'true',
    }));
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

  async findTournamentNameById(id: number): Promise<string | null> {
    this.logger.log(
      `(S) Find tournament name by id: ${id}`,
      TournamentsService.name,
    );

    const tournament = await this.tournamentRepository.findOne({
      where: { id },
      select: ['nombre'],
    });

    return tournament ? tournament.nombre : null;
  }

}
