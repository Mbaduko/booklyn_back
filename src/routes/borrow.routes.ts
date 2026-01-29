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

export default borrowRouter;