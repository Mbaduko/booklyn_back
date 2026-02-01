import { PickupReminderJobData } from "../types/interface";
import { Job } from "bullmq";
import { EmailService } from "../services/email.service";
import { EmailTemplate } from "../templates/email-template";
import prisma from "../lib/prisma";
import Config from "../config/index";

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
            const hoursUntilDeadline = Math.ceil((pickupDeadline.getTime() - Date.now()) / (1000 * 60 * 60));

            // Check if we should send reminder based on pickRemindTime
            if (hoursUntilDeadline > Config.env.pickRemindTime) {
                console.log(`Pickup deadline is ${hoursUntilDeadline} hours away, which is more than ${Config.env.pickRemindTime} hours. Skipping reminder.`);
                return { success: false, reason: 'Too early for reminder', hoursUntilDeadline };
            }

            // Generate pickup reminder email using template
            const emailContent = `
                <p>This is a friendly reminder that your reserved book is ready for pickup and the deadline is approaching soon!</p>
                
                <div class="warning-text">
                    <strong>⏰ Time Sensitive:</strong> You have <strong>${hoursUntilDeadline} hours</strong> remaining to pick up your book before the reservation expires.
                </div>
                
                <p>Please visit the library during our operating hours to collect your book. If you don't pick it up in time, the reservation will be automatically cancelled and the book will become available for other users.</p>
                
                <p>If you need to extend your reservation or have any questions, please contact our library staff as soon as possible.</p>
            `;

            const emailHtml = EmailTemplate.generateTemplate({
                title: '📚 Book Pickup Reminder - Time Running Out!',
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
                hoursUntilDeadline
            };

        } catch (error) {
            console.error(`❌ Failed to process pickup reminder for borrow ID ${borrowId}:`, error);
            throw error;
        }
    }
};