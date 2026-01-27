export interface User {
  id: string;
  email: string;
  name: string;
  role: 'librarian' | 'client';
  avatar?: string | null;
  createdAt: Date;
  isActive: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  coverImage?: string | null;
  description?: string;
  publishedYear?: number;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  status: 'reserved' | 'borrowed' | 'due_soon' | 'overdue' | 'returned';
  reservedAt: Date;
  reservationExpiresAt: Date;
  pickupDate?: Date;
  dueDate?: Date;
  returnDate?: Date;
  overduesDays?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Date;
}
