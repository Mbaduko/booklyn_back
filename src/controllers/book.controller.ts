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

  static async updateBook(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
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

      const updateData: any = {};
      
      if (title !== undefined && title !== '') updateData.title = title;
      if (author !== undefined && author !== '') updateData.author = author;
      if (category !== undefined && category !== '') updateData.category = category;
      if (isbn !== undefined && isbn !== '') updateData.isbn = isbn;
      if (totalCopies !== undefined && totalCopies !== '') updateData.totalCopies = parseInt(totalCopies.toString());
      if (publishedYear !== undefined && publishedYear !== '') updateData.publishedYear = parseInt(publishedYear.toString());
      if (description !== undefined && description !== '') updateData.description = description;
      if (coverImage !== undefined) updateData.coverImage = coverImage || null;

      const book: Book = await BookService.updateBook(req.params.id as string, updateData);

      return res.status(200).json(book);
    } catch (error) {
      return next(error);
    }
  }
}
