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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WorkflowInstanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowInstanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let WorkflowInstanceService = WorkflowInstanceService_1 = class WorkflowInstanceService {
    prisma;
    notifications;
    checksQueue;
    logger = new common_1.Logger(WorkflowInstanceService_1.name);
    constructor(prisma, notifications, checksQueue) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.checksQueue = checksQueue;
    }
    async onModuleInit() {
        await this.checksQueue.add('check-overdue', {}, {
            repeat: {
                pattern: '0 * * * *',
            },
        });
        this.logger.log('Repeatable job "check-overdue" scheduled.');
    }
    async instantiate(templateId, userId, parameters) {
        const template = await this.prisma.workflowTemplate.findUnique({
            where: { id: templateId, status: 'ACTIVE' },
            include: { steps: { include: { dependsOn: true } } },
        });
        if (!template) {
            throw new common_1.NotFoundException('Aktif şablon bulunamadı');
        }
        return this.prisma.$transaction(async (tx) => {
            const instance = await tx.workflowInstance.create({
                data: {
                    templateId,
                    triggeredByUserId: userId,
                    parameters,
                    status: client_1.InstanceStatus.RUNNING,
                },
            });
            const initialSteps = template.steps.filter(s => s.dependsOn.length === 0);
            for (const step of initialSteps) {
                const dueAt = new Date();
                dueAt.setDate(dueAt.getDate() + (step.duration || 1));
                await tx.stepInstance.create({
                    data: {
                        workflowInstanceId: instance.id,
                        stepId: step.id,
                        status: client_1.StepStatus.IN_PROGRESS,
                        dueAt,
                    },
                });
                if (step.assignedDepartmentId) {
                    await this.notifications.sendToDepartment(step.assignedDepartmentId, 'Yeni Görev', `"${template.name}" süreci için yeni bir görev ("${step.name}") biriminize atandı.`, instance.id);
                }
            }
            return instance;
        });
    }
    async findAll(userId) {
        return this.prisma.workflowInstance.findMany({
            where: userId ? { triggeredByUserId: userId } : {},
            include: {
                template: true,
                triggeredBy: { select: { name: true, email: true } },
            },
            orderBy: { startedAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.workflowInstance.findUnique({
            where: { id },
            include: {
                template: true,
                triggeredBy: { select: { name: true, email: true } },
                stepInstances: {
                    include: {
                        step: true,
                        assignedUser: { select: { name: true } },
                        taskResponses: {
                            include: {
                                task: true,
                                respondedBy: { select: { name: true } }
                            }
                        }
                    },
                    orderBy: { startedAt: 'asc' }
                }
            }
        });
    }
    async getMyTasks(userId) {
        if (!userId) {
            throw new common_1.BadRequestException('Kullanıcı kimliği eksik.');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Kullanıcı bulunamadı');
        return this.prisma.stepInstance.findMany({
            where: {
                status: { in: [client_1.StepStatus.WAITING, client_1.StepStatus.IN_PROGRESS] },
                OR: [
                    { assignedUserId: userId },
                    {
                        assignedUserId: null,
                        step: { assignedDepartmentId: user.departmentId }
                    }
                ]
            },
            include: {
                workflowInstance: {
                    include: { template: true, triggeredBy: { select: { name: true } } }
                },
                step: {
                    include: { tasks: { orderBy: { order: 'asc' } } }
                }
            },
            orderBy: { dueAt: 'asc' }
        });
    }
    async claimTask(stepInstanceId, userId) {
        const stepInstance = await this.prisma.stepInstance.findUnique({
            where: { id: stepInstanceId },
            include: { step: true }
        });
        if (!stepInstance)
            throw new common_1.NotFoundException('Görev bulunamadı');
        if (stepInstance.assignedUserId)
            throw new common_1.BadRequestException('Bu görev zaten bir başkası tarafından üstlenilmiş');
        return this.prisma.stepInstance.update({
            where: { id: stepInstanceId },
            data: {
                assignedUserId: userId,
                status: client_1.StepStatus.IN_PROGRESS,
                startedAt: new Date()
            }
        });
    }
    async unassignTask(stepInstanceId, userId) {
        const stepInstance = await this.prisma.stepInstance.findUnique({
            where: { id: stepInstanceId }
        });
        if (!stepInstance)
            throw new common_1.NotFoundException('Görev bulunamadı');
        if (stepInstance.assignedUserId !== userId)
            throw new common_1.BadRequestException('Sadece görevi üstlenen kişi işlemi geri alabilir');
        return this.prisma.stepInstance.update({
            where: { id: stepInstanceId },
            data: { assignedUserId: null }
        });
    }
    async completeStep(stepInstanceId, userId, responses) {
        return this.prisma.$transaction(async (tx) => {
            const stepInstance = await tx.stepInstance.findUnique({
                where: { id: stepInstanceId },
                include: {
                    step: { include: { tasks: true } },
                    workflowInstance: { include: { template: true } }
                }
            });
            if (!stepInstance)
                throw new common_1.NotFoundException('Görev bulunamadı');
            if (stepInstance.assignedUserId !== userId)
                throw new common_1.BadRequestException('Görevi tamamlamak için önce üstlenmeniz gerekir');
            if (stepInstance.status === client_1.StepStatus.COMPLETED)
                throw new common_1.BadRequestException('Görev zaten tamamlanmış');
            for (const resp of responses) {
                await tx.taskResponse.create({
                    data: {
                        stepInstanceId,
                        taskId: resp.taskId,
                        responseValue: resp.value,
                        respondedByUserId: userId
                    }
                });
            }
            await tx.stepInstance.update({
                where: { id: stepInstanceId },
                data: {
                    status: client_1.StepStatus.COMPLETED,
                    completedAt: new Date()
                }
            });
            const successors = await tx.step.findMany({
                where: { dependsOn: { some: { id: stepInstance.stepId } } },
                include: { dependsOn: true }
            });
            for (const successor of successors) {
                const dependencies = successor.dependsOn;
                const depIds = dependencies.map(d => d.id);
                const completedDepsCount = await tx.stepInstance.count({
                    where: {
                        workflowInstanceId: stepInstance.workflowInstanceId,
                        stepId: { in: depIds },
                        status: client_1.StepStatus.COMPLETED
                    }
                });
                if (completedDepsCount === depIds.length) {
                    const dueAt = new Date();
                    dueAt.setDate(dueAt.getDate() + (successor.duration || 1));
                    await tx.stepInstance.create({
                        data: {
                            workflowInstanceId: stepInstance.workflowInstanceId,
                            stepId: successor.id,
                            status: client_1.StepStatus.IN_PROGRESS,
                            dueAt
                        }
                    });
                    if (successor.assignedDepartmentId) {
                        await this.notifications.sendToDepartment(successor.assignedDepartmentId, 'Yeni Görev', `"${stepInstance.workflowInstance.template.name}" süreci için yeni bir görev ("${successor.name}") biriminize atandı.`, stepInstance.workflowInstanceId);
                    }
                }
            }
            const pendingSteps = await tx.stepInstance.count({
                where: {
                    workflowInstanceId: stepInstance.workflowInstanceId,
                    status: { not: client_1.StepStatus.COMPLETED }
                }
            });
            if (pendingSteps === 0) {
                await tx.workflowInstance.update({
                    where: { id: stepInstance.workflowInstanceId },
                    data: {
                        status: client_1.InstanceStatus.COMPLETED,
                        completedAt: new Date()
                    }
                });
                await this.notifications.create(stepInstance.workflowInstance.triggeredByUserId, 'Süreç Tamamlandı', `"${stepInstance.workflowInstance.template.name}" süreci başarıyla tamamlanmıştır.`, stepInstance.workflowInstanceId);
            }
            return { success: true };
        });
    }
};
exports.WorkflowInstanceService = WorkflowInstanceService;
exports.WorkflowInstanceService = WorkflowInstanceService = WorkflowInstanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('workflow-checks')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        bullmq_2.Queue])
], WorkflowInstanceService);
//# sourceMappingURL=workflow-instance.service.js.map