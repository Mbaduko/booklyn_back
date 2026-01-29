import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { Notification, NotificationContent } from '../types/library';



export class NotificationService {
  /**
   * Get all notifications for a specific user
   */
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

  /**
   * Send notification to a specific user
   */
  static async sendNotificationToUser(
    userId: string,
    content: NotificationContent
  ): Promise<Notification> {
    try {
      const notification: Notification = await prisma.notification.create({
        data: {
          userId,
          title: content.title,
          message: content.message,
          type: content.type,
          read: false,
        },
        select: {
          id: true,
          userId: true,
          title: true,
          message: true,
          type: true,
          read: true,
          createdAt: true,
        },
      }) as Notification;

      return notification;
    } catch (error) {
      throw new AppError('Failed to send notification to user', 500);
    }
  }

  /**
   * Send notification to all users with a specific role
   */
  static async sendNotificationToRole(
    role: string,
    content: NotificationContent
  ): Promise<Notification[]> {
    try {
      // First, get all users with the specified role
      const users = await prisma.user.findMany({
        where: { 
          role: role as any, // Type assertion for role enum
          isActive: true // Only send to active users
        },
        select: {
          id: true,
        },
      });

      if (!users || users.length === 0) {
        throw new AppError(`No active users found with role: ${role}`, 404);
      }

      // Create notifications for all users with that role
      const notifications: Notification[] = await prisma.$transaction(
        users.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              title: content.title,
              message: content.message,
              type: content.type,
              read: false,
            },
            select: {
              id: true,
              userId: true,
              title: true,
              message: true,
              type: true,
              read: true,
              createdAt: true,
            },
          })
        )
      ) as Notification[];

      return notifications;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to send notifications to role: ${role}`, 500);
    }
  }

  /**
   * Send notification to a specific user or all users with a specific role
   * This is a unified method that can handle both scenarios
   */
  static async sendNotification(
    target: {
      userId?: string;
      role?: string;
    },
    content: NotificationContent
  ): Promise<Notification | Notification[]> {
    if (!target.userId && !target.role) {
      throw new AppError('Either userId or role must be provided', 400);
    }

    if (target.userId && target.role) {
      throw new AppError('Cannot specify both userId and role', 400);
    }

    if (target.userId) {
      return await this.sendNotificationToUser(target.userId, content);
    }

    if (target.role) {
      return await this.sendNotificationToRole(target.role, content);
    }

    throw new AppError('Invalid notification target', 400);
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<Notification> {
    try {
      const notification: Notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
        select: {
          id: true,
          userId: true,
          title: true,
          message: true,
          type: true,
          read: true,
          createdAt: true,
        },
      }) as Notification;

      return notification;
    } catch (error) {
      throw new AppError('Failed to mark notification as read', 500);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllNotificationsAsRead(userId: string): Promise<{ count: number }> {
    try {
      const result = await prisma.notification.updateMany({
        where: { 
          userId,
          read: false 
        },
        data: { read: true },
      });

      return { count: result.count };
    } catch (error) {
      throw new AppError('Failed to mark all notifications as read', 500);
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await prisma.notification.delete({
        where: { id: notificationId },
      });
    } catch (error) {
      throw new AppError('Failed to delete notification', 500);
    }
  }
}
