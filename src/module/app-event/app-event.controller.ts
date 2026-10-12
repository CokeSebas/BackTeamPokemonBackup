import { Body, Controller, Post } from '@nestjs/common';
import { AppEventService } from './app-event.service';

@Controller('app-events')
export class AppEventController {
  constructor(
    private readonly appEventService: AppEventService,
  ) {}

  @Post()
  async createEvent(@Body() body: {
    userId?: number | null;
    eventType: string;
    teamName?: string | null;
    actionType?: string | null;
    language?: string | null;
    userAgent?: string | null;
  }) {
    console.log('(C) Creating app event:');
    return await this.appEventService.createEvent({
      userId: body.userId ?? null,
      eventType: body.eventType,
      teamName: body.teamName ?? null,
      actionType: body.actionType ?? null,
      language: body.language ?? null,
      userAgent: body.userAgent ?? null,
    });
  }
}