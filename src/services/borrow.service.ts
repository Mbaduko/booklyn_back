import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { BorrowRecord } from '../types/library';

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
}
