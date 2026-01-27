
import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { Book } from '../types/library';

export class BookService {
  static async getAllBooks(): Promise<Book[]> {
    const books: Book[] = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        category: true,
        isbn: true,
        totalCopies: true,
        availableCopies: true,
        coverImage: true,
        description: true,
        publishedYear: true,
      },
    }) as Book[];
    if (!books || books.length === 0) {
      throw new AppError('No books found', 404);
    }
    return books;
  }

  static async getBookById(id: string): Promise<Book> {
    const book: Book | null = await prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        author: true,
        category: true,
        isbn: true,
        totalCopies: true,
        availableCopies: true,
        coverImage: true,
        description: true,
        publishedYear: true,
      },
    }) as Book | null;
    if (!book) {
      throw new AppError('Book not found', 404);
    }
    return book;
  }
}
