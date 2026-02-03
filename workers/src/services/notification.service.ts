import prisma from '../lib/prisma';

export interface NotificationContent {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
}

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
      console.log(`No notifications found for user: ${userId}`);
      return [];
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

      console.log(`✅ Notification sent to user ${userId}: ${content.title}`);
      return notification;
    } catch (error) {
      console.error(`❌ Failed to send notification to user ${userId}:`, error);
      throw new Error(`Failed to send notification to user: ${userId}`);
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
        console.log(`No active users found with role: ${role}`);
        return [];
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

      console.log(`✅ Notifications sent to ${notifications.length} users with role: ${role}`);
      return notifications;
    } catch (error) {
      console.error(`❌ Failed to send notifications to role ${role}:`, error);
      throw new Error(`Failed to send notifications to role: ${role}`);
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
      throw new Error('Either userId or role must be provided');
    }

    if (target.userId && target.role) {
      throw new Error('Cannot specify both userId and role');
    }

    if (target.userId) {
      return await this.sendNotificationToUser(target.userId, content);
    }

    if (target.role) {
      return await this.sendNotificationToRole(target.role, content);
    }

    throw new Error('Invalid notification target');
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

      console.log(`✅ Notification ${notificationId} marked as read`);
      return notification;
    } catch (error) {
      console.error(`❌ Failed to mark notification ${notificationId} as read:`, error);
      throw new Error(`Failed to mark notification as read: ${notificationId}`);
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

      console.log(`✅ Marked ${result.count} notifications as read for user: ${userId}`);
      return { count: result.count };
    } catch (error) {
      console.error(`❌ Failed to mark all notifications as read for user ${userId}:`, error);
      throw new Error(`Failed to mark all notifications as read for user: ${userId}`);
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
      console.log(`✅ Notification ${notificationId} deleted`);
    } catch (error) {
      console.error(`❌ Failed to delete notification ${notificationId}:`, error);
      throw new Error(`Failed to delete notification: ${notificationId}`);
    }
  }
}
