import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('workflow-checks')
@Injectable()
export class WorkflowChecksProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowChecksProcessor.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job: ${job.name}`);

    if (job.name === 'check-overdue') {
      await this.handleOverdueTasks();
    }

    return { processed: true };
  }

  private async handleOverdueTasks() {
    this.logger.log('Checking for overdue tasks...');
    const now = new Date();

    const overdueSteps = await this.prisma.stepInstance.findMany({
      where: {
        status: { not: 'COMPLETED' },
        dueAt: { lt: now },
        isEscalated: false,
      },
      include: {
        step: true,
        workflowInstance: { include: { template: true } },
      },
    });

    this.logger.log(`Found ${overdueSteps.length} overdue steps.`);

    for (const stepInstance of overdueSteps) {
      // Notify the initiator (manager/creator)
      await this.notifications.create(
        stepInstance.workflowInstance.triggeredByUserId,
        'Gecikmiş Görev Uyarısı',
        `"${stepInstance.workflowInstance.template.name}" sürecindeki "${stepInstance.step.name}" adımı hedeflenen süreyi aşmıştır.`,
        stepInstance.workflowInstanceId
      );

      // Mark as escalated to avoid duplicate notifications
      await this.prisma.stepInstance.update({
        where: { id: stepInstance.id },
        data: { isEscalated: true },
      });
    }
  }
}
