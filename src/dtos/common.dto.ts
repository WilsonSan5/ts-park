import { IsOptional, IsInt, Min, Max, IsIn, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Base Pagination DTO
 *
 * Standard pagination parameters used across the application.
 * Provides consistent pagination with sensible defaults and limits.
 *
 * @example
 * // GET /api/users?page=2&limit=20&sortBy=createdAt&sortOrder=DESC
 */
export class PaginationDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'SortBy must be a string' })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], {
    message: 'SortOrder must be either ASC or DESC',
  })
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

/**
 * UUID Parameter DTO
 *
 * Used for validating UUID route parameters.
 *
 * @example
 * // GET /api/users/:id
 * class UserIdDTO extends UUIDParamDTO {}
 */
export class UUIDParamDTO {
  @IsString()
  id: string;
}

/**
 * Search Query DTO
 *
 * Common search parameter with optional pagination.
 *
 * @example
 * // GET /api/exercises/search?q=cardio&page=1&limit=20
 */
export class SearchDTO extends PaginationDTO {
  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  @Transform(({ value }) => value?.trim())
  q?: string;
}

/**
 * Date Range DTO
 *
 * Used for filtering by date ranges.
 *
 * @example
 * // GET /api/workouts?startDate=2024-01-01&endDate=2024-12-31
 */
export class DateRangeDTO {
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}

/**
 * Boolean Query DTO
 *
 * Handles boolean query parameters (which come as strings from HTTP).
 *
 * @example
 * // GET /api/challenges?isPublic=true
 */
export class BooleanQueryDTO {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  isPublic?: boolean;
}

/**
 * Response Wrapper for Paginated Results
 *
 * Standardized response structure for paginated data.
 * Not a request DTO, but included here for consistency.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Helper function to create paginated response
 *
 * @param data - Array of data items
 * @param total - Total count of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Formatted paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
