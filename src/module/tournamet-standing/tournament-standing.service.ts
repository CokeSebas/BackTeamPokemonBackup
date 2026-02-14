import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as cheerio from 'cheerio';
import { TournamentStanding } from '../../db/entities/tournament-standing.entity';

@Injectable()
export class TournamentStandingService {
  constructor(
    @InjectRepository(TournamentStanding)
    private readonly standingRepo: Repository<TournamentStanding>,
  ) {}

  async registerStandingFromHtml(
    tournamentId: number,
    htmlContent: string,
  ): Promise<void> {
    const $ = cheerio.load(htmlContent);

    const roundLabel = $('h3').first().text().trim();

    if (!roundLabel) {
      throw new BadRequestException('No se pudo obtener la ronda');
    }

    // 🔥 Limpieza previa
    await this.standingRepo.delete({ tournamentId });

    const standings: TournamentStanding[] = [];

    const VALID_CATEGORIES = [
      'Categoría Júnior',
      'Categoría Sénior',
      'Categoría Máster',
    ];

    $('h2').each((_, h2) => {
      const category = $(h2).text().trim();

      // ⛔ Ignorar categorías no válidas (ej: "Todas")
      if (!VALID_CATEGORIES.includes(category)) return;

      // 📌 La tabla viene justo después del h2
      const table = $(h2).nextAll('table.report.border').first();
      const rows = table.find('tr').slice(1); // saltar header

      rows.each((_, row) => {
        const cols = $(row).find('td');
        if (cols.length < 8) return;

        const position = Number($(cols[0]).text().trim());
        const playerName = $(cols[1]).text().trim();
        const section = Number($(cols[2]).text().trim());

        const withdrawalText = $(cols[3]).text().trim();
        const withdrawalRound =
          withdrawalText === '' || withdrawalText === '\u00a0'
            ? null
            : Number(withdrawalText);

        // 1/3/0 (3)
        const historyText = $(cols[4]).text().trim();
        const historyMatch = historyText.match(
          /(\d+)\/(\d+)\/(\d+)\s*\((\d+)\)/,
        );
        if (!historyMatch) return;

        const wins = Number(historyMatch[1]);
        const losses = Number(historyMatch[2]);
        const draws = Number(historyMatch[3]);
        const points = Number(historyMatch[4]);

        const opponentWinPercentage = Number(
          $(cols[6]).text().replace('%', '').trim(),
        );

        const opponentOpponentWinPercentage = Number(
          $(cols[7]).text().replace('%', '').trim(),
        );

        standings.push(
          this.standingRepo.create({
            tournamentId,
            position,
            playerName,
            section,
            withdrawalRound,
            wins,
            losses,
            draws,
            points,
            opponentWinPercentage,
            opponentOpponentWinPercentage,
            roundLabel,
            category,
          }),
        );
      });
    });

    if (!standings.length) {
      throw new BadRequestException(
        'No se encontraron standings válidos para registrar',
      );
    }

    await this.standingRepo.save(standings);
  }

  async getStandingByTournamentId(
    tournamentId: number,
  ): Promise<TournamentStanding[]> {
    const standings = await this.standingRepo.find({
      where: { tournamentId },
      order: { position: 'ASC' },
    });

    if (!standings.length) {
      throw new NotFoundException(
        'No existen standings para este torneo',
      );
    }

    return standings;
  }
}
