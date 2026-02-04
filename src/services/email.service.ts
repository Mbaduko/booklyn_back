import { sendEmailWithClient, DEFAULT_SENDER } from '../lib/email';
import AppError from '../utils/AppError';

// Email options interface matching Resend API
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export class EmailService {
  /**
   * Send an email using Resend
   * @param emailOptions - Email configuration options
   * @returns Promise resolving to the email send result
   */
  static async sendEmail(emailOptions: EmailOptions) {
    try {
      // Validate required fields
      if (!emailOptions.to) {
        throw new AppError('Email recipient (to) is required', 400);
      }

      if (!emailOptions.subject) {
        throw new AppError('Email subject is required', 400);
      }

      if (!emailOptions.html && !emailOptions.text) {
        throw new AppError('Email content (html or text) is required', 400);
      }

      // Prepare email payload with only defined values
      const emailPayload: any = {
        from: emailOptions.from || DEFAULT_SENDER,
        to: emailOptions.to,
        subject: emailOptions.subject,
      };

      // Add optional fields only if they are defined
      if (emailOptions.html) emailPayload.html = emailOptions.html;
      if (emailOptions.text) emailPayload.text = emailOptions.text;
      if (emailOptions.cc) emailPayload.cc = emailOptions.cc;
      if (emailOptions.bcc) emailPayload.bcc = emailOptions.bcc;
      if (emailOptions.replyTo) emailPayload.replyTo = emailOptions.replyTo;
      if (emailOptions.attachments) emailPayload.attachments = emailOptions.attachments;

      // Send email using the appropriate client
      const result = await sendEmailWithClient(emailPayload);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  /**
   * Send a simple text email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param text - Plain text content
   * @param from - Optional sender email (uses default if not provided)
   */
  static async sendTextEmail(
    to: string | string[],
    subject: string,
    text: string,
    from?: string
  ) {
    return this.sendEmail({
      to,
      subject,
      text,
      from,
    });
  }

  /**
   * Send a simple HTML email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param html - HTML content
   * @param from - Optional sender email (uses default if not provided)
   */
  static async sendHtmlEmail(
    to: string | string[],
    subject: string,
    html: string,
    from?: string
  ) {
    return this.sendEmail({
      to,
      subject,
      html,
      from,
    });
  }

  /**
   * Send email with both HTML and text content
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param html - HTML content
   * @param text - Plain text content
   * @param from - Optional sender email (uses default if not provided)
   */
  static async sendMultiPartEmail(
    to: string | string[],
    subject: string,
    html: string,
    text: string,
    from?: string
  ) {
    return this.sendEmail({
      to,
      subject,
      html,
      text,
      from,
    });
  }
}
