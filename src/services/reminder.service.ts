import { reminderQueue } from '../lib/queues/reminder';
import Config from '../config';

export interface PickupReminderJobData {
  borrowId: string;
  userEmail: string;
  bookTitle?: string;
  bookAuthor?: string;
  pickupDeadline: Date;
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

export class ReminderService {
  /**
   * Schedule a pickup reminder for a reserved book
   * @param borrowId - The borrow record ID
   * @param userEmail - The user's email address
   * @param pickupDeadline - When the reservation expires/pickup deadline
   * @param bookTitle - Optional book title for email content
   * @param bookAuthor - Optional book author for email content
   */
  static async schedulePickupReminder(
    borrowId: string,
    userEmail: string,
    pickupDeadline: Date,
    bookTitle?: string,
    bookAuthor?: string
  ): Promise<void> {
    try {
      // Calculate delay in milliseconds (pickup deadline - reminder time before)
      const reminderTimeHours = Config.env.pickRemindTime || 2; // Default to 2 hours before
      const now = new Date();
      const reminderTime = new Date(pickupDeadline.getTime() - (reminderTimeHours * 60 * 60 * 1000));
      // Calculate delay from now to reminder time
      const delay = reminderTime.getTime() - now.getTime();
      
      // Only schedule if reminder time is in the future
      if (delay <= 0) {
        console.log(`Pickup reminder for borrow ${borrowId} is in the past, skipping scheduling`);
        return;
      }

      const jobData: PickupReminderJobData = {
        borrowId,
        userEmail,
        bookTitle,
        bookAuthor,
        pickupDeadline,
      };

      // Add job to reminder queue
      await reminderQueue.add(
        'pickup-reminder',
        jobData,
        {
          delay, // Delay in milliseconds
          attempts: 3, // Retry up to 3 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 seconds
          },
          removeOnComplete: 10, // Keep last 10 completed jobs
          removeOnFail: 5, // Keep last 5 failed jobs
        }
      );
      console.log(`Pickup reminder scheduled for borrow ${borrowId} at ${reminderTime.toISOString()}`);
    } catch (error) {
      console.error('Failed to schedule pickup reminder:', error);
      throw new Error(`Failed to schedule pickup reminder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Schedule a job to mark a borrow as overdue
   * @param borrowId - The borrow record ID
   * @param dueDate - When the book is due
   */
  static async scheduleOverdueSetter(
    borrowId: string,
    dueDate: Date
  ): Promise<void> {
    try {
      const now = new Date();
      
      // Calculate delay from now to due date
      const delay = dueDate.getTime() - now.getTime();
      
      // Only schedule if due date is in the future
      if (delay <= 0) {
        console.log(`Overdue setter for borrow ${borrowId} is in the past, skipping scheduling`);
        return;
      }

      const jobData: OverdueSetterJobData = {
        borrowId,
        dueDate,
      };

      // Add job to reminder queue
      await reminderQueue.add(
        'overdue-setter',
        jobData,
        {
          delay, // Delay in milliseconds
          attempts: 3, // Retry up to 3 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 seconds
          },
          removeOnComplete: 10, // Keep last 10 completed jobs
          removeOnFail: 5, // Keep last 5 failed jobs
        }
      );

      console.log(`Overdue setter scheduled for borrow ${borrowId} at ${dueDate.toISOString()}`);
    } catch (error) {
      console.error('Failed to schedule overdue setter:', error);
      throw new Error(`Failed to schedule overdue setter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel an overdue setter job for a specific borrow
   * @param borrowId - The borrow record ID
   */
  static async cancelOverdueSetter(borrowId: string): Promise<void> {
    try {
      const jobs = await reminderQueue.getJobs(['waiting', 'delayed']);
      
      for (const job of jobs) {
        if (job.name === 'overdue-setter' && job.data.borrowId === borrowId) {
          await job.remove();
          console.log(`Overdue setter cancelled for borrow ${borrowId}`);
        }
      }
    } catch (error) {
      console.error('Failed to cancel overdue setter:', error);
      throw new Error(`Failed to cancel overdue setter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Schedule a due date reminder for a borrowed book
   * @param borrowId - The borrow record ID
   * @param userEmail - The user's email address
   * @param dueDate - When the book is due
   * @param bookTitle - Optional book title for email content
   * @param bookAuthor - Optional book author for email content
   */
  static async scheduleDueReminder(
    borrowId: string,
    userEmail: string,
    dueDate: Date,
    bookTitle?: string,
    bookAuthor?: string
  ): Promise<void> {
    try {
      // Calculate delay in milliseconds (due date - reminder time before)
      const reminderTimeHours = Config.env.dueRemindTime || 24; // Default to 24 hours before
      const now = new Date();
      const reminderTime = new Date(dueDate.getTime() - (reminderTimeHours * 60 * 60 * 1000));
      
      // Calculate delay from now to reminder time
      const delay = reminderTime.getTime() - now.getTime();
      
      // Only schedule if reminder time is in the future
      if (delay <= 0) {
        console.log(`Due reminder for borrow ${borrowId} is in the past, skipping scheduling`);
        return;
      }

      const jobData: DueReminderJobData = {
        borrowId,
        userEmail,
        bookTitle,
        bookAuthor,
        dueDate,
      };

      // Add job to reminder queue
      await reminderQueue.add(
        'due-reminder',
        jobData,
        {
          delay, // Delay in milliseconds
          attempts: 3, // Retry up to 3 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 seconds
          },
          removeOnComplete: 10, // Keep last 10 completed jobs
          removeOnFail: 5, // Keep last 5 failed jobs
        }
      );

      console.log(`Due reminder scheduled for borrow ${borrowId} at ${reminderTime.toISOString()}`);
    } catch (error) {
      console.error('Failed to schedule due reminder:', error);
      throw new Error(`Failed to schedule due reminder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel a pickup reminder for a specific borrow
   * @param borrowId - The borrow record ID
   */
  static async cancelPickupReminder(borrowId: string): Promise<void> {
    try {
      const jobs = await reminderQueue.getJobs(['waiting', 'delayed']);
      
      for (const job of jobs) {
        if (job.name === 'pickup-reminder' && job.data.borrowId === borrowId) {
          await job.remove();
          console.log(`Pickup reminder cancelled for borrow ${borrowId}`);
        }
      }
    } catch (error) {
      console.error('Failed to cancel pickup reminder:', error);
      throw new Error(`Failed to cancel pickup reminder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel a due reminder for a specific borrow
   * @param borrowId - The borrow record ID
   */
  static async cancelDueReminder(borrowId: string): Promise<void> {
    try {
      const jobs = await reminderQueue.getJobs(['waiting', 'delayed']);
      
      for (const job of jobs) {
        if (job.name === 'due-reminder' && job.data.borrowId === borrowId) {
          await job.remove();
          console.log(`Due reminder cancelled for borrow ${borrowId}`);
        }
      }
    } catch (error) {
      console.error('Failed to cancel due reminder:', error);
      throw new Error(`Failed to cancel due reminder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get status of reminders for a specific borrow
   * @param borrowId - The borrow record ID
   */
  static async getReminderStatus(borrowId: string): Promise<{
    pickupReminder: { scheduled: boolean; data?: any; runAt?: Date } | null;
    dueReminder: { scheduled: boolean; data?: any; runAt?: Date } | null;
    overdueSetter: { scheduled: boolean; data?: any; runAt?: Date } | null;
  }> {
    try {
      const jobs = await reminderQueue.getJobs(['waiting', 'delayed', 'completed', 'failed']);
      
      let pickupReminder = null;
      let dueReminder = null;
      let overdueSetter = null;

      for (const job of jobs) {
        if (job.data.borrowId === borrowId) {
          const reminderData = {
            scheduled: job.opts.delay ? job.opts.delay > 0 : false,
            data: job.data,
            runAt: job.opts.delay ? new Date(Date.now() + job.opts.delay) : undefined,
          };

          if (job.name === 'pickup-reminder') {
            pickupReminder = reminderData;
          } else if (job.name === 'due-reminder') {
            dueReminder = reminderData;
          } else if (job.name === 'overdue-setter') {
            overdueSetter = reminderData;
          }
        }
      }

      return { pickupReminder, dueReminder, overdueSetter };
    } catch (error) {
      console.error('Failed to get reminder status:', error);
      throw new Error(`Failed to get reminder status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
