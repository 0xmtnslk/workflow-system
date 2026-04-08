import { WorkflowInstanceService } from './workflow-instance.service';
export declare class WorkflowInstanceController {
    private readonly service;
    constructor(service: WorkflowInstanceService);
    start(req: any, data: {
        templateId: string;
        parameters: any;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InstanceStatus;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
        startedAt: Date;
        completedAt: Date | null;
        templateId: string;
        triggeredByUserId: string;
    }>;
    findAll(req: any): Promise<({
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
    getMyTasks(req: any): Promise<({
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
    claim(req: any, id: string): Promise<{
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
    unassign(req: any, id: string): Promise<{
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
    complete(req: any, id: string, body: {
        responses: any[];
    }): Promise<{
        success: boolean;
    }>;
}
