import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../db/entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async createNotification(
    notification: Partial<Notification>,
  ): Promise<Notification> {
    const entity = this.notificationRepository.create(notification);
    return await this.notificationRepository.save(entity);
  }
}