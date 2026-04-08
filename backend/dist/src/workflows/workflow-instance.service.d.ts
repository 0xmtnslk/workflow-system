import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Queue } from 'bullmq';
export declare class WorkflowInstanceService implements OnModuleInit {
    private prisma;
    private notifications;
    private readonly checksQueue;
    private readonly logger;
    constructor(prisma: PrismaService, notifications: NotificationsService, checksQueue: Queue);
    onModuleInit(): Promise<void>;
    instantiate(templateId: string, userId: string, parameters: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InstanceStatus;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
        startedAt: Date;
        completedAt: Date | null;
        templateId: string;
        triggeredByUserId: string;
    }>;
    findAll(userId?: string): Promise<({
        template: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import(".prisma/client").$Enums.TemplateStatus;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
        };
        triggeredBy: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InstanceStatus;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
        startedAt: Date;
        completedAt: Date | null;
        templateId: string;
        triggeredByUserId: string;
    })[]>;
    findOne(id: string): Promise<({
        stepInstances: ({
            step: {
                id: string;
                name: string;
                workflowTemplateId: string;
                order: number;
                duration: number;
                isParallel: boolean;
                assignedDepartmentId: string | null;
                positionX: number | null;
                positionY: number | null;
            };
            assignedUser: {
                name: string;
            } | null;
            taskResponses: ({
                task: {
                    id: string;
                    type: import(".prisma/client").$Enums.TaskType;
                    stepId: string;
                    order: number;
                    label: string;
                    isRequired: boolean;
                    fileTypes: string | null;
                };
                respondedBy: {
                    name: string;
                };
            } & {
                id: string;
                responseValue: import("@prisma/client/runtime/library").JsonValue | null;
                respondedAt: Date;
                stepInstanceId: string;
                taskId: string;
                respondedByUserId: string;
            })[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.StepStatus;
            startedAt: Date | null;
            completedAt: Date | null;
            workflowInstanceId: string;
            stepId: string;
            assignedUserId: string | null;
            dueAt: Date | null;
            isEscalated: boolean;
        })[];
        template: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import(".prisma/client").$Enums.TemplateStatus;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
        };
        triggeredBy: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InstanceStatus;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
        startedAt: Date;
        completedAt: Date | null;
        templateId: string;
        triggeredByUserId: string;
    }) | null>;
    getMyTasks(userId: string): Promise<({
        step: {
            tasks: {
                id: string;
                type: import(".prisma/client").$Enums.TaskType;
                stepId: string;
                order: number;
                label: string;
                isRequired: boolean;
                fileTypes: string | null;
            }[];
        } & {
            id: string;
            name: string;
            workflowTemplateId: string;
            order: number;
            duration: number;
            isParallel: boolean;
            assignedDepartmentId: string | null;
            positionX: number | null;
            positionY: number | null;
        };
        workflowInstance: {
            template: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                status: import(".prisma/client").$Enums.TemplateStatus;
                parameters: import("@prisma/client/runtime/library").JsonValue | null;
            };
            triggeredBy: {
                name: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.InstanceStatus;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
            startedAt: Date;
            completedAt: Date | null;
            templateId: string;
            triggeredByUserId: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.StepStatus;
        startedAt: Date | null;
        completedAt: Date | null;
        workflowInstanceId: string;
        stepId: string;
        assignedUserId: string | null;
        dueAt: Date | null;
        isEscalated: boolean;
    })[]>;
    claimTask(stepInstanceId: string, userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StepStatus;
        startedAt: Date | null;
        completedAt: Date | null;
        workflowInstanceId: string;
        stepId: string;
        assignedUserId: string | null;
        dueAt: Date | null;
        isEscalated: boolean;
    }>;
    unassignTask(stepInstanceId: string, userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StepStatus;
        startedAt: Date | null;
        completedAt: Date | null;
        workflowInstanceId: string;
        stepId: string;
        assignedUserId: string | null;
        dueAt: Date | null;
        isEscalated: boolean;
    }>;
    completeStep(stepInstanceId: string, userId: string, responses: any[]): Promise<{
        success: boolean;
    }>;
}
