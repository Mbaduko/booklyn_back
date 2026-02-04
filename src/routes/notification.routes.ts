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

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: string
 *         required: true
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       403:
 *         description: Access denied - can only mark own notifications
 *       404:
 *         description: Notification not found
 *       400:
 *         description: Invalid notification ID
 *       500:
 *         description: Server error
 */
notificationRouter.patch('/:notificationId/read', authenticateToken, NotificationController.markNotificationAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                   description: Number of notifications marked as read
 *       500:
 *         description: Server error
 */
notificationRouter.patch('/read-all', authenticateToken, NotificationController.markAllNotificationsAsRead);

export default notificationRouter;
