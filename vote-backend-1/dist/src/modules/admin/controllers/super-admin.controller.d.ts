import { AdminService } from "../services/admin.service";
import { UsersService } from "../../users/users.service";
import { CreateAdminDTO } from "../../users/dto/create-admin.dto";
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
    createAdmin(createAdminDto: CreateAdminDTO, req: any): Promise<import("../../users/interfaces/user.interface").IUser>;
    updateUserStatus(userId: string, { isActive }: {
        isActive: boolean;
    }, req: any): Promise<{
        name: string;
        phone: string | null;
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
