import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Format } from 'src/db/entities/format.entity';

@Injectable()
export class FormatsService {

  constructor(
      @InjectRepository(Format)
      private readonly formatRepository: Repository<Format>,
      private readonly logger: MyLoggerService
  ) { }


  findAll() {
    this.logger.log('(S) Fetching all formats: ', FormatsService.name);
    return this.formatRepository.find();
  }

}
