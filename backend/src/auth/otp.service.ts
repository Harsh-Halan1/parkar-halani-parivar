import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeEmailService();
  }

  private initializeEmailService() {
    const emailService = this.configService.get('EMAIL_SERVICE') || 'gmail';
    const emailUser = this.configService.get('EMAIL_USER');
    const emailPassword = this.configService.get('EMAIL_PASSWORD');

    if (!emailUser || !emailPassword) {
      this.logger.warn('Email service not configured - OTP emails will not be sent');
      return;
    }

    // Configure transporter based on service
    if (emailService === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword, // Use app password for Gmail
        },
      });
    } else if (emailService === 'sendgrid') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: emailPassword, // SendGrid API key
        },
      });
    } else {
      // Custom SMTP
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: this.configService.get('SMTP_PORT'),
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
    }
  }

  /**
   * Generate a 6-digit OTP code
   */
  generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate OTP with expiry time
   */
  generateOtpWithExpiry(expiryMinutes: number = 10) {
    return {
      otpCode: this.generateOtpCode(),
      otpExpiry: new Date(Date.now() + expiryMinutes * 60 * 1000),
    };
  }

  /**
   * Check if OTP has expired
   */
  isOtpExpired(expiryTime: Date): boolean {
    return new Date() > expiryTime;
  }

  /**
   * Send OTP via email
   */
  async sendOtpViaEmail(email: string, otpCode: string, recipientName?: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`OTP ${otpCode} for ${email} - Email service not configured`);
      return true; // Return true to allow testing without actual email
    }

    try {
      const mailOptions = {
        from: this.configService.get('EMAIL_FROM') || this.configService.get('EMAIL_USER'),
        to: email,
        subject: 'Your OTP for Parakar Halani Parivar Registration',
        html: this.generateEmailTemplate(otpCode, recipientName),
        text: `Your OTP is: ${otpCode}. This code will expire in 10 minutes.`,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send OTP via SMS (placeholder for SMS service integration)
   */
  async sendOtpViaSms(phone: string, otpCode: string): Promise<boolean> {
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    this.logger.log(`SMS OTP ${otpCode} for ${phone} - SMS service not yet implemented`);
    return true;
  }

  /**
   * Generate email template for OTP
   */
  private generateEmailTemplate(otpCode: string, recipientName?: string): string {
    const name = recipientName || 'User';
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 4px; color: #3b82f6; font-family: 'Courier New', monospace; }
            .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }
            .warning { color: #dc2626; font-size: 14px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Parakar Halani Parivar</h1>
              <p>One-Time Password Verification</p>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Thank you for registering with Parakar Halani Parivar. To complete your registration, please use the following One-Time Password (OTP):</p>
              
              <div class="otp-box">
                <div class="otp-code">${otpCode}</div>
              </div>
              
              <p><strong>Important Security Information:</strong></p>
              <ul>
                <li>This OTP will expire in <strong>10 minutes</strong></li>
                <li>Never share this code with anyone</li>
                <li>Parakar Halani Parivar team will never ask for your OTP</li>
              </ul>
              
              <div class="warning">
                <p>If you did not request this code, please ignore this email or contact support immediately.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2024 Parakar Halani Parivar. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
