import { PrismaService } from '../prisma/prisma.service';
export declare class DepartmentsController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }[]>;
}
