import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const notificationController = new NotificationController();
const router = notificationController.buildRouter();

export default router;
