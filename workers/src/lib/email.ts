import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import Config from '../config';

// Static initialization - runs once at startup
let emailClient: any;
let isProduction: boolean;

// Initialize the appropriate client based on environment
(() => {
  isProduction = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'live');
  
  if (isProduction) {
    console.log('📧 Initializing Resend email client (Production mode)');
    emailClient = new Resend(Config.env.resendApiKey);
  } else {
    console.log('📧 Initializing Nodemailer email client (Development mode)');
    emailClient = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
})();

// Export the client and helper functions
export { emailClient, isProduction };
export const DEFAULT_SENDER = Config.env.resendSenderEmail;

// Helper function to send email using the appropriate client
export async function sendEmailWithClient(payload: any) {
  if (isProduction) {
    // Use Resend
    return emailClient.emails.send(payload);
  } else {
    // Use Nodemailer
    return emailClient.sendMail(payload);
  }
}
