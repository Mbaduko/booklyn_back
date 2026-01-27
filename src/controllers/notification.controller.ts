import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../types/library';
import AppError from '../utils/AppError';

export class NotificationController {
  static async getNotifications(
    req: Request,
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
}
