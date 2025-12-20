/**
 * DTO Barrel Export
 * Central export point for all Data Transfer Objects
 */

// Common DTOs
export {
  PaginationDTO,
  UUIDParamDTO,
  SearchDTO,
  DateRangeDTO,
  BooleanQueryDTO,
  PaginatedResponse,
  createPaginatedResponse,
} from './common.dto';

// Authentication DTOs
export {
  RegisterDTO,
  LoginDTO,
  VerifyEmailDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
  AdminCreateUserDTO,
  RefreshTokenDTO,
} from './auth.dto';

// Workout DTOs
export {
  WorkoutExerciseDTO,
  CreateWorkoutDTO,
  UpdateWorkoutDTO,
  WorkoutQueryDTO,
} from './workout.dto';

// Challenge DTOs
export {
  ChallengeObjectivesDTO,
  CreateChallengeDTO,
  UpdateChallengeDTO,
  ChallengeQueryDTO,
} from './challenge.dto';

// Gym DTOs
export {
  CreateGymDTO,
  UpdateGymDTO,
  GymQueryDTO,
  GymApprovalDTO,
} from './gym.dto';

// Exercise DTOs
export {
  CreateExerciseDTO,
  UpdateExerciseDTO,
  ExerciseQueryDTO,
} from './exercise.dto';

// Badge DTOs
export {
  CreateBadgeDTO,
  UpdateBadgeDTO,
  CreateBadgeRuleDTO,
  AssignBadgeDTO,
  BadgeRuleType,
  BadgeRuleOperator,
} from './badge.dto';

// Social DTOs
export {
  FriendRequestDTO,
  FriendActionDTO,
  FriendshipStatusDTO,
} from './social.dto';

// User DTOs
export {
  UpdateUserDTO,
  AdminUpdateRoleDTO,
  UserQueryDTO,
} from './user.dto';

// Notification DTOs
export {
  NotificationQueryDTO,
  NotificationIdParamDTO,
} from './notification.dto';
