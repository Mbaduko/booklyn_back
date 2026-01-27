import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';
import { Book } from '../types/library';

export class BookController {
  static async getAllBooks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const books: Book[] = await BookService.getAllBooks();
      return res.status(200).json(books);
    } catch (error) {
      return next(error);
    }
  }
}
