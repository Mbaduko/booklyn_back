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
   * Confirm pickup of a reserved book
   */
  static async confirmPickup(borrowId: string): Promise<BorrowRecord> {
    try {
      // Get the borrow record to validate
      const borrow = await prisma.borrowRecord.findUnique({
        where: { id: borrowId },
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

      // Check if the borrow is still in reserved state
      if (borrow.status !== 'reserved') {
        throw new AppError('This reservation cannot be confirmed for pickup', 409);
      }

      // Check if the reservation has expired
      if (borrow.reservationExpiresAt && new Date() > borrow.reservationExpiresAt) {
        throw new AppError('Reservation has expired', 409);
      }

      // Get user to check if still active
      const user = await prisma.user.findUnique({
        where: { id: borrow.userId },
        select: { isActive: true }
      });

      if (!user) {
        throw new AppError('Requester not found', 404);
      }

      if (!user.isActive) {
        throw new AppError('Requester account is not active', 409);
      }

      // Get book information for notification
      const book = await prisma.book.findUnique({
        where: { id: borrow.bookId },
        select: { title: true, author: true }
      });

      if (!book) {
        throw new AppError('Book not found', 404);
      }

      // Update the borrow record to borrowed status
      const updatedBorrow = await prisma.borrowRecord.update({
        where: { id: borrowId },
        data: {
          status: 'borrowed',
          pickupDate: new Date(),
          dueDate: new Date(Date.now() + Config.env.holdBookDurationDays* 24 * 60 * 60 * 1000), // 14 days from now
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

      // Send notification to user about successful pickup
      try {
        const pickupNotification: NotificationContent = {
          title: 'Book Pickup Confirmed',
          message: `You have successfully picked up "${book.title}" by ${book.author}. The book is due on ${updatedBorrow.dueDate?.toLocaleDateString()}. Enjoy reading!`,
          type: 'success'
        };

        await NotificationService.sendNotificationToUser(borrow.userId, pickupNotification);
      } catch (notificationError) {
        // Log notification error but don't fail the pickup confirmation
        console.error('Failed to send pickup notification:', notificationError);
      }

      return updatedBorrow;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to confirm book pickup', 500);
    }
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
            reservationExpiresAt: new Date(Date.now() + Config.env.bookReservationPeriodHours * 60 * 60 * 1000),
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
          message: `${user.name} (${user.email}) has reserved "${book.title}" by ${book.author}. The reservation expires in ${Config.env.bookReservationPeriodHours} hours.`,
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
