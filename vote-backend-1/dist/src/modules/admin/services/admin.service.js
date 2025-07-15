"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
const notification_service_1 = require("../../notifications/notification.service");
const index_1 = require("@prisma/client/index");
let AdminService = class AdminService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        console.log('Instantiating AdminService');
    }
    async validateAdminAccess(userId, requiredRole) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, isActive: true },
        });
        if (!user || !user.isActive) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const hasAccess = this.checkRoleHierarchy(user.role, requiredRole);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
        return user;
    }
    checkRoleHierarchy(userRole, requiredRole) {
        const hierarchy = {
            [index_1.UserRole.SUPER_ADMIN]: 4,
            [index_1.UserRole.EC_MEMBER]: 3,
            [index_1.UserRole.ADMIN]: 2,
            [index_1.UserRole.ASPIRANT]: 2,
            [index_1.UserRole.VOTER]: 1,
        };
        return hierarchy[userRole] >= hierarchy[requiredRole];
    }
    async getAdminUsers() {
        return this.prisma.user.findMany({
            where: {
                role: {
                    in: [index_1.UserRole.SUPER_ADMIN, index_1.UserRole.EC_MEMBER, index_1.UserRole.ADMIN],
                },
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });
    }
    async logAdminAction(userId, action, details) {
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
    async getEcMembers() {
        return this.prisma.user.findMany({
            where: {
                role: index_1.UserRole.EC_MEMBER,
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
    async updateUserRole(adminId, targetUserId, newRole) {
        await this.logAdminAction(adminId, 'UPDATE_USER_ROLE', {
            targetUserId,
            newRole,
        });
        return this.prisma.user.update({
            where: { id: targetUserId },
            data: {
                role: newRole
            },
        });
    }
    async deactivateUser(adminId, targetUserId) {
        await this.logAdminAction(adminId, 'DEACTIVATE_USER', {
            targetUserId,
        });
        return this.prisma.user.update({
            where: { id: targetUserId },
            data: { isActive: false },
        });
    }
    async getSystemHealth() {
        const [databaseStatus, userSystemStatus, nominationSystemStatus,] = await Promise.all([
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
    async checkDatabaseHealth() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch {
            return false;
        }
    }
    async checkUserSystemHealth() {
        try {
            await this.prisma.user.count();
            return true;
        }
        catch {
            return false;
        }
    }
    async checkNominationSystemHealth() {
        try {
            await this.prisma.nomination.count();
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        notification_service_1.NotificationService])
], AdminService);
//# sourceMappingURL=admin.service.js.map