import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../chat/entities/notification.entity';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepo.create(data);
    return this.notificationRepo.save(notification);
  }

  async listNotifications(userId: string, query: NotificationQueryDto): Promise<{ data: Notification[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { userId };
    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }
    const [data, total] = await this.notificationRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({ where: { userId, isRead: false } });
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({ where: { id: notificationId, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
  }
}
