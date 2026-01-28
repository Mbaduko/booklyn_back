import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { authenticateToken } from '@/middlewares/authMiddleware';
import { uploadImage } from '@/middlewares/multer';
import { uploadToCloudinary } from '@/middlewares/cloudinaryUpload';
import { requireRole } from '@/middlewares/roleMiddleware';

const bookRouter = Router();

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - category
 *               - isbn
 *               - totalCopies
 *             properties:
 *               title:
 *                 type: string
 *                 description: Book title
 *               author:
 *                 type: string
 *                 description: Author name
 *               category:
 *                 type: string
 *                 description: Book category
 *               isbn:
 *                 type: string
 *                 description: ISBN number
 *               totalCopies:
 *                 type: number
 *                 description: Total copies available
 *               publishedYear:
 *                 type: number
 *                 description: Year published
 *               description:
 *                 type: string
 *                 description: Book description
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Cover image (jpg, png, webp)
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request
 *       409:
 *         description: Book with this ISBN already exists
 *       500:
 *         description: Server error
 */
bookRouter.post(
  '/',
  authenticateToken,
  requireRole('librarian'),
  uploadImage.single('coverImage'),
  uploadToCloudinary('coverImage', 'books'),
  BookController.createBook
);

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
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
bookRouter.get('/', authenticateToken, BookController.getAllBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a single book by ID
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
bookRouter.get('/:id', authenticateToken, BookController.getBookById);

export default bookRouter;