export interface PickupReminderJobData {
  borrowId: string;
  userEmail: string;
  bookTitle?: string;
  bookAuthor?: string;
  pickupDeadline: Date;
}