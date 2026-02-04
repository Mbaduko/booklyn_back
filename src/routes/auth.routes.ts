import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { zodValidate } from '@/middlewares/zodValidate';
import { credentialsSchema, signupSchema } from '@/validations/auth.schema';

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

export default authRouter;
