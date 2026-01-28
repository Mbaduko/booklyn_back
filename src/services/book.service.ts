
import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { Book } from '../types/library';
import { CloudinaryService } from './cloudinary.service';

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

  static async createBook(bookData: {
    title: string;
    author: string;
    category: string;
    isbn: string;
    totalCopies: number;
    publishedYear?: number;
    description?: string;
    coverImage?: string | null;
  }): Promise<Book> {
    const existingBook = await prisma.book.findUnique({
      where: { isbn: bookData.isbn },
    });

    if (existingBook) {
      if (bookData.coverImage) {
        await CloudinaryService.deleteImage(bookData.coverImage);
      }
      throw new AppError('Book with this ISBN already exists', 409);
    }

    const book: Book = await prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        isbn: bookData.isbn,
        totalCopies: bookData.totalCopies,
        availableCopies: bookData.totalCopies,
        publishedYear: bookData.publishedYear,
        description: bookData.description,
        coverImage: bookData.coverImage,
      },
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
    }) as Book;

    return book;
  }

  static async updateBook(
    id: string,
    updateData: {
      title?: string;
      author?: string;
      category?: string;
      isbn?: string;
      totalCopies?: number;
      publishedYear?: number;
      description?: string;
      coverImage?: string | null;
    }
  ): Promise<Book> {
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      if (updateData.coverImage) {
        await CloudinaryService.deleteImage(updateData.coverImage);
      }
      throw new AppError('Book not found', 404);
    }

    if (updateData.isbn && updateData.isbn !== existingBook.isbn) {
      const duplicateBook = await prisma.book.findUnique({
        where: { isbn: updateData.isbn },
      });

      if (duplicateBook) {
        if (updateData.coverImage) {
          await CloudinaryService.deleteImage(updateData.coverImage);
        }
        throw new AppError('Book with this ISBN already exists', 409);
      }
    }

    const oldCoverImage = existingBook.coverImage;

    const updatePayload: any = { ...updateData };
    
    if (updateData.totalCopies !== undefined) {
      updatePayload.availableCopies = updateData.totalCopies;
    }

    const book: Book = await prisma.book.update({
      where: { id },
      data: updatePayload,
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
    }) as Book;

    if (oldCoverImage && updateData.coverImage !== oldCoverImage) {
      await CloudinaryService.deleteImage(oldCoverImage);
    }

    return book;
  }
}
