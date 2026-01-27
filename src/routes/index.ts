import { Router, Request, Response } from 'express';
import userRouter from './user.routes';
import bookRouter from './book.routes';

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

export default router;