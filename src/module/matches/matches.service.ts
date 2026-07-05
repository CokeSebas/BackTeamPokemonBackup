import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Match } from '../../db/entities/match.entity';
import { MatchPokemon } from '../../db/entities/match-pokemon.entity';
import { CreateBulkMatchDto } from './dto/create-bulk-match.dto';
@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,

    private readonly dataSource: DataSource,
  ) {}

  async createBulk(dto: CreateBulkMatchDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const matchRepo = manager.getRepository(Match);

        const matches = dto.matches.map((m) => {
          const match = new Match();

          match.tournamentName = dto.tournamentName;
          match.opponentName = m.opponentName;
          match.result = m.result;
          match.round = m.round;
          match.user = dto.userId as any;

          match.pokemons = m.pokemons.map((p, index) => {
            const mp = new MatchPokemon();
            mp.pokemonId = p.id;
            mp.pokemonName = p.name;
            mp.slot = index + 1;
            return mp;
          });

          return match;
        });

        return await matchRepo.save(matches);
      });
    } catch (error) {
      // 🧨 error típico: UNIQUE constraint
      if (error.code === '23505') {
        throw new BadRequestException(
          'Ya existe una ronda registrada para este torneo',
        );
      }

      console.error(error);
      throw new BadRequestException('Error al guardar los matches');
    }
  }

  async getUserTournamentStats(userId: number) {
    const result = await this.matchRepository
      .createQueryBuilder('m')
      .select('m.tournamentName', 'tournamentName')
      .addSelect('COUNT(*)', 'totalRounds')
      .addSelect(`
        SUM(CASE WHEN m.result = 'win' THEN 1 ELSE 0 END)
      `, 'wins')
      .addSelect(`
        SUM(CASE WHEN m.result = 'loss' THEN 1 ELSE 0 END)
      `, 'losses')
      .addSelect(`
        SUM(CASE WHEN m.result = 'tie' THEN 1 ELSE 0 END)
      `, 'ties')
      .addSelect('m.user_id', 'userId')
      .where('m.user_id = :userId', { userId })
      .groupBy('m.tournamentName, m.user_id')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    // 🔥 calcular winrate
    return result.map(r => {
      const total = Number(r.totalRounds);
      const wins = Number(r.wins);

      return {
        userId: Number(r.userId),
        tournamentName: r.tournamentName,
        totalRounds: total,
        wins: Number(r.wins),
        losses: Number(r.losses),
        ties: Number(r.ties),
        winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
      };
    });
  }

  async getTournamentDetail(userId: number, tournamentName: string) {
    const result = await this.dataSource.query(
      `
      SELECT 
        m.id,
        m.round,
        m.opponent_name AS "opponentName",
        m.result,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'name', p.name,
              'image', p.image_url,
              'slot', mp.slot
            )
            ORDER BY mp.slot
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS pokemons
      FROM matches m
      LEFT JOIN match_pokemons mp ON mp.match_id = m.id
      LEFT JOIN list_pokemons p ON p.id = mp.pokemon_id
      WHERE m.user_id = $1
        AND m.tournament_name = $2
      GROUP BY m.id
      ORDER BY m.round ASC;
      `,
      [userId, tournamentName],
    );

    return result;
  }
}