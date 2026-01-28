import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';
import { AuthenticatedRequest, Book } from '../types/library';

export class BookController {
  static async getAllBooks(
    req: AuthenticatedRequest,
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

  static async getBookById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const book: Book = await BookService.getBookById(req.params.id as string);
      return res.status(200).json(book);
    } catch (error) {
      return next(error);
    }
  }

  static async createBook(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const {
        title,
        author,
        category,
        isbn,
        totalCopies,
        publishedYear,
        description,
        coverImage,
      } = req.body;

      const book: Book = await BookService.createBook({
        title,
        author,
        category,
        isbn,
        totalCopies: parseInt(totalCopies.toString()),
        publishedYear: publishedYear ? parseInt(publishedYear.toString()) : undefined,
        description,
        coverImage: coverImage || null,
      });

      return res.status(201).json(book);
    } catch (error) {
      return next(error);
    }
  }
}
