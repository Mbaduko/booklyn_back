import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { Notification } from '../types/library';

export class NotificationService {
  static async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    const notifications: Notification[] = await prisma.notification.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        title: true,
        message: true,
        type: true,
        read: true,
        createdAt: true,
      },
    }) as Notification[];
    if (!notifications || notifications.length === 0) {
      throw new AppError('No notifications found for this user', 404);
    }
    return notifications;
  }
}
