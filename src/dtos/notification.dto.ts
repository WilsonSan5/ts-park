import { IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for querying notifications
 *
 * @route GET /api/notifications
 */
export class NotificationQueryDTO {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'unreadOnly must be a boolean' })
  unreadOnly?: boolean;
}

/**
 * DTO for notification ID parameter
 * Used for mark as read and delete operations
 *
 * @route PATCH /api/notifications/:id/read
 * @route DELETE /api/notifications/:id
 */
export class NotificationIdParamDTO {
  @IsUUID('4', { message: 'Notification ID must be a valid UUID' })
  id: string;
}
