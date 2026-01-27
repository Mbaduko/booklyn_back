import prisma from '../lib/prisma';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'librarian' | 'client';
  avatar: string | null;
  createdAt: Date;
  isActive: boolean;
}

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
}
