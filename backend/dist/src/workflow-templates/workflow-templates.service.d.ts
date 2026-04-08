import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TemplateStatus } from '@prisma/client';
export declare class WorkflowTemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(status?: TemplateStatus): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.TemplateStatus;
        parameters: Prisma.JsonValue | null;
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
        parameters: Prisma.JsonValue | null;
    }>;
    saveTemplate(data: any): Promise<{
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
        parameters: Prisma.JsonValue | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.TemplateStatus;
        parameters: Prisma.JsonValue | null;
    }>;
}
