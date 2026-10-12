import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppEvent } from '../../db/entities/app-events.entity';
import { AppEventService } from './app-event.service';
import { AppEventController } from './app-event.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppEvent]),
  ],
  controllers: [AppEventController],
  providers: [AppEventService],
  exports: [AppEventService],
})
export class AppEventModule {}