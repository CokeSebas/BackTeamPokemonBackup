import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { TournamentTopPlayerService } from './tournament-top-player.service';
import { CreateTournamentTopPlayerDto } from './dto/create-tournament-top-player.dto';
import { TournamentTopPlayer } from '../../db/entities/tournament-top-player.entity';
import { CreateTournamentTopDto } from './dto/create-tournament-top.dto';

@Controller('tournament-top-players')
export class TournamentTopPlayerController {
  constructor(
    private readonly topPlayerService: TournamentTopPlayerService,
  ) {}


  @Post('bulk')
  createTop(
    @Body() dto: CreateTournamentTopDto,
  ) {
    return this.topPlayerService.createTop(dto);
  }


  // ===============================
  // Registrar jugador Top
  // ===============================
  @Post()
  async create(
    @Body() dto: CreateTournamentTopPlayerDto,
  ): Promise<TournamentTopPlayer> {
    return this.topPlayerService.create(dto);
  }

  // ===============================
  // Obtener Top por torneo
  // ===============================
  @Get('tops/:tournamentId')
  async findByTournament(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ): Promise<TournamentTopPlayer[]> {
    return this.topPlayerService.findByTournament(tournamentId);
  }
}
