import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { zodValidate } from '@/middlewares/zodValidate';
import { credentialsSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from '@/validations/auth.schema';

const authRouter = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: client@library.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Auth response with user and token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 *       400:
 *         description: Email and password are required
 *       500:
 *         description: Server error
 */
authRouter.post('/login', zodValidate(credentialsSchema, req => req.body), AuthController.login);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create a new client account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: John Doe
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: User's email address (must be unique)
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *                 example: Password123
 *                 description: Password (must contain at least one uppercase letter, one lowercase letter, and one number)
 *     responses:
 *       201:
 *         description: User account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User account created successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Name must be at least 2 characters long
 *       409:
 *         description: User with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User with this email already exists
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to create user account
 */
authRouter.post('/signup', zodValidate(signupSchema, req => req.body), AuthController.signup);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset link sent (always returns success for security)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If an account with that email exists, a password reset link has been sent
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email is required
 *       500:
 *         description: Server error
 */
authRouter.post('/forgot-password', zodValidate(forgotPasswordSchema, req => req.body), AuthController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123def456...
 *                 description: Password reset token from email
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *                 example: NewPassword123
 *                 description: New password (must contain uppercase, lowercase, and number)
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password has been reset successfully
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or expired reset token
 *       500:
 *         description: Server error
 */
authRouter.post('/reset-password', zodValidate(resetPasswordSchema, req => req.body), AuthController.resetPassword);

export default authRouter;
