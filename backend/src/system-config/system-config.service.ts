import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SystemConfigService {
  private readonly logger = new Logger(SystemConfigService.name);

  constructor(private prisma: PrismaService) {}

  async getConfig() {
    let config = await this.prisma.systemConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: { id: 'default' },
      });
    }

    return config;
  }

  async updateConfig(data: any) {
    return this.prisma.systemConfig.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
  }

  async sendTestEmail(targetEmail: string) {
    const config = await this.getConfig();

    if (!config.smtpHost || !config.smtpFromEmail) {
      throw new Error('SMTP is not fully configured.');
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: config.smtpUser
        ? {
            user: config.smtpUser,
            pass: config.smtpPassword,
          }
        : undefined,
    } as any);

    await transporter.sendMail({
      from: `"${config.smtpFromName || 'GWS System'}" <${config.smtpFromEmail}>`,
      to: targetEmail,
      subject: 'GWS Sistem Test Maili',
      text: 'Bu bir test e-postasıdır. Eğer bu mesajı alıyorsanız SMTP ayarlarınız doğru yapılandırılmış demektir.',
      html: `
        <h3>GWS Sistem Test Maili</h3>
        <p>Bu bir test e-postasıdır. Eğer bu mesajı alıyorsanız SMTP ayarlarınız doğru yapılandırılmış demektir.</p>
        <p><strong>Zaman:</strong> ${new Date().toLocaleString('tr-TR')}</p>
      `,
    });

    return { success: true, message: `Email sent to ${targetEmail}` };
  }
}
