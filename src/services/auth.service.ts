import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { AuthResponse, User } from '../types/library';
import argon from 'argon2';
import { generateJwtToken } from '@/utils/jwt';

export class AuthService {
static async login(email: string, password: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    const valid = await argon.verify(user.password, password);
    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }
    // Exclude password from returned user object
    const { password: _pw, ...userWithoutPassword } = user;

    const token: string =generateJwtToken({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    return { user: userWithoutPassword, token };
  }
}
