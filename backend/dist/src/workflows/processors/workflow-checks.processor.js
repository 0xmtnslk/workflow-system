"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkflowChecksProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowChecksProcessor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const bullmq_1 = require("@nestjs/bullmq");
let WorkflowChecksProcessor = WorkflowChecksProcessor_1 = class WorkflowChecksProcessor extends bullmq_1.WorkerHost {
    prisma;
    notifications;
    logger = new common_1.Logger(WorkflowChecksProcessor_1.name);
    constructor(prisma, notifications) {
        super();
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async process(job) {
        this.logger.log(`Processing job: ${job.name}`);
        if (job.name === 'check-overdue') {
            await this.handleOverdueTasks();
        }
        return { processed: true };
    }
    async handleOverdueTasks() {
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
            await this.notifications.create(stepInstance.workflowInstance.triggeredByUserId, 'Gecikmiş Görev Uyarısı', `"${stepInstance.workflowInstance.template.name}" sürecindeki "${stepInstance.step.name}" adımı hedeflenen süreyi aşmıştır.`, stepInstance.workflowInstanceId);
            await this.prisma.stepInstance.update({
                where: { id: stepInstance.id },
                data: { isEscalated: true },
            });
        }
    }
};
exports.WorkflowChecksProcessor = WorkflowChecksProcessor;
exports.WorkflowChecksProcessor = WorkflowChecksProcessor = WorkflowChecksProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('workflow-checks'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], WorkflowChecksProcessor);
//# sourceMappingURL=workflow-checks.processor.js.map