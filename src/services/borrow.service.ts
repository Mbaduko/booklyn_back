import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { BorrowRecord, NotificationContent } from '../types/library';
import Config from '../config';
import { NotificationService } from './notification.service';

export class BorrowService {
  static async getAllBorrows(userId: string, userRole: 'librarian' | 'client'): Promise<BorrowRecord[]> {
    const whereClause = userRole === 'librarian' ? {} : { userId };
    
    const borrows: BorrowRecord[] = await prisma.borrowRecord.findMany({
      where: whereClause,
      select: {
        id: true,
        bookId: true,
        userId: true,
        status: true,
        reservedAt: true,
        reservationExpiresAt: true,
        pickupDate: true,
        dueDate: true,
        returnDate: true,
        overduesDays: true,
      },
    }) as BorrowRecord[];
    if (!borrows || borrows.length === 0) {
      throw new AppError('No borrow records found', 404);
    }
    return borrows;
  }

  static async getBorrowById(id: string): Promise<BorrowRecord> {
    const borrow: BorrowRecord | null = await prisma.borrowRecord.findUnique({
      where: { id },
      select: {
        id: true,
        bookId: true,
        userId: true,
        status: true,
        reservedAt: true,
        reservationExpiresAt: true,
        pickupDate: true,
        dueDate: true,
        returnDate: true,
        overduesDays: true,
      },
    }) as BorrowRecord | null;
    if (!borrow) {
      throw new AppError('Borrow record not found', 404);
    }
    return borrow;
  }

  /**
   * Reserve a book for a user
   */
  static async reserveBook(bookId: string, userId: string): Promise<BorrowRecord> {
    try {
      // Get user to check remaining borrows and get user info for notification
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          remainingBorrows: true, 
          isActive: true,
          name: true,
          email: true
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!user.isActive) {
        throw new AppError('User account is not active', 403);
      }

      // Check if user has reached the borrow limit
      if (user.remainingBorrows <= 0) {
        throw new AppError('You have reached your maximum borrow limit', 409);
      }

      // Get book to check availability and get book info for notification
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { 
          id: true,
          title: true,
          author: true,
          availableCopies: true,
          totalCopies: true
        }
      });

      if (!book) {
        throw new AppError('Book not found', 404);
      }

      // Check if book is available
      if (book.availableCopies <= 0) {
        throw new AppError('Book is not available for reservation', 409);
      }

      // Check if user already has an active reservation/borrow for this book
      const existingRecord = await prisma.borrowRecord.findFirst({
        where: {
          userId,
          bookId,
          status: {
            in: ['reserved', 'borrowed', 'due_soon', 'overdue']
          }
        }
      });

      if (existingRecord) {
        throw new AppError('You already have an active reservation or borrow for this book', 409);
      }

      // Create the reservation record and update book/user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create borrow record
        const borrowRecord = await tx.borrowRecord.create({
          data: {
            userId,
            bookId,
            status: 'reserved',
            reservedAt: new Date(),
            reservationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          },
          select: {
            id: true,
            bookId: true,
            userId: true,
            status: true,
            reservedAt: true,
            reservationExpiresAt: true,
            pickupDate: true,
            dueDate: true,
            returnDate: true,
            overduesDays: true,
          },
        }) as BorrowRecord;

        // Decrement book available copies
        await tx.book.update({
          where: { id: bookId },
          data: {
            availableCopies: {
              decrement: 1
            }
          }
        });

        // Decrement user remaining borrows
        await tx.user.update({
          where: { id: userId },
          data: {
            remainingBorrows: {
              decrement: 1
            }
          }
        });

        return borrowRecord;
      });

      // Send notification to all librarians about the reservation
      try {
        const librarianNotification: NotificationContent = {
          title: 'New Book Reservation',
          message: `${user.name} (${user.email}) has reserved "${book.title}" by ${book.author}. The reservation expires in 24 hours.`,
          type: 'info'
        };

        await NotificationService.sendNotificationToRole('librarian', librarianNotification);
      } catch (notificationError) {
        // Log notification error but don't fail the reservation
        console.error('Failed to send librarian notification:', notificationError);
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to reserve book', 500);
    }
  }
}
