import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

import { Match } from '../../db/entities/match.entity';
import { MatchPokemon } from '../../db/entities/match-pokemon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, MatchPokemon]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService], // opcional, por si lo usas en otros módulos
})
export class MatchesModule {}