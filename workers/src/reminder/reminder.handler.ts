import { PickupReminderJobData, PickupExpiryJobData, DueReminderJobData, OverdueSetterJobData } from "../types/interface";
import { Job } from "bullmq";
import { EmailService } from "../services/email.service";
import { EmailTemplate } from "../templates/email-template";
import prisma from "../lib/prisma";
import Config from "../config/index";

// Helper function to convert milliseconds to human-readable time
function formatTimeDifference(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        return 'less than a minute';
    }
}

export default class ReminderHandler {
    static async pickupReminderHandler(job: Job) {
        const { borrowId, userEmail }: PickupReminderJobData = job.data;

        try {
            // Find the borrow record with book and user information
            const borrowRecord = await prisma.borrowRecord.findUnique({
                where: { id: borrowId },
                include: {
                    book: {
                        select: {
                            title: true,
                            author: true
                        }
                    },
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            });

            if (!borrowRecord) {
                console.error(`Borrow record not found for ID: ${borrowId}`);
                throw new Error(`Borrow record not found for ID: ${borrowId}`);
            }

            // Check if the book is still reserved
            if (borrowRecord.status !== 'reserved') {
                console.log(`Book ${borrowRecord.book.title} is not reserved (status: ${borrowRecord.status}). Skipping reminder.`);
                return { success: false, reason: 'Book not reserved', status: borrowRecord.status };
            }

            // Calculate pickup deadline using the schema's reservationExpiresAt field
            const pickupDeadline = borrowRecord.reservationExpiresAt;
            const now = new Date();
            const timeUntilDeadline = pickupDeadline.getTime() - now.getTime();

            // Convert to human-readable time
            const days = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeUntilDeadline % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntilDeadline % (1000 * 60 * 60)) / (1000 * 60));

            let timeRemaining = '';
            if (days > 0) {
                timeRemaining = `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
            } else if (hours > 0) {
                timeRemaining = `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
            } else {
                timeRemaining = `${minutes} minute${minutes > 1 ? 's' : ''}`;
            }

            // Check if we should send reminder based on pickRemindTime (convert to milliseconds)
            const pickRemindTimeMs = Config.env.pickRemindTime * 60 * 60 * 1000;
            if (timeUntilDeadline > pickRemindTimeMs) {
                console.log(`Pickup deadline is ${timeRemaining} away, which is more than ${Config.env.pickRemindTime} hours. Skipping reminder.`);
                return { success: false, reason: 'Too early for reminder', timeRemaining };
            }

            // Generate pickup reminder email using template
            const emailContent = `
                <p>This is a friendly reminder that your reserved book is ready for pickup and the deadline is approaching soon!</p>
                
                <div class="warning-text">
                    <strong>Time Sensitive:</strong> You have <strong>${timeRemaining}</strong> remaining to pick up your book before the reservation expires.
                </div>
                
                <p>Please visit the library during our operating hours to collect your book. If you don't pick it up in time, the reservation will be automatically cancelled and the book will become available for other users.</p>
                
                <p>If you need to extend your reservation or have any questions, please contact our library staff as soon as possible.</p>
            `;

            const emailHtml = EmailTemplate.generateTemplate({
                title: 'Book Pickup Reminder - Time Running Out!',
                content: emailContent,
                userName: borrowRecord.user.name,
                footerText: `Reservation expires on ${pickupDeadline.toLocaleString()}. Please arrive 10 minutes early for a smooth pickup process.`
            });

            await EmailService.sendHtmlEmail(userEmail, 'Book Pickup Reminder - Time Running Out!', emailHtml);

            console.log(`✅ Pickup reminder sent to ${userEmail} for book "${borrowRecord.book.title}" (Borrow ID: ${borrowId})`);

            return { 
                success: true, 
                borrowId, 
                userEmail, 
                bookTitle: borrowRecord.book.title,
                pickupDeadline,
                timeRemaining
            };

        } catch (error) {
            console.error(`❌ Failed to process pickup reminder for borrow ID ${borrowId}:`, error);
            throw error;
        }
    }

    static async pickupExpiryHandler(job: Job) {
        const { borrowId, userEmail }: PickupExpiryJobData = job.data;

        try {
            // Find the borrow record with book and user information
            const borrowRecord = await prisma.borrowRecord.findUnique({
                where: { id: borrowId },
                include: {
                    book: {
                        select: {
                            title: true,
                            author: true
                        }
                    },
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            });

            if (!borrowRecord) {
                console.error(`Borrow record not found for ID: ${borrowId}`);
                throw new Error(`Borrow record not found for ID: ${borrowId}`);
            }

            // Check if the book is still reserved (not picked up)
            if (borrowRecord.status !== 'reserved') {
                console.log(`Book ${borrowRecord.book.title} is not reserved (status: ${borrowRecord.status}). Skipping expiry.`);
                return { success: false, reason: 'Book not reserved', status: borrowRecord.status };
            }

            // Update the borrow record status to cancel the reservation
            const updatedBorrow = await prisma.borrowRecord.update({
                where: { id: borrowId },
                data: {
                    status: 'expired', // Using 'returned' as cancelled reservation
                }
            });

            // Increase the available copies of the book
            await prisma.book.update({
                where: { id: borrowRecord.bookId },
                data: {
                    availableCopies: {
                        increment: 1
                    }
                }
            });

            // Increase user's remaining borrows
            await prisma.user.update({
                where: { id: borrowRecord.userId },
                data: {
                    remainingBorrows: {
                        increment: 1
                    }
                }
            });

            // Generate expiry notification email
            const emailContent = `
                <p>We hope this message finds you well. Unfortunately, your reservation has expired because the pickup deadline has passed.</p>
                
                <div class="destructive-text">
                    <strong>Reservation Expired:</strong> The pickup deadline for "${borrowRecord.book.title}" was ${job.data.pickupExpiresAt.toLocaleString()}.
                </div>
                
                <p>The book has been made available for other users to reserve. Your borrow limit has been restored, and you can now reserve other books.</p>
                
                <p>If you still need this book, please check its availability and make a new reservation.</p>
                
                <p>We understand that circumstances may change, and we invite you to visit the library again soon.</p>
            `;

            const emailHtml = EmailTemplate.generateTemplate({
                title: 'Book Reservation Expired - Booklyn Library',
                content: emailContent,
                userName: borrowRecord.user.name,
                actionButton: {
                    text: 'Browse Available Books',
                    url: 'https://booklyn.com/books'
                },
                footerText: 'Your reservation expired at the specified time. Books are held for 24 hours after reservation.'
            });

            await EmailService.sendHtmlEmail(userEmail, 'Book Reservation Expired - Booklyn Library', emailHtml);

            console.log(`✅ Pickup expiry processed for ${userEmail} - Book "${borrowRecord.book.title}" reservation cancelled (Borrow ID: ${borrowId})`);

            return { 
                success: true, 
                borrowId, 
                userEmail, 
                bookTitle: borrowRecord.book.title,
                action: 'reservation_cancelled'
            };

        } catch (error) {
            console.error(`❌ Failed to process pickup expiry for borrow ID ${borrowId}:`, error);
            throw error;
        }
    }

    static async dueReminderHandler(job: Job) {
        const { borrowId, userEmail }: DueReminderJobData = job.data;

        try {
            // Find the borrow record with book and user information
            const borrowRecord = await prisma.borrowRecord.findUnique({
                where: { id: borrowId },
                include: {
                    book: {
                        select: {
                            title: true,
                            author: true
                        }
                    },
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            });

            if (!borrowRecord) {
                console.error(`Borrow record not found for ID: ${borrowId}`);
                throw new Error(`Borrow record not found for ID: ${borrowId}`);
            }

            // Check if the book is still borrowed
            if (borrowRecord.status !== 'borrowed') {
                console.log(`Book ${borrowRecord.book.title} is not borrowed (status: ${borrowRecord.status}). Skipping due reminder.`);
                return { success: false, reason: 'Book not borrowed', status: borrowRecord.status };
            }

            // Update the borrow record status to due_soon
            const updatedBorrow = await prisma.borrowRecord.update({
                where: { id: borrowId },
                data: {
                    status: 'due_soon'
                }
            });

            // Calculate time until due in human-readable format
            const now = new Date();
            const dueDate = new Date(job.data.dueDate);
            const timeUntilDue = dueDate.getTime() - now.getTime();
            const timeUntilDueHuman = formatTimeDifference(timeUntilDue);

            // Generate due reminder email
            const emailContent = `
                <p>This is a friendly reminder that your borrowed book is due soon.</p>
                
                <div class="warning-text">
                    <strong>Due Date Approaching:</strong> "${borrowRecord.book.title}" is due in <strong>${timeUntilDueHuman}</strong>.
                </div>
                
                <p>Please return the book to the library before the due date to avoid late fees. You can also renew the book online if you need more time.</p>
                
                <p>If you have already returned the book, please disregard this message.</p>
                
                <p>Thank you for using Booklyn Library!</p>
            `;

            const emailHtml = EmailTemplate.generateTemplate({
                title: 'Book Due Soon - Booklyn Library',
                content: emailContent,
                userName: borrowRecord.user.name,
                actionButton: {
                    text: 'Renew Book',
                    url: `https://booklyn.com/borrowed/${borrowId}/renew`
                },
                footerText: `Book is due on ${dueDate.toLocaleDateString()}. Late fees may apply after this date.`
            });

            await EmailService.sendHtmlEmail(userEmail, 'Book Due Soon - Booklyn Library', emailHtml);

            console.log(`✅ Due reminder sent to ${userEmail} for book "${borrowRecord.book.title}" (Borrow ID: ${borrowId})`);

            return { 
                success: true, 
                borrowId, 
                userEmail, 
                bookTitle: borrowRecord.book.title,
                dueDate,
                timeUntilDue: timeUntilDueHuman,
                action: 'status_set_to_due_soon'
            };

        } catch (error) {
            console.error(`❌ Failed to process due reminder for borrow ID ${borrowId}:`, error);
            throw error;
        }
    }

    static async overdueSetterHandler(job: Job) {
        const { borrowId }: OverdueSetterJobData = job.data;

        try {
            // Find the borrow record
            const borrowRecord = await prisma.borrowRecord.findUnique({
                where: { id: borrowId },
                include: {
                    book: {
                        select: {
                            title: true,
                            author: true
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });

            if (!borrowRecord) {
                console.error(`Borrow record not found for ID: ${borrowId}`);
                throw new Error(`Borrow record not found for ID: ${borrowId}`);
            }

            // Check if the book is still borrowed or due_soon
            if (borrowRecord.status !== 'borrowed' && borrowRecord.status !== 'due_soon') {
                console.log(`Book ${borrowRecord.book.title} is not borrowed/due_soon (status: ${borrowRecord.status}). Skipping overdue setter.`);
                return { success: false, reason: 'Book not borrowed or due_soon', status: borrowRecord.status };
            }

            // Calculate overdue time in human-readable format
            const now = new Date();
            const dueDate = new Date(job.data.dueDate);
            const overdueTime = now.getTime() - dueDate.getTime();
            const overdueTimeHuman = formatTimeDifference(overdueTime);

            // Update the borrow record status to overdue and set overdue days
            const updatedBorrow = await prisma.borrowRecord.update({
                where: { id: borrowId },
                data: {
                    status: 'overdue',
                    overduesDays: Math.floor(overdueTime / (1000 * 60 * 60 * 24))
                }
            });

            // Generate overdue notification email
            const emailContent = `
                <p>This is to inform you that your borrowed book is now overdue.</p>
                
                <div class="destructive-text">
                    <strong>Book Overdue:</strong> "${borrowRecord.book.title}" was due on ${dueDate.toLocaleDateString()}.
                </div>
                
                <p>The book is <strong>${overdueTimeHuman}</strong> overdue. Late fees may apply according to library policy.</p>
                
                <p>Please return the book as soon as possible to avoid additional charges. If you have already returned the book, please contact the library staff.</p>
                
                <p>Thank you for your prompt attention to this matter.</p>
            `;

            const emailHtml = EmailTemplate.generateTemplate({
                title: 'Book Overdue - Booklyn Library',
                content: emailContent,
                userName: borrowRecord.user.name,
                actionButton: {
                    text: 'View My Account',
                    url: 'https://booklyn.com/account'
                },
                footerText: `Book was due on ${dueDate.toLocaleDateString()}. Current overdue: ${overdueTimeHuman}.`
            });

            await EmailService.sendHtmlEmail(borrowRecord.user.email, 'Book Overdue - Booklyn Library', emailHtml);

            console.log(`✅ Overdue status set for ${borrowRecord.user.email} - Book "${borrowRecord.book.title}" is ${overdueTimeHuman} overdue (Borrow ID: ${borrowId})`);

            return { 
                success: true, 
                borrowId, 
                userEmail: borrowRecord.user.email,
                bookTitle: borrowRecord.book.title,
                dueDate,
                overdueTime: overdueTimeHuman,
                action: 'status_set_to_overdue'
            };

        } catch (error) {
            console.error(`❌ Failed to process overdue setter for borrow ID ${borrowId}:`, error);
            throw error;
        }
    }
};