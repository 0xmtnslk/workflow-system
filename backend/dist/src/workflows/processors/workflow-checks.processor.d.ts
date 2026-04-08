import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
export declare class WorkflowChecksProcessor extends WorkerHost {
    private prisma;
    private notifications;
    private readonly logger;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    process(job: Job<any, any, string>): Promise<any>;
    private handleOverdueTasks;
}
