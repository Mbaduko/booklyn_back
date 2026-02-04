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

  static async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return next(new AppError('Name, email, and password are required', 400));
      }

      if (name.trim().length < 2) {
        return next(new AppError('Name must be at least 2 characters long', 400));
      }

      const user: AuthResponse = await AuthService.signup(name.trim(), email, password);
      return res.status(201).json({
        message: 'User account created successfully',
        user: user.user,
        token: user.token
      });
    } catch (error) {
      return next(error);
    }
  }
}
