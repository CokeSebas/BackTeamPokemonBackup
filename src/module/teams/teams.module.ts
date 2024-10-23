import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TeamsResolver } from './teams.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teams } from 'src/db/entities/team.entity';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { HttpModule } from '@nestjs/axios';
import { ImageValidatorService } from '../common/img-validator/img-validator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teams]),
    HttpModule
  ],
  controllers: [TeamsController],
  providers: [TeamsService, TeamsResolver, MyLoggerService, ImageValidatorService],
  exports: [TeamsResolver]

})
export class TeamsModule {}
