
import AppError from '@/utils/AppError';
import prisma from '../lib/prisma';
import { User } from '../types/library';

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    const users: User[] = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        isActive: true,
      },
    });
    return users;
  }

  static async getUserById(id: string): Promise<User> {
    const user: User | null = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        isActive: true,
      },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
