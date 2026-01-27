import { Router } from 'express';
import { BookController } from '../controllers/book.controller';

const bookRouter = Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: No books found
 *       500:
 *         description: Server error
 */
bookRouter.get('/', BookController.getAllBooks);

export default bookRouter;