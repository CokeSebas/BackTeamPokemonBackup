import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from '../../db/entities/notification.entity';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Get()
  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationService.getAllNotifications();
  }

  @Post()
  async createNotification(
    @Body() notification: Partial<Notification>,
  ): Promise<Notification> {
    return this.notificationService.createNotification(notification);
  }
}