import crypto from 'crypto';

/**
 * Generates a cryptographically secure random token.
 * @param length Length of the token in bytes (default 32 = 64 hex chars)
 * @returns Hex string token
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Calculates expiration date from current time.
 * @param hours Number of hours until expiration
 * @returns Date object representing expiration time
 */
export const getExpirationDate = (hours: number): Date => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

/**
 * Checks if a token has expired.
 * @param expiresAt Expiration date to check
 * @returns true if expired or null/undefined, false otherwise
 */
export const isTokenExpired = (expiresAt: Date | null | undefined): boolean => {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
};
