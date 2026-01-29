import { Resend } from 'resend';
import Config from '../config';

// Initialize Resend client with configuration
const resend = new Resend(Config.env.resendApiKey);

export { resend };

// Default sender email from configuration
export const DEFAULT_SENDER = Config.env.resendSenderEmail;
