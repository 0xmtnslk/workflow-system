import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, title: string, message: string, relatedInstanceId?: string) {
    // 1. Create In-App Notification
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        relatedInstanceId,
        type: NotificationType.IN_APP,
      },
    });

    // 2. Check if Email is also needed (based on user prefs or global config)
    // For this implementation, we try to send email if SMTP is configured.
    await this.sendEmailIfConfigured(userId, title, message);

    return notification;
  }

  async sendToDepartment(departmentId: string, title: string, message: string, relatedInstanceId?: string) {
    const users = await this.prisma.user.findMany({
      where: { departmentId },
    });

    for (const user of users) {
      await this.create(user.id, title, message, relatedInstanceId);
    }
  }

  private async sendEmailIfConfigured(userId: string, title: string, message: string) {
    try {
      const [user, config] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.systemConfig.findUnique({ where: { id: 'default' } }),
      ]);

      if (!user || !config || !config.smtpHost || !config.smtpFromEmail) {
        this.logger.debug(`Email not sent to ${userId}: SMTP not configured or user not found.`);
        return;
      }

      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: config.smtpUser ? {
          user: config.smtpUser,
          pass: config.smtpPassword,
        } : undefined,
      } as any);

      await transporter.sendMail({
        from: `"${config.smtpFromName || 'GWS System'}" <${config.smtpFromEmail}>`,
        to: user.email,
        subject: title,
        text: message,
        html: `<p>${message}</p>`,
      });

      this.logger.log(`Email sent successfully to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to user ${userId}: ${error.message}`);
    }
  }
}
