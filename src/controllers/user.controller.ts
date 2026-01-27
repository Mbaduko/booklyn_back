import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { User } from '../types/library';

export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const users: User[] = await UserService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user: User = await UserService.getUserById(req.params.id as string);
      return res.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  }
}
