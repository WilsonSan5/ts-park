import { Request, Response, Router } from 'express';
import * as notificationService from '../services/notification.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateUUIDParam } from '../middleware/validate.middleware';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications
 *     description: Retrieve all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Only return unread notifications
 *         example: true
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 5
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     description: Get the count of unread notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read
 *     description: Mark all notifications for the authenticated user as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     description: Delete a specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 */

export class NotificationController {
  buildRouter(): Router {
    const router = Router();
    router.use(authenticateToken);

    router.get('/', asyncHandler(this.getNotifications.bind(this)));
    router.get('/unread-count', asyncHandler(this.getUnreadCount.bind(this)));
    router.patch('/:id/read', validateUUIDParam('id'), asyncHandler(this.markAsRead.bind(this)));
    router.post('/mark-all-read', asyncHandler(this.markAllAsRead.bind(this)));
    router.delete('/:id', validateUUIDParam('id'), asyncHandler(this.deleteNotification.bind(this)));

    return router;
  }

  async getNotifications(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = await notificationService.getUserNotifications(
      userId,
      !unreadOnly
    );

    return sendSuccess(res, 'Notifications retrieved successfully', {
      count: notifications.length,
      notifications
    });
  }

  async getUnreadCount(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    const count = await notificationService.getUnreadCount(userId);

    return sendSuccess(res, 'Unread count retrieved successfully', { count });
  }

  async markAsRead(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notification = await notificationService.markAsRead(id, userId);
    return sendSuccess(res, 'Notification marked as read', notification);
  }

  async markAllAsRead(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    await notificationService.markAllAsRead(userId);

    return sendSuccess(res, 'All notifications marked as read', null);
  }

  async deleteNotification(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const userId = req.user!.userId;

    await notificationService.deleteNotification(id, userId);
    return sendSuccess(res, 'Notification deleted successfully', null);
  }
}
