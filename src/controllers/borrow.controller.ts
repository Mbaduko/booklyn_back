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

  static async getBorrowHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      // Parse query parameters
      const { from, to } = req.query;
      
      let fromDate: Date | undefined;
      let toDate: Date | undefined;
      
      // Parse from date if provided
      if (from && typeof from === 'string') {
        fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({ error: 'Invalid from date format. Use ISO date format.' });
        }
      }
      
      // Parse to date if provided
      if (to && typeof to === 'string') {
        toDate = new Date(to);
        if (isNaN(toDate.getTime())) {
          return res.status(400).json({ error: 'Invalid to date format. Use ISO date format.' });
        }
      }
      
      const borrows = await BorrowService.getBorrowHistory(userId, userRole, fromDate, toDate);
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
   * Confirm return of a borrowed book
   */
  static async confirmReturn(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const borrowId = req.params.borrowId as string;
      
      const borrow: BorrowRecord = await BorrowService.confirmReturn(borrowId);
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
