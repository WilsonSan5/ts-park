import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JWTPayload, UserRole } from '../types';

export const generateToken = (userId: string, email: string, role: UserRole): string => {
  return jwt.sign({ userId, email, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
};
