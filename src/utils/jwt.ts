import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JWTPayload, UserRole } from '../types';

export const generateToken = (userId: string, email: string, role: UserRole): string => {
  return jwt.sign(
    { userId, email, role },
    config.jwt.secret,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
};

/**
 * Decodes a JWT token without verifying it.
 * Useful for extracting expiration time from a token.
 * @param token The JWT token to decode
 * @returns The decoded payload with exp field, or null if invalid
 */
export const decodeToken = (token: string): (JWTPayload & { exp: number; iat: number }) | null => {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string') {
    return null;
  }
  return decoded as JWTPayload & { exp: number; iat: number };
};
