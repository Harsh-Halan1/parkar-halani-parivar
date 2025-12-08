export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
  details?: Record<string, any>;
}

export enum HttpStatusCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Your account has been locked',
  EMAIL_NOT_VERIFIED: 'Please verify your email first',
  INVALID_OTP: 'Invalid or expired OTP',
  OTP_ATTEMPTS_EXCEEDED: 'Too many OTP attempts. Please try again later',

  // Permission errors
  UNAUTHORIZED_ACCESS: 'You do not have permission to access this resource',
  ADMIN_ONLY: 'This operation is only available to administrators',
  FAMILY_ONLY: 'You can only access your own family data',

  // Resource errors
  USER_NOT_FOUND: 'User not found',
  FAMILY_NOT_FOUND: 'Family not found',
  PERSON_NOT_FOUND: 'Person not found',
  RELATIONSHIP_NOT_FOUND: 'Relationship not found',
  RESOURCE_NOT_FOUND: 'Resource not found',

  // Validation errors
  INVALID_INPUT: 'Invalid input provided',
  DUPLICATE_RESOURCE: 'A resource with this information already exists',
  INVALID_ENUM: 'Invalid value for this field',

  // Business logic errors
  CANNOT_DELETE_ADMIN: 'Cannot delete the last administrator',
  INVALID_RELATIONSHIP: 'Invalid relationship configuration',
  PERSON_ALREADY_IN_FAMILY: 'This person is already part of a family',

  // Server errors
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again later',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later',
  DATABASE_ERROR: 'Database operation failed',
};
