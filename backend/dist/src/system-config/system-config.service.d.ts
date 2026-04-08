import { PrismaService } from '../prisma/prisma.service';
export declare class SystemConfigService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getConfig(): Promise<{
        id: string;
        smtpHost: string | null;
        smtpPort: number | null;
        smtpUser: string | null;
        smtpPassword: string | null;
        smtpFromName: string | null;
        smtpFromEmail: string | null;
        adEnabled: boolean;
        adHost: string | null;
        adBaseDN: string | null;
    }>;
    updateConfig(data: any): Promise<{
        id: string;
        smtpHost: string | null;
        smtpPort: number | null;
        smtpUser: string | null;
        smtpPassword: string | null;
        smtpFromName: string | null;
        smtpFromEmail: string | null;
        adEnabled: boolean;
        adHost: string | null;
        adBaseDN: string | null;
    }>;
    sendTestEmail(targetEmail: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
