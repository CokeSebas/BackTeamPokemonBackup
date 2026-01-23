import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentStanding } from '../../db/entities/tournament-standing.entity';
import { TournamentStandingService } from './tournament-standing.service';
import { TournamentStandingController } from './tournament-standing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TournamentStanding]),
  ],
  controllers: [TournamentStandingController],
  providers: [TournamentStandingService],
  exports: [TournamentStandingService],
})
export class TournamentStandingModule {}
