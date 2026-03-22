import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { AuthResponse, User } from '../types/library';
import argon from 'argon2';
import { generateJwtToken } from '@/utils/jwt';
import Config from '@/config';
import { EmailService } from './email.service';
import crypto from 'crypto';

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

  static async forgotPassword(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: hashedToken,
          expiresAt,
        },
      });

      const resetUrl = `${process.env.FRONT_URL}/reset-password?token=${resetToken}`;

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your Booklyn Library account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            This link will expire in 15 minutes for security reasons.
          </p>
          <p style="font-size: 14px; color: #666;">
            If you didn't request this password reset, you can safely ignore this email.
          </p>
          <p style="font-size: 12px; color: #999;">
            Security Notice: Never share this link with anyone. Our staff will never ask for your password.
          </p>
        </div>
      `;

      await EmailService.sendHtmlEmail(
        user.email,
        'Reset Your Booklyn Library Password',
        emailContent
      );
    } catch (error) {
      throw new AppError('Failed to process password reset request', 500);
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const resetTokenRecord = await prisma.passwordResetToken.findFirst({
        where: {
          token: hashedToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!resetTokenRecord) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      const hashedPassword = await argon.hash(newPassword);

      await prisma.user.update({
        where: { id: resetTokenRecord.user.id },
        data: { password: hashedPassword },
      });

      await prisma.passwordResetToken.delete({
        where: { id: resetTokenRecord.id },
      });

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Successfully Reset</h2>
          <p>Hello ${resetTokenRecord.user.name},</p>
          <p>Your password for the Booklyn Library account has been successfully reset.</p>
          <p>If you didn't make this change, please contact our support team immediately.</p>
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONT_URL}/login" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Login to Your Account</a>
          </p>
          <p style="font-size: 12px; color: #999;">
            Security Notice: If you suspect unauthorized access, please change your password immediately.
          </p>
        </div>
      `;

      await EmailService.sendHtmlEmail(
        resetTokenRecord.user.email,
        'Your Password Has Been Reset',
        emailContent
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to reset password', 500);
    }
  }
}
