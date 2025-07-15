import { PrismaService } from "../../../../db";
import { DeadlineService } from "../../common/utils/deadline.service";
import { NominationStatus } from "@prisma/client/index";

export class AdminDashboardService {
    constructor(
        private prisma: PrismaService,
        private deadlineService: DeadlineService,
    ) {}

    async getDashboardData() {
        const [
            totalNominations,
            pendingReview,
            approved,
            rejected,
            awaitingVerification,
            recentActivity,
        ] = await Promise.all([
            this.prisma.nomination.count(),
            this.prisma.nomination.count({ where: {
                //@ts-ignore
                status: NominationStatus.UNDER_REVIEW
            } }),
            this.prisma.nomination.count({ where: { status: NominationStatus.APPROVED } }),
            this.prisma.nomination.count({ where: { status: NominationStatus.REJECTED } }),
            this.prisma.nomination.count({ where: {
                //@ts-ignore
                status: NominationStatus.AWAITING_VERIFICATION
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

    private async getRecentActivity() {
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
        const [
            databaseStatus,
            nominationSystemStatus,
            deadlineStatus,
        ] = await Promise.all([
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

    private async checkDatabaseHealth(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
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

    private checkDeadlineStatus(): boolean {
        return this.deadlineService.isNominationOpen();
    }
}