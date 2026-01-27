import { Request, Response, NextFunction } from 'express';
import { BorrowService } from '../services/borrow.service';
import { BorrowRecord } from '../types/library';

export class BorrowController {
  static async getAllBorrows(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const borrows: BorrowRecord[] = await BorrowService.getAllBorrows();
      return res.status(200).json(borrows);
    } catch (error) {
      return next(error);
    }
  }

  static async getBorrowById(
    req: Request,
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
}
