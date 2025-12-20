import { AppDataSource } from '../config/database';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { NotificationType } from '../types';
import { FindOptionsWhere } from 'typeorm';

const notificationRepository = AppDataSource.getRepository(Notification);
const userRepository = AppDataSource.getRepository(User);

/**
 * Create a new notification for a user
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<Notification> => {
  // Verify user exists
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const notification = notificationRepository.create({
    userId,
    type,
    title,
    message,
    isRead: false,
  });

  return await notificationRepository.save(notification);
};

/**
 * Get user's notifications, optionally filter unread only
 */
export const getUserNotifications = async (
  userId: string,
  includeRead: boolean = true
): Promise<Notification[]> => {
  const whereClause: FindOptionsWhere<Notification> = { userId };

  // If includeRead is false, only return unread notifications
  if (!includeRead) {
    whereClause.isRead = false;
  }

  return await notificationRepository.find({
    where: whereClause,
    order: { createdAt: 'DESC' },
  });
};

/**
 * Get count of unread notifications for a user
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  return await notificationRepository.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (
  id: string,
  userId: string
): Promise<Notification> => {
  const notification = await notificationRepository.findOne({
    where: { id },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  // Verify ownership
  if (notification.userId !== userId) {
    throw new Error('You do not have permission to update this notification');
  }

  notification.isRead = true;
  return await notificationRepository.save(notification);
};

/**
 * Mark all user's notifications as read
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  await notificationRepository
    .createQueryBuilder()
    .update(Notification)
    .set({ isRead: true })
    .where('userId = :userId', { userId })
    .andWhere('isRead = :isRead', { isRead: false })
    .execute();
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  id: string,
  userId: string
): Promise<void> => {
  const notification = await notificationRepository.findOne({
    where: { id },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  // Verify ownership
  if (notification.userId !== userId) {
    throw new Error('You do not have permission to delete this notification');
  }

  await notificationRepository.remove(notification);
};
