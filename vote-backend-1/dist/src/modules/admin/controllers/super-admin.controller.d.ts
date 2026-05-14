import { AdminService } from "../services/admin.service";
import { UsersService } from "../../users/users.service";
import { UserRole } from '@prisma/client/index';
import { CreateAdminDTO } from "../../users/dto/create-admin.dto";
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        role: UserRole;
        name: string;
    };
}
export declare class SuperAdminController {
    private adminService;
    private userService;
    constructor(adminService: AdminService, userService: UsersService);
    getAdminUsers(): Promise<{
        name: string;
        phone: string | null;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        id: string;
        lastLoginAt: Date | null;
        createdAt: Date;
    }[]>;
    createAdmin(createAdminDto: CreateAdminDTO, req: AuthenticatedRequest): Promise<{
        subgroup: string | null;
        programme: string | null;
        level: string | null;
        name: string;
        phone: string | null;
        email: string;
        password: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        college: string | null;
        phoneVerified: boolean;
        emailVerified: boolean;
        isActive: boolean;
        inkVerified: boolean;
        id: string;
        hasVoted: boolean;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        subgroupId: string | null;
    }>;
    updateUserStatus(userId: string, { isActive }: {
        isActive: boolean;
    }, req: AuthenticatedRequest): Promise<{
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        id: string;
        updatedAt: Date;
    }>;
    getSystemHealth(): Promise<{
        database: boolean;
        userSystem: boolean;
        nominationSystem: boolean;
        overall: boolean;
        timestamp: string;
    }>;
}
export {};
