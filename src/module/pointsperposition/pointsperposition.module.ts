import { Module } from '@nestjs/common';
import { PointsperpositionService } from './pointsperposition.service';
import { PointsperpositionController } from './pointsperposition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsPerPosition } from '../../db/entities/pointsperposition.entity';
import { MyLoggerService } from '../common/logger/myLogger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointsPerPosition
    ]),
  ],
  controllers: [PointsperpositionController],
  providers: [PointsperpositionService, MyLoggerService],
})
export class PointsperpositionModule {}
