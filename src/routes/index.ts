import { Router, Request, Response } from 'express';

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

export default router;