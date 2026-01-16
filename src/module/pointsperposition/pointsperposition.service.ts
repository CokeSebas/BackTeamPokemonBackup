import { Injectable } from '@nestjs/common';
import { PointsPerPosition } from 'src/db/entities/pointsperposition.entity';
import { Repository } from 'typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PointsperpositionService {

  constructor(
    @InjectRepository(PointsPerPosition)
    private readonly pointsperpositionRepository: Repository<PointsPerPosition>,
    private readonly logger: MyLoggerService
  ) {}


  async findAll(){
    this.logger.log("(S) Find all points per position", PointsperpositionService.name);
    return this.pointsperpositionRepository.find();
  }

  async findByTournament(tournamentId: number){
    this.logger.log("(S) Find points per position by tournament: "+tournamentId, PointsperpositionService.name);
    return this.pointsperpositionRepository.find({ where: { torneoId: tournamentId } });
  }
}


