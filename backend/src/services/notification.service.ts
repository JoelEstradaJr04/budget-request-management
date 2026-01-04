// src/services/notification.service.ts
import { prisma } from '../config/database';
import nodemailer from 'nodemailer';
import { SMTP_CONFIG, FRONTEND_URL } from '../config/constants';

const transporter = nodemailer.createTransport({
  host: SMTP_CONFIG.HOST,
  port: SMTP_CONFIG.PORT,
  secure: false,
  auth: SMTP_CONFIG.USER && SMTP_CONFIG.PASSWORD ? {
    user: SMTP_CONFIG.USER,
    pass: SMTP_CONFIG.PASSWORD
  } : undefined
});

class NotificationService {
  async notifyAdminsNewRequest(budgetRequest: any) {
    const subject = `New Budget Request: ${budgetRequest.request_code || budgetRequest.requestCode}`;
    const message = `A new budget request has been submitted. Request Code: ${budgetRequest.request_code || budgetRequest.requestCode}. Please review.`;

    // Get department admins (by department_id)
    const admins = await this.getDepartmentAdmins(budgetRequest.department_id || budgetRequest.department);

    // Send emails to admins (no DB notifications table in schema)
    await Promise.all(
      admins.map(admin => this.sendEmail(admin.email, subject, message))
    );
  }

  async notifyRequestApproved(budgetRequest: any) {
    const subject = `Budget Request Approved: ${budgetRequest.request_code || budgetRequest.requestCode}`;
    const message = `Your budget request has been approved. Request Code: ${budgetRequest.request_code || budgetRequest.requestCode}`;

    // Send to requester if email present
    const recipientEmail = budgetRequest.requested_for_email || budgetRequest.requestedByEmail || '';
    if (recipientEmail) await this.sendEmail(recipientEmail, subject, message);
  }

  async notifyRequestRejected(budgetRequest: any) {
    const subject = `Budget Request Rejected: ${budgetRequest.request_code || budgetRequest.requestCode}`;
    const message = `Your budget request has been rejected. Request Code: ${budgetRequest.request_code || budgetRequest.requestCode}. Reason: ${budgetRequest.rejection_reason || ''}`;

    const recipientEmail = budgetRequest.requested_for_email || budgetRequest.requestedByEmail || '';
    if (recipientEmail) await this.sendEmail(recipientEmail, subject, message);
  }

  private async sendEmail(to: string, subject: string, text: string) {
    try {
      if (SMTP_CONFIG.USER && to) {
        await transporter.sendMail({ from: SMTP_CONFIG.USER, to, subject, text });
      } else {
        // If mail not configured, just log
        console.info('Email not sent (SMTP not configured).', { to, subject });
      }
    } catch (err: any) {
      console.error('Failed to send notification email:', err.message);
    }
  }

  private async getDepartmentAdmins(department: string) {
    // This would query your user management system
    // For now, return mock data
    return [
      {
        id: 'admin-1',
        name: 'Finance Admin',
        email: 'finance.admin@example.com'
      }
    ];
  }
}

export default new NotificationService();
