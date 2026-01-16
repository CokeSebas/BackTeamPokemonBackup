import { Module } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournaments } from '../../db/entities/tournaments.entity';
import { MyLoggerService } from '../common/logger/myLogger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tournaments
    ])
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService, MyLoggerService],
})
export class TournamentsModule {}
