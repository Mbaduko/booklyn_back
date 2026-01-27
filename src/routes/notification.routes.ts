import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken } from '@/middlewares/authMiddleware';
import { requireRole } from '@/middlewares/roleMiddleware';

const notificationRouter = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for a user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       404:
 *         description: No notifications found
 *       400:
 *         description: userId is required
 *       500:
 *         description: Server error
 */
notificationRouter.get('/', authenticateToken, requireRole('librarian', true), NotificationController.getNotifications);

export default notificationRouter;
