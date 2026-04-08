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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const nodemailer = __importStar(require("nodemailer"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, title, message, relatedInstanceId) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                relatedInstanceId,
                type: client_1.NotificationType.IN_APP,
            },
        });
        await this.sendEmailIfConfigured(userId, title, message);
        return notification;
    }
    async sendToDepartment(departmentId, title, message, relatedInstanceId) {
        const users = await this.prisma.user.findMany({
            where: { departmentId },
        });
        for (const user of users) {
            await this.create(user.id, title, message, relatedInstanceId);
        }
    }
    async sendEmailIfConfigured(userId, title, message) {
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
            });
            await transporter.sendMail({
                from: `"${config.smtpFromName || 'GWS System'}" <${config.smtpFromEmail}>`,
                to: user.email,
                subject: title,
                text: message,
                html: `<p>${message}</p>`,
            });
            this.logger.log(`Email sent successfully to ${user.email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to user ${userId}: ${error.message}`);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map