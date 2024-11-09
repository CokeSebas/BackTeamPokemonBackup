import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { SubFormat } from '../../db/entities/subFormat.entity';

@Injectable()
export class SubFormatsService {

  constructor(
      @InjectRepository(SubFormat)
      private readonly subFormatRepository: Repository<SubFormat>,
      private readonly logger: MyLoggerService
  ) { }


  async findAll() {
    this.logger.log('(S) Fetching all subformats: ', SubFormatsService.name);
    return this.subFormatRepository.find({order: {id: 'desc'}});
  }

  async findOne(id: number) {
    this.logger.log('(S) Fetching subformat by id: '+id, SubFormatsService.name);
    return this.subFormatRepository.findOne({ where: { id } });
  }

}
