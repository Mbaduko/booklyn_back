import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, JwtPayload } from '../types/library';
import AppError from '@/utils/AppError';

/**
 * Middleware to require a specific role, with optional owner access.
 * @param role - Required user role
 * @param allowOwner - If true, allows access if user.id matches req.params.id
 */
export function requireRole(role: JwtPayload['role'], allowOwner = false) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    if (req.user.role === role) {
      return next();
    }
    if (allowOwner && req.user.id && req.params && req.params.id && req.user.id === req.params.id) {
      return next();
    }
    throw new AppError('Unauthorized', 403);
  };
}
