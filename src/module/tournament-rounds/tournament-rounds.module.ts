import { Module } from '@nestjs/common';
import { TournamentRoundsService } from './tournament-rounds.service';
import { TournamentRoundsController } from './tournament-rounds.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentRoundEntity } from 'src/db/entities/tournament-round.entity';
import { TournamentPairingEntity } from 'src/db/entities/tournament-pairing.entity';

@Module({
  controllers: [TournamentRoundsController],
  providers: [TournamentRoundsService],
  imports: [
    TypeOrmModule.forFeature([
      TournamentRoundEntity,
      TournamentPairingEntity,
    ]),
  ],
})
export class TournamentRoundModule {}
