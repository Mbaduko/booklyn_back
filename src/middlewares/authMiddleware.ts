import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Config from '../config';
import { AuthenticatedRequest, JwtPayload } from '../types/library';
import AppError from '@/utils/AppError';


export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.get('authorization');
  if (!authHeader) {
    throw new AppError("Invalid request", 400);
  }
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    throw new AppError("Invalid request", 400);
  }
  try {
    const payload = jwt.verify(token, Config.env.jwtSecret) as JwtPayload;
    if (!payload.isActive) {
    throw new AppError("User is not active", 401);
    }
    req.user = payload;
    return next();
  } catch (err) {
    throw new AppError("Unauthorized", 401);
  }
}
