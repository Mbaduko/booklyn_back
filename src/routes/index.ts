import { Router, Request, Response } from 'express';
import userRouter from './user.routes';
import bookRouter from './book.routes';
import borrowRouter from './borrow.routes';
import notificationRouter from './notification.routes';
import authRouter from './auth.routes';

const router: Router = Router();

/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *       - General
 *     summary: Welcome to Booklyn API
 *     description: Returns a welcome message.
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Welcome to Booklyn API!
 */
router.get('/', (req: Request, res: Response): Response => {
    return res.send('Welcome to Booklyn API!');
});

router.use('/users', userRouter);
router.use('/books', bookRouter);
router.use('/borrows', borrowRouter);
router.use('/notifications', notificationRouter);
router.use('/auth', authRouter);

export default router;