import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOneByEmail(email: string): Promise<User | null>;
    findOneById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    create(data: {
        name: string;
        email: string;
        passwordHash: string;
        role?: Role;
        departmentId?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        departmentId: string | null;
        adUsername: string | null;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: {
        name?: string;
        role?: Role;
        departmentId?: string | null;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        departmentId: string | null;
        adUsername: string | null;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    resetPassword(id: string, newPassword: string): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        departmentId: string | null;
        adUsername: string | null;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changeOwnPassword(id: string, newPassword: string): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        departmentId: string | null;
        adUsername: string | null;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
