import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthenticatedRequest, Notification } from '../types/library';
import AppError from '../utils/AppError';

export class NotificationController {
  static async getNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise< Response | void> {
    try {
      const userId: string | undefined = req.query.userId as string;
      if (!userId) {
        throw new AppError('userId query parameter is required', 400);
      }
      const notifications: Notification[] = await NotificationService.getNotificationsByUserId(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      return next(error);
    }
  }

  static async markNotificationAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { notificationId } = req.params;
      const userId = req.user!.id;

      if (!notificationId || typeof notificationId !== 'string') {
        throw new AppError('Valid notification ID is required', 400);
      }

      const notification: Notification = await NotificationService.markNotificationAsReadWithOwnership(
        notificationId,
        userId
      );

      return res.status(200).json({
        message: 'Notification marked as read successfully',
        notification
      });
    } catch (error) {
      return next(error);
    }
  }

  static async markAllNotificationsAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userId = req.user!.id;

      const result = await NotificationService.markAllNotificationsAsRead(userId);

      return res.status(200).json({
        message: 'All notifications marked as read successfully',
        count: result.count
      });
    } catch (error) {
      return next(error);
    }
  }
}
