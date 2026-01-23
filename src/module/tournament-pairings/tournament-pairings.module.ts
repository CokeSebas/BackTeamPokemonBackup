import { Module } from '@nestjs/common';
import { TournamentPairingsService } from './tournament-pairings.service';
import { TournamentPairingsController } from './tournament-pairings.controller';

@Module({
  controllers: [TournamentPairingsController],
  providers: [TournamentPairingsService],
})
export class TournamentPairingsModule {}
