"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardService = void 0;
const index_1 = require("@prisma/client/index");
class AdminDashboardService {
    prisma;
    deadlineService;
    constructor(prisma, deadlineService) {
        this.prisma = prisma;
        this.deadlineService = deadlineService;
    }
    async getDashboardData() {
        const [totalNominations, pendingReview, approved, rejected, awaitingVerification, recentActivity,] = await Promise.all([
            this.prisma.nomination.count(),
            this.prisma.nomination.count({ where: {
                    status: index_1.NominationStatus.UNDER_REVIEW
                } }),
            this.prisma.nomination.count({ where: { status: index_1.NominationStatus.APPROVED } }),
            this.prisma.nomination.count({ where: { status: index_1.NominationStatus.REJECTED } }),
            this.prisma.nomination.count({ where: {
                    status: index_1.NominationStatus.AWAITING_VERIFICATION
                } }),
            this.getRecentActivity(),
        ]);
        const deadlineInfo = {
            timeRemaining: this.deadlineService.getTimeRemaining(),
            isInGracePeriod: this.deadlineService.isInGracePeriod(),
        };
        return {
            totalNominations,
            pendingReview,
            approved,
            rejected,
            awaitingVerification,
            deadlineInfo,
            recentActivity,
        };
    }
    async getRecentActivity() {
        return this.prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
            },
        });
    }
    async getSystemHealth() {
        const [databaseStatus, nominationSystemStatus, deadlineStatus,] = await Promise.all([
            this.checkDatabaseHealth(),
            this.checkNominationSystemHealth(),
            this.checkDeadlineStatus(),
        ]);
        return {
            database: databaseStatus,
            nominationSystem: nominationSystemStatus,
            deadline: deadlineStatus,
            overall: databaseStatus && nominationSystemStatus && deadlineStatus,
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
    async checkNominationSystemHealth() {
        try {
            await this.prisma.nomination.count();
            return true;
        }
        catch {
            return false;
        }
    }
    checkDeadlineStatus() {
        return this.deadlineService.isNominationOpen();
    }
}
exports.AdminDashboardService = AdminDashboardService;
//# sourceMappingURL=admin-dashboard.service.js.map