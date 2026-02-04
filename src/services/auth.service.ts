import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { AuthResponse, User } from '../types/library';
import argon from 'argon2';
import { generateJwtToken } from '@/utils/jwt';
import Config from '@/config';

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

  static async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Create new user with client role
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password,
          role: 'client',
          remainingBorrows: Config.env.maxBooksPerUser, // Default max books per user
        },
      });

      // Exclude password from returned user object
      const { password: _pw, ...userWithoutPassword } = newUser;

      // Generate JWT token
      const token: string = generateJwtToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      });

      return { user: userWithoutPassword, token };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create user account', 500);
    }
  }
}
