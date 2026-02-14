import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTournamentRoundDto } from './dto/create-tournament-round.dto';
import { UpdateTournamentRoundDto } from './dto/update-tournament-round.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { TournamentRoundEntity } from '../../db/entities/tournament-round.entity';
import { TournamentPairingEntity } from '../../db/entities/tournament-pairing.entity';
import { DataSource, Repository } from 'typeorm';
import * as cheerio from 'cheerio';

@Injectable()
export class TournamentRoundsService {
  constructor(
    @InjectRepository(TournamentRoundEntity)
    private readonly roundRepo: Repository<TournamentRoundEntity>,

    @InjectRepository(TournamentPairingEntity)
    private readonly pairingRepo: Repository<TournamentPairingEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async parseAndSave(html: string, idTorneo: number) {
    const $ = cheerio.load(html);

    // -----------------------------
    // 🧠 Datos generales
    // -----------------------------
    const roundText = $('h3').first().text();
    const roundNumber = Number(
      roundText.match(/\d+/)?.[0],
    );

    if (!roundNumber) {
      throw new BadRequestException(
        'No se pudo detectar la ronda',
      );
    }

    const category = $('h3').eq(1).text().trim();
    if (!category) {
      throw new BadRequestException(
        'No se pudo detectar la categoría',
      );
    }

    const generatedAtText = $(
      'table.footer td',
    )
      .last()
      .text()
      .trim();

    const generatedAt = generatedAtText
      ? new Date(generatedAtText)
      : null;

    // -----------------------------
    // 🆚 Emparejamientos
    // -----------------------------
    const pairings: Partial<TournamentPairingEntity>[] =
      [];

    const usedTables = new Set<number>();

    $('table.report tr')
      .slice(1)
      .each((_, row) => {
        const cols = $(row).find('td');
        if (cols.length < 2) return;

        const tableText = $(cols[0])
          .text()
          .trim();

        const playerText = $(cols[1])
          .text()
          .trim();

        const opponentText =
          cols.length >= 4
            ? $(cols[3]).text().trim()
            : '';

        /* ===============================
          🟡 BYE / PASE AUTOMÁTICO
        =============================== */
        if (
          tableText
            .toLowerCase()
            .includes('pase automático')
        ) {
          pairings.push({
            tableNumber: null,
            playerName:
              this.extractName(playerText),
            playerRecord:
              this.extractRecord(playerText),
            opponentName: null,
            opponentRecord: null,
            isBye: true,
          });

          return;
        }

        /* ===============================
          🟢 MATCH NORMAL
        =============================== */
        const tableNumber = Number(tableText);
        if (Number.isNaN(tableNumber)) return;

        if (usedTables.has(tableNumber)) return;
        usedTables.add(tableNumber);

        pairings.push({
          tableNumber,
          playerName:
            this.extractName(playerText),
          playerRecord:
            this.extractRecord(playerText),
          opponentName:
            this.extractName(opponentText),
          opponentRecord:
            this.extractRecord(opponentText),
          isBye: false,
        });
      });

    if (!pairings.length) {
      throw new BadRequestException(
        'No se encontraron emparejamientos',
      );
    }

    // -----------------------------
    // 💾 Guardado con transacción
    // -----------------------------
    return this.dataSource.transaction(
      async manager => {
        const round = manager.create(
          TournamentRoundEntity,
          {
            tournamentId: idTorneo,
            roundNumber,
            category,
            generatedAt,
            pairings,
          },
        );

        await manager.save(round);

        return {
          roundId: round.id,
          roundNumber,
          category,
          pairings: pairings.length,
        };
      },
    );
  }



  async findLatestRound(tournamentId: number) {
    return this.roundRepo.findOne({
      where: {
        tournamentId,
      },
      relations: {
        pairings: true,
      },
      order: {
        roundNumber: 'DESC',
      },
    });
  }


  // -----------------------------
  // 🔧 Helpers
  // -----------------------------
  private extractName(text: string): string {
    if (!text) return '';

    const clean = text.replace(/\u00A0/g, ' ').trim();
    const idx = clean.indexOf('(');

    return idx === -1 ? clean : clean.substring(0, idx).trim();
  }

  private extractRecord(text: string): string | null {
    if (!text) return null;

    const clean = text.replace(/\u00A0/g, ' ').trim();
    const idx = clean.indexOf('(');

    return idx === -1 ? null : clean.substring(idx).trim();
  }
}
