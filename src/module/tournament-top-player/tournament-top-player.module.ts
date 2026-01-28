import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TournamentTopPlayer } from '../../db/entities/tournament-top-player.entity';
import { TournamentTopPlayerPokemon } from '../../db/entities/tournament-top-player-pokemon.entity';

import { TournamentTopPlayerService } from './tournament-top-player.service';
import { TournamentTopPlayerController } from './tournament-top-player.controller';

import { Tournaments } from '../../db/entities/tournaments.entity';
import { Pokemon } from '../../db/entities/list-pokemons.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TournamentTopPlayer,
      TournamentTopPlayerPokemon,
      Tournaments,
      Pokemon,
    ]),
  ],
  controllers: [TournamentTopPlayerController],
  providers: [TournamentTopPlayerService],
  exports: [TournamentTopPlayerService],
})
export class TournamentTopPlayerModule {}
