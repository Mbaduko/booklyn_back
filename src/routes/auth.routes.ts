import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { zodValidate } from '@/middlewares/zodValidate';
import { credentialsSchema } from '@/validations/auth.schema';

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

export default authRouter;
