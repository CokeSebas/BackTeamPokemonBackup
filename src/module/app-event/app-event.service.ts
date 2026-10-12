import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppEvent } from '../../db/entities/app-events.entity';

interface CreateAppEventDto {
  userId?: number | null;
  eventType: string;
  teamName?: string | null;
  actionType?: string | null;
  language?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AppEventService {
  constructor(
    @InjectRepository(AppEvent)
    private readonly appEventRepository: Repository<AppEvent>,
  ) {}

  async createEvent(data: CreateAppEventDto): Promise<AppEvent> {
    const event = this.appEventRepository.create({
      userId: data.userId ?? null,
      eventType: data.eventType,
      teamName: data.teamName ?? null,
      actionType: data.actionType ?? null,
      language: data.language ?? null,
      userAgent: data.userAgent ?? null,
    });

    return await this.appEventRepository.save(event);
  }
}