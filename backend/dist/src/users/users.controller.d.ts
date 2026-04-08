import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
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
    }[]>;
    create(data: any): Promise<{
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
    update(id: string, data: any): Promise<{
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
    resetPassword(id: string, password: string): Promise<{
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
    changeOwnPassword(req: any, password: string): Promise<{
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
    getMe(req: any): Promise<{
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
    } | null>;
}
