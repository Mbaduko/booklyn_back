/**
 * Reusable email HTML template for Booklyn Library System
 * Based on the frontend landing page design
 */

export interface EmailTemplateData {
  title: string;
  content: string;
  userName?: string;
  actionButton?: {
    text: string;
    url: string;
  };
  footerText?: string;
}

export class EmailTemplate {
  /**
   * Generate a complete HTML email with Booklyn branding
   * @param data - Template data including title, content, and optional action button
   * @returns Complete HTML email string
   */
  static generateTemplate(data: EmailTemplateData): string {
    const { title, content, userName, actionButton, footerText } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: hsl(220, 20%, 15%);
            background-color: hsl(150, 14%, 97%);
            margin: 0;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: hsl(0, 0%, 100%);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid hsl(150, 10%, 88%);
        }
        
        .header {
            background: linear-gradient(135deg, hsl(158, 61%, 31%) 0%, hsl(158, 61%, 45%) 100%);
            padding: 40px 30px;
            text-align: center;
            color: hsl(150, 20%, 98%);
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: -1px;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content {
            padding: 40px 30px;
            background-color: hsl(0, 0%, 100%);
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: hsl(220, 20%, 15%);
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.7;
            color: hsl(220, 20%, 15%);
            margin-bottom: 30px;
        }
        
        .book-info {
            background-color: hsl(158, 50%, 95%);
            border-left: 4px solid hsl(158, 61%, 31%);
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        
        .book-info h3 {
            color: hsl(220, 20%, 15%);
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .book-info p {
            color: hsl(220, 20%, 15%);
            margin: 5px 0;
        }
        
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, hsl(158, 61%, 31%) 0%, hsl(158, 61%, 45%) 100%);
            color: hsl(150, 20%, 98%);
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 30px 0;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 2px 4px rgba(158, 61%, 31%, 0.2);
        }
        
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(158, 61%, 31%, 0.3);
        }
        
        .footer {
            background-color: hsl(220, 20%, 15%);
            color: hsl(150, 20%, 98%);
            padding: 30px;
            text-align: center;
        }
        
        .footer-content {
            margin-bottom: 20px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .footer-links a {
            color: hsl(220, 9%, 46%);
            text-decoration: none;
            font-size: 14px;
            transition: color 0.2s ease;
        }
        
        .footer-links a:hover {
            color: hsl(150, 20%, 98%);
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 15px;
        }
        
        .social-links a {
            width: 36px;
            height: 36px;
            background-color: hsl(220, 9%, 46%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: hsl(150, 20%, 98%);
            text-decoration: none;
            font-size: 14px;
            transition: background-color 0.2s ease;
        }
        
        .social-links a:hover {
            background-color: hsl(158, 61%, 31%);
        }
        
        .copyright {
            font-size: 12px;
            color: hsl(220, 9%, 46%);
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid hsl(220, 9%, 46%);
        }
        
        .warning-text {
            color: hsl(38, 92%, 50%);
            font-weight: 500;
        }
        
        .success-text {
            color: hsl(158, 61%, 31%);
            font-weight: 500;
        }
        
        .destructive-text {
            color: hsl(0, 100%, 71%);
            font-weight: 500;
        }
        
        .muted-text {
            color: hsl(220, 9%, 46%);
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .footer {
                padding: 20px;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 10px;
            }
            
            .action-button {
                display: block;
                width: 100%;
            }
            
            .social-links {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">📚 Booklyn</div>
            <div class="tagline">Your Gateway to Knowledge</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            ${userName ? `<h2 class="greeting">Hello ${userName},</h2>` : '<h2 class="greeting">Hello,</h2>'}
            
            <div class="message">
                ${content}
            </div>
            
            ${actionButton ? `
            <div style="text-align: center;">
                <a href="${actionButton.url}" class="action-button">
                    ${actionButton.text}
                </a>
            </div>
            ` : ''}
            
            ${footerText ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 14px; text-align: center;">
                    ${footerText}
                </p>
            </div>
            ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">
                    Booklyn Library
                </div>
                <div class="muted-text">
                    Empowering readers, one book at a time
                </div>
            </div>
            
            <div class="footer-links">
                <a href="#">Browse Books</a>
                <a href="#">My Account</a>
                <a href="#">Contact Us</a>
                <a href="#">Help</a>
            </div>
            
            <div class="social-links">
                <a href="#" title="Facebook">f</a>
                <a href="#" title="Twitter">t</a>
                <a href="#" title="Instagram">i</a>
            </div>
            
            <div class="copyright">
                © 2026 Booklyn Library. All rights reserved.<br>
                <span class="muted-text">This email was sent to you because you have an account with Booklyn Library.</span>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate a book information block for emails
   * @param title - Book title
   * @param author - Book author
   * @param additionalInfo - Additional book information
   * @returns HTML string for book information
   */
  static generateBookInfo(title: string, author: string, additionalInfo?: { [key: string]: string }): string {
    let bookInfo = `
    <div class="book-info">
        <h3>Book Details</h3>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Author:</strong> ${author}</p>
    `;

    if (additionalInfo) {
      Object.entries(additionalInfo).forEach(([key, value]) => {
        bookInfo += `<p><strong>${key}:</strong> ${value}</p>`;
      });
    }

    bookInfo += '</div>';
    return bookInfo;
  }

  /**
   * Generate reservation confirmation email
   * @param userName - User's name
   * @param bookTitle - Book title
   * @param bookAuthor - Book author
   * @param pickupDeadline - When to pick up the book
   * @returns Complete HTML email
   */
  static generateReservationEmail(
    userName: string,
    bookTitle: string,
    bookAuthor: string,
    pickupDeadline: Date
  ): string {
    const content = `
      <p>Great news! Your book reservation has been confirmed successfully.</p>
      
      ${this.generateBookInfo(bookTitle, bookAuthor, {
        'Pickup Deadline': pickupDeadline.toLocaleDateString(),
        'Time': pickupDeadline.toLocaleTimeString()
      })}
      
      <p>Please visit the library to pick up your book before the deadline. Your reservation will expire if not picked up on time.</p>
      
      <p>If you have any questions or need to extend your reservation, feel free to contact our library staff.</p>
    `;

    return this.generateTemplate({
      title: 'Book Reservation Confirmed',
      content,
      userName,
      actionButton: {
        text: 'View My Reservations',
        url: 'https://booklyn.com/reservations'
      },
      footerText: 'This reservation will expire at the specified time. Please arrive 10 minutes early for a smooth pickup process.'
    });
  }

  /**
   * Generate pickup confirmation email
   * @param userName - User's name
   * @param bookTitle - Book title
   * @param bookAuthor - Book author
   * @param dueDate - When the book is due
   * @returns Complete HTML email
   */
  static generatePickupEmail(
    userName: string,
    bookTitle: string,
    bookAuthor: string,
    dueDate: Date
  ): string {
    const content = `
      <p>Excellent! You have successfully picked up your reserved book.</p>
      
      ${this.generateBookInfo(bookTitle, bookAuthor, {
        'Due Date': dueDate.toLocaleDateString(),
        'Return Time': 'Before library closing time'
      })}
      
      <p>Please enjoy reading your book and remember to return it by the due date to avoid late fees.</p>
      
      <p>You can renew your book online or visit the library if you need more time.</p>
    `;

    return this.generateTemplate({
      title: 'Book Pickup Confirmed',
      content,
      userName,
      actionButton: {
        text: 'View My Borrowed Books',
        url: 'https://booklyn.com/borrowed'
      },
      footerText: 'Keep track of your due dates in your account dashboard. Happy reading!'
    });
  }

  /**
   * Generate return confirmation email
   * @param userName - User's name
   * @param bookTitle - Book title
   * @param bookAuthor - Book author
   * @returns Complete HTML email
   */
  static generateReturnEmail(
    userName: string,
    bookTitle: string,
    bookAuthor: string
  ): string {
    const content = `
      <p>Thank you for returning your book! We hope you enjoyed reading it.</p>
      
      ${this.generateBookInfo(bookTitle, bookAuthor)}
      
      <p>Your borrow limit has been restored and you can now reserve more books.</p>
      
      <p>We'd love to hear your feedback about the book. Consider leaving a review to help other readers!</p>
    `;

    return this.generateTemplate({
      title: 'Book Returned Successfully',
      content,
      userName,
      actionButton: {
        text: 'Browse More Books',
        url: 'https://booklyn.com/books'
      },
      footerText: 'Your reading journey continues! Discover your next favorite book today.'
    });
  }
}
