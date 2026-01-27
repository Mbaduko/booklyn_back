import { Router } from 'express';
import { BorrowController } from '../controllers/borrow.controller';

const borrowRouter = Router();

/**
 * @swagger
 * /borrows:
 *   get:
 *     summary: Get all borrow records
 *     tags: [Borrows]
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
borrowRouter.get('/', BorrowController.getAllBorrows);

/**
 * @swagger
 * /borrows/{id}:
 *   get:
 *     summary: Get a single borrow record by ID
 *     tags: [Borrows]
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
borrowRouter.get('/:id', BorrowController.getBorrowById);

export default borrowRouter;