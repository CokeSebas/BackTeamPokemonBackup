import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as cheerio from 'cheerio';

import { TournamentRoundResultEntity } from '../../db/entities/tournament-result.entity';
import { TournamentRoundEntity } from '../../db/entities/tournament-round.entity';

@Injectable()
export class TournamentRoundResultService {
  constructor(
    @InjectRepository(TournamentRoundResultEntity)
    private readonly resultRepo: Repository<TournamentRoundResultEntity>,

    @InjectRepository(TournamentRoundEntity)
    private readonly roundRepo: Repository<TournamentRoundEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async parseAndSave(tournamentId: number, html: string) {
    // -----------------------------
    // 🔍 validar ronda
    // -----------------------------
    const round = await this.roundRepo.findOne({
      where: {
        tournamentId: tournamentId,
      },
      order: {
        roundNumber: 'DESC',
      },
    });

    if (!round) {
      throw new BadRequestException(
        'El torneo no tiene rondas registradas',
      );
    }

    // -----------------------------
    // 🧠 parse HTML
    // -----------------------------
    const $ = cheerio.load(html);

    const results: Partial<TournamentRoundResultEntity>[] =
      [];

    $('table.report tr')
      .slice(1)
      .each((_, row) => {
        const cols = $(row).find('td');
        if (cols.length < 5) return;

        const playerName = $(cols[0])
          .text()
          .trim();

        const section = Number(
          $(cols[1]).text().trim(),
        );

        const wins = Number(
          $(cols[2]).text().trim(),
        );

        const losses = Number(
          $(cols[3]).text().trim(),
        );

        const draws = Number(
          $(cols[4]).text().trim(),
        );

        if (!playerName) return;

        results.push({
          roundId: round.id,
          playerName,
          section: isNaN(section)
            ? null
            : section,
          wins,
          losses,
          draws,
        });
      });

    if (!results.length) {
      throw new BadRequestException(
        'No se encontraron resultados en el archivo',
      );
    }

    // -----------------------------
    // 💾 guardar (transacción)
    // -----------------------------
    return this.dataSource.transaction(
      async manager => {
        // elimina resultados anteriores de la ronda
        await manager.delete(
          TournamentRoundResultEntity,
          {  roundId: round.id },
        );

        const entities = manager.create(
          TournamentRoundResultEntity,
          results,
        );

        await manager.save(entities);

        return {
          roundId: round.id,
          results: entities.length,
        };
      },
    );
  }

  async getLatestRoundResultsByTournament(
    tournamentId: number,
  ): Promise<{
    round: TournamentRoundEntity;
    results: TournamentRoundResultEntity[];
  }> {
    // 1️⃣ Obtener la ronda más actual
    const latestRound = await this.roundRepo.findOne({
      where: { tournamentId },
      order: { roundNumber: 'DESC' },
    });

    if (!latestRound) {
      throw new NotFoundException(
        `No se encontraron rondas para el torneo ${tournamentId}`,
      );
    }

    // 2️⃣ Obtener resultados de esa ronda
    const results = await this.resultRepo.find({
      where: { roundId: latestRound.id },
      order: { wins: 'DESC', draws: 'DESC' },
    });

    return {
      round: latestRound,
      results,
    };
  }
}
