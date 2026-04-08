"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SystemConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const nodemailer = __importStar(require("nodemailer"));
let SystemConfigService = SystemConfigService_1 = class SystemConfigService {
    prisma;
    logger = new common_1.Logger(SystemConfigService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async updateConfig(data) {
        return this.prisma.systemConfig.upsert({
            where: { id: 'default' },
            update: data,
            create: { id: 'default', ...data },
        });
    }
    async sendTestEmail(targetEmail) {
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
        });
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
};
exports.SystemConfigService = SystemConfigService;
exports.SystemConfigService = SystemConfigService = SystemConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemConfigService);
//# sourceMappingURL=system-config.service.js.map