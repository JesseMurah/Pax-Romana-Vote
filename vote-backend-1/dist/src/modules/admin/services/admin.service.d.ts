import { PrismaService } from "../../../../db";
import { NotificationService } from "../../notifications/notification.service";
import { UserRole } from '@prisma/client/index';
export declare class AdminService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationService);
    validateAdminAccess(userId: string, requiredRole: UserRole): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
    private checkRoleHierarchy;
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
    logAdminAction(userId: string, action: string, details: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        entity: string;
        entityId: string | null;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    getEcMembers(): Promise<{
        name: string;
        phone: string | null;
        email: string;
        id: string;
        lastLoginAt: Date | null;
        createdAt: Date;
    }[]>;
    updateUserRole(adminId: string, targetUserId: string, newRole: UserRole): Promise<{
        subgroup: string | null;
        programme: string | null;
        name: string;
        phone: string | null;
        email: string;
        password: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        level: string | null;
        college: string | null;
        phoneVerified: boolean;
        emailVerified: boolean;
        isActive: boolean;
        inkVerified: boolean;
        id: string;
        hasVoted: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        subgroupId: string | null;
    }>;
    deactivateUser(adminId: string, targetUserId: string): Promise<{
        subgroup: string | null;
        programme: string | null;
        name: string;
        phone: string | null;
        email: string;
        password: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        level: string | null;
        college: string | null;
        phoneVerified: boolean;
        emailVerified: boolean;
        isActive: boolean;
        inkVerified: boolean;
        id: string;
        hasVoted: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        subgroupId: string | null;
    }>;
    getSystemHealth(): Promise<{
        database: boolean;
        userSystem: boolean;
        nominationSystem: boolean;
        overall: boolean;
        timestamp: string;
    }>;
    private checkDatabaseHealth;
    private checkUserSystemHealth;
    private checkNominationSystemHealth;
}
