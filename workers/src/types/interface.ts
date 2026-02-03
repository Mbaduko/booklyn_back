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