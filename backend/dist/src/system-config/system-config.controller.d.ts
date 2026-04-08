import { SystemConfigService } from './system-config.service';
export declare class SystemConfigController {
    private readonly systemConfigService;
    constructor(systemConfigService: SystemConfigService);
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
    sendTestEmail(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
