import { Controller, Get } from '@nestjs/common';
import { FormatsService } from './formats.service';
import { MyLoggerService } from '../common/logger/myLogger.service';

@Controller('formats')
export class FormatsController {
  constructor(
      private readonly formatsService: FormatsService,
      private readonly logger: MyLoggerService
  ){}

  @Get()
  findAll() {
    this.logger.log('(C) Getting all formats: ', FormatsController.name);
    return this.formatsService.findAll();
  }
}
