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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkflowTemplatesService = class WorkflowTemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(status) {
        return this.prisma.workflowTemplate.findMany({
            where: status ? { status } : {},
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(id) {
        const template = await this.prisma.workflowTemplate.findUnique({
            where: { id },
            include: {
                steps: {
                    include: {
                        tasks: {
                            orderBy: { order: 'asc' },
                        },
                        dependsOn: true,
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException('Şablon bulunamadı');
        }
        return template;
    }
    async saveTemplate(data) {
        const { id, name, description, status, steps, parameters } = data;
        return this.prisma.$transaction(async (tx) => {
            let template;
            if (id && id !== 'new') {
                template = await tx.workflowTemplate.update({
                    where: { id },
                    data: { name, description, status, parameters },
                });
                await tx.step.deleteMany({ where: { workflowTemplateId: id } });
            }
            else {
                template = await tx.workflowTemplate.create({
                    data: { name, description, status, parameters },
                });
            }
            const idMap = new Map();
            for (const stepData of steps) {
                const newStep = await tx.step.create({
                    data: {
                        workflowTemplateId: template.id,
                        name: stepData.name,
                        order: stepData.order,
                        duration: stepData.duration || 1,
                        assignedDepartmentId: stepData.assignedDepartmentId,
                        positionX: stepData.positionX,
                        positionY: stepData.positionY,
                        tasks: {
                            create: stepData.tasks?.map((t) => ({
                                label: t.label,
                                type: t.type,
                                order: t.order,
                                isRequired: t.isRequired ?? true,
                            })),
                        },
                    },
                });
                idMap.set(stepData.id, newStep.id);
            }
            for (const stepData of steps) {
                if (stepData.dependencies && stepData.dependencies.length > 0) {
                    const targetStepId = idMap.get(stepData.id);
                    for (const depId of stepData.dependencies) {
                        const sourceStepId = idMap.get(depId);
                        if (sourceStepId && targetStepId) {
                            await tx.step.update({
                                where: { id: targetStepId },
                                data: {
                                    dependsOn: {
                                        connect: { id: sourceStepId },
                                    },
                                },
                            });
                        }
                    }
                }
            }
            return this.findOne(template.id);
        });
    }
    async delete(id) {
        return this.prisma.workflowTemplate.delete({
            where: { id },
        });
    }
};
exports.WorkflowTemplatesService = WorkflowTemplatesService;
exports.WorkflowTemplatesService = WorkflowTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowTemplatesService);
//# sourceMappingURL=workflow-templates.service.js.map