import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { isTokenBlacklisted } from '../services/auth.service';
import { JWTPayload } from '../types';

/**
 * Middleware to authenticate JWT tokens.
 *
 * Flow:
 * 1. Extract token from Authorization header (Bearer <token>)
 * 2. Verify token signature and expiration
 * 3. Check if token has been blacklisted (user logged out)
 * 4. Add user info to req.user
 * 5. Call next() to continue to controller
 *
 * If token is invalid/missing/blacklisted, returns 401/403 error.
 * SECURITY: Token must be in format "Bearer <token>"
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)  // Remove "Bearer " prefix
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    // Verify token and extract payload
    // SECURITY: Verifies signature and expiration
    const decoded = verifyToken(token) as JWTPayload;

    // SECURITY: Check if token has been blacklisted (user logged out)
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked. Please log in again.',
      });
    }

    // Attach user info to request for controllers to use
    req.user = decoded;

    // Continue to next middleware/controller
    next();

  } catch (error: unknown) {
    // Token is invalid or expired
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
