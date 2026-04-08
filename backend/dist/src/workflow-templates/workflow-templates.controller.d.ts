import { WorkflowTemplatesService } from './workflow-templates.service';
import { TemplateStatus } from '@prisma/client';
export declare class WorkflowTemplatesController {
    private readonly service;
    constructor(service: WorkflowTemplatesService);
    findAll(status?: TemplateStatus): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.TemplateStatus;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(id: string): Promise<{
        steps: ({
            dependsOn: {
                id: string;
                name: string;
                workflowTemplateId: string;
                order: number;
                duration: number;
                isParallel: boolean;
                assignedDepartmentId: string | null;
                positionX: number | null;
                positionY: number | null;
            }[];
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
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.TemplateStatus;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    save(data: any): Promise<{
        steps: ({
            dependsOn: {
                id: string;
                name: string;
                workflowTemplateId: string;
                order: number;
                duration: number;
                isParallel: boolean;
                assignedDepartmentId: string | null;
                positionX: number | null;
                positionY: number | null;
            }[];
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
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.TemplateStatus;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.TemplateStatus;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
