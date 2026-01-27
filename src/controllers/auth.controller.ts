import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthResponse, User } from '../types/library';
import AppError from '@/utils/AppError';

export class AuthController {
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new AppError('Email and password are required', 400));
      }
      const user: AuthResponse = await AuthService.login(email, password);
      return res.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  }
}
