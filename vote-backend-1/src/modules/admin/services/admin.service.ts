import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from "../../../../db";
import { NotificationService } from "../../notifications/notification.service";
import { UserRole } from '@prisma/client/index';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationService,
    ) {
        console.log('Instantiating AdminService');
    }

    async validateAdminAccess(userId: string, requiredRole: UserRole) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, isActive: true },
        });

        if (!user || !user.isActive) {
            throw new ForbiddenException('Access denied');
        }

        //@ts-ignore
        const hasAccess = this.checkRoleHierarchy(user.role, requiredRole);
        if (!hasAccess) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return user;
    }

    private checkRoleHierarchy(userRole: UserRole, requiredRole: UserRole): boolean {
        const hierarchy = {
            [UserRole.SUPER_ADMIN]: 4,
            [UserRole.EC_MEMBER]: 3,
            [UserRole.ADMIN]: 2,
            [UserRole.ASPIRANT]: 2,
            [UserRole.VOTER]: 1,
        };

        return hierarchy[userRole] >= hierarchy[requiredRole];
    }

    async getAdminUsers() {
        return this.prisma.user.findMany({
            where: {
                role: {
                    //@ts-ignore
                    in: [UserRole.SUPER_ADMIN, UserRole.EC_MEMBER, UserRole.ADMIN],
                },
            },
            select: {
                id: true,
                name: true,
                phone: true, // Use phone instead of username
                email: true,
                role: true,
                isActive: true,
                lastLoginAt: true, // Correct field name from your schema
                createdAt: true,
            },
        });
    }

    async logAdminAction(userId: string, action: string, details: any) {
        return this.prisma.auditLog.create({
            data: {
                userId,
                action,
                entity: 'ADMIN_ACTION',
                entityId: userId,
                newValues: details,
                ipAddress: details?.ipAddress || null,
                userAgent: details?.userAgent || null,
            },
        });
    }

    // Additional helper methods for EC member management
    async getEcMembers() {
        return this.prisma.user.findMany({
            where: {
                //@ts-ignore
                role: UserRole.EC_MEMBER,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });
    }

    async updateUserRole(adminId: string, targetUserId: string, newRole: UserRole) {
        // Log the action
        await this.logAdminAction(adminId, 'UPDATE_USER_ROLE', {
            targetUserId,
            newRole,
        });

        return this.prisma.user.update({
            where: { id: targetUserId },
            data: {
                //@ts-ignore
                role: newRole
            },
        });
    }

    async deactivateUser(adminId: string, targetUserId: string) {
        // Log the action
        await this.logAdminAction(adminId, 'DEACTIVATE_USER', {
            targetUserId,
        });

        return this.prisma.user.update({
            where: { id: targetUserId },
            data: { isActive: false },
        });
    }

    async getSystemHealth() {
        const [
            databaseStatus,
            userSystemStatus,
            nominationSystemStatus,
        ] = await Promise.all([
            this.checkDatabaseHealth(),
            this.checkUserSystemHealth(),
            this.checkNominationSystemHealth(),
        ]);

        return {
            database: databaseStatus,
            userSystem: userSystemStatus,
            nominationSystem: nominationSystemStatus,
            overall: databaseStatus && userSystemStatus && nominationSystemStatus,
            timestamp: new Date().toISOString(),
        };
    }

    private async checkDatabaseHealth(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }

    private async checkUserSystemHealth(): Promise<boolean> {
        try {
            await this.prisma.user.count();
            return true;
        } catch {
            return false;
        }
    }

    private async checkNominationSystemHealth(): Promise<boolean> {
        try {
            await this.prisma.nomination.count();
            return true;
        } catch {
            return false;
        }
    }
}