import { Module } from '@nestjs/common';
import { TournamentRoundResultService } from './tournament-round-result.service';
import { TournamentRoundResultController } from './tournament-round-result.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentRoundResultEntity } from 'src/db/entities/tournament-result.entity';
import { TournamentRoundEntity } from 'src/db/entities/tournament-round.entity';

@Module({
  controllers: [TournamentRoundResultController],
  providers: [TournamentRoundResultService],
  imports: [
    TypeOrmModule.forFeature([
      TournamentRoundResultEntity,
      TournamentRoundEntity
    ]),
  ],
})
export class TournamentResultsModule {}
