import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest, User } from '../types/library';

export class UserController {
  static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const users: Partial<User>[] = await UserService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return next(error);
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user: Partial<User> = await UserService.getUserById(req.params.id as string);
      return res.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  }
}
