import { Request } from 'express';
export interface JwtPayload {
  id: string;
  email: string;
  role: 'librarian' | 'client';
  isActive: boolean;
}
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface AuthResponse {
  user: User;
  token: string;
}
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
