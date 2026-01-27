import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const userRouter = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: No users found
 *       500:
 *         description: Server error
 */
userRouter.get('/', UserController.getAllUsers);

export default userRouter;