import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, JwtPayload } from '../types/library';
import AppError from '@/utils/AppError';

export function requireRole(role: JwtPayload['role']) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        throw new AppError("Unauthorized", 401);
    }
    if (req.user.role !== role) {
      throw new AppError("Unauthorized", 403);
    }
    return next();
  };
}
