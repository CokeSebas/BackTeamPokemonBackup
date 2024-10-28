import { Module } from '@nestjs/common';
import { FormatsController } from './formats.controller';
import { FormatsService } from './formats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { Format } from '../../db/entities/format.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Format
    ])
  ],
  controllers: [FormatsController],
  providers: [FormatsService, MyLoggerService]
})
export class FormatsModule {}
