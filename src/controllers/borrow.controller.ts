import { Request, Response, NextFunction } from 'express';
import { BorrowService } from '../services/borrow.service';
import { AuthenticatedRequest, BorrowRecord } from '../types/library';

export class BorrowController {
  static async getAllBorrows(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const borrows: BorrowRecord[] = await BorrowService.getAllBorrows(userId, userRole);
      return res.status(200).json(borrows);
    } catch (error) {
      return next(error);
    }
  }

  static async getBorrowById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const borrow: BorrowRecord = await BorrowService.getBorrowById(req.params.id as string);
      return res.status(200).json(borrow);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Confirm pickup of a reserved book
   */
  static async confirmPickup(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const borrowId = req.params.borrowId as string;
      
      const borrow: BorrowRecord = await BorrowService.confirmPickup(borrowId);
      return res.status(200).json(borrow);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Reserve a book for the authenticated user
   */
  static async reserveBook(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userId = req.user!.id;
      const bookId = req.params.bookId as string;
      
      const borrow: BorrowRecord = await BorrowService.reserveBook(bookId, userId);
      return res.status(201).json(borrow);
    } catch (error) {
      return next(error);
    }
  }
}
