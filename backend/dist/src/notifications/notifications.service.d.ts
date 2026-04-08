import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: string, title: string, message: string, relatedInstanceId?: string): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        isRead: boolean;
        relatedInstanceId: string | null;
        userId: string;
    }>;
    sendToDepartment(departmentId: string, title: string, message: string, relatedInstanceId?: string): Promise<void>;
    private sendEmailIfConfigured;
}
