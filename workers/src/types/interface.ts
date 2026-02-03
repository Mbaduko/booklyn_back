export interface PickupReminderJobData {
  borrowId: string;
  userEmail: string;
  bookTitle?: string;
  bookAuthor?: string;
  pickupDeadline: Date;
}

export interface PickupExpiryJobData {
  borrowId: string;
  userEmail: string;
  bookTitle?: string;
  bookAuthor?: string;
  pickupExpiresAt: Date;
}

export interface DueReminderJobData {
  borrowId: string;
  userEmail: string;
  bookTitle?: string;
  bookAuthor?: string;
  dueDate: Date;
}

export interface OverdueSetterJobData {
  borrowId: string;
  dueDate: Date;
}