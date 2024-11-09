import { Controller, Get } from '@nestjs/common';
import { MyLoggerService } from '../common/logger/myLogger.service';
import { SubFormatsService } from './subFormats.service';

@Controller('subformats')
export class SubFormatsController {
  constructor(
      private readonly subFormatsService: SubFormatsService,
      private readonly logger: MyLoggerService
  ){}

  @Get()
  findAll() {
    this.logger.log('(C) Getting all formats: ', SubFormatsController.name);
    return this.subFormatsService.findAll();
  }
}
