import { Router } from 'express';
import { BorrowController } from '../controllers/borrow.controller';
import { authenticateToken } from '@/middlewares/authMiddleware';
import { requireRole } from '@/middlewares/roleMiddleware';

const borrowRouter = Router();

/**
 * @swagger
 * /borrows:
 *   get:
 *     summary: Get all borrow records
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of borrow records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BorrowRecord'
 *       404:
 *         description: No borrow records found
 *       500:
 *         description: Server error
 */
borrowRouter.get('/', authenticateToken, BorrowController.getAllBorrows);

/**
 * @swagger
 * /borrows/history:
 *   get:
 *     summary: Get borrow history within a time range
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the history range (optional, defaults to 7 days ago)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the history range (optional, defaults to now)
 *     responses:
 *       200:
 *         description: List of borrow records in the specified time range
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   reservedAt:
 *                     type: string
 *                     format: date-time
 *                   pickupDate:
 *                     type: string
 *                     format: date-time
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *                   returnDate:
 *                     type: string
 *                     format: date-time
 *                   overduesDays:
 *                     type: integer
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                   book:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       author:
 *                         type: string
 *                       isbn:
 *                         type: string
 *                       category:
 *                         type: string
 *                       availableCopies:
 *                         type: integer
 *                       totalCopies:
 *                         type: integer
 *       404:
 *         description: No borrow records found in the specified time range
 *       500:
 *         description: Server error
 */
borrowRouter.get('/history', authenticateToken, BorrowController.getBorrowHistory);

/**
 * @swagger
 * /borrows/{id}:
 *   get:
 *     summary: Get a single borrow record by ID
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Borrow record ID
 *     responses:
 *       200:
 *         description: Borrow record object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BorrowRecord'
 *       404:
 *         description: Borrow record not found
 *       500:
 *         description: Server error
 */
borrowRouter.get('/:id', authenticateToken, BorrowController.getBorrowById);

/**
 * @swagger
 * /borrows/{bookId}/reserve:
 *   post:
 *     summary: Reserve a book
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *         required: true
 *         description: Book ID to reserve
 *     responses:
 *       201:
 *         description: Book reserved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BorrowRecord'
 *       403:
 *         description: User account not active
 *       404:
 *         description: Book or user not found
 *       409:
 *         description: Book not available or user reached borrow limit
 *       500:
 *         description: Server error
 */
borrowRouter.post('/:bookId/reserve', authenticateToken, requireRole('client'), BorrowController.reserveBook);

/**
 * @swagger
 * /borrows/{borrowId}/pickup:
 *   post:
 *     summary: Confirm pickup of a reserved book
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: borrowId
 *         schema:
 *           type: string
 *         required: true
 *         description: Borrow record ID to confirm pickup
 *     responses:
 *       200:
 *         description: Book pickup confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BorrowRecord'
 *       403:
 *         description: User not authorized or account not active
 *       404:
 *         description: Borrow record or user not found
 *       409:
 *         description: Reservation not in reserved state or expired
 *       500:
 *         description: Server error
 */
borrowRouter.post('/:borrowId/pickup', authenticateToken, requireRole('librarian'), BorrowController.confirmPickup);

/**
 * @swagger
 * /borrows/{borrowId}/return:
 *   post:
 *     summary: Confirm return of a borrowed book
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: borrowId
 *         schema:
 *           type: string
 *         required: true
 *         description: Borrow record ID to confirm return
 *     responses:
 *       200:
 *         description: Book return confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BorrowRecord'
 *       403:
 *         description: User account not active
 *       404:
 *         description: Borrow record or user not found
 *       409:
 *         description: Book cannot be returned (already returned or only reserved)
 *       500:
 *         description: Server error
 */
borrowRouter.post('/:borrowId/return', authenticateToken, requireRole('librarian'), BorrowController.confirmReturn);

export default borrowRouter;