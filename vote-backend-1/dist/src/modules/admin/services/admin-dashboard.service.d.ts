import { PrismaService } from "../../../../db";
import { DeadlineService } from "../../common/utils/deadline.service";
export declare class AdminDashboardService {
    private prisma;
    private deadlineService;
    constructor(prisma: PrismaService, deadlineService: DeadlineService);
    getDashboardData(): Promise<{
        totalNominations: number;
        pendingReview: number;
        approved: number;
        rejected: number;
        awaitingVerification: number;
        deadlineInfo: {
            timeRemaining: {
                days: number;
                hours: number;
                minutes: number;
                seconds: number;
            };
            isInGracePeriod: boolean;
        };
        recentActivity: ({
            user: {
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
        } & {
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
        })[];
    }>;
    private getRecentActivity;
    getSystemHealth(): Promise<{
        database: boolean;
        nominationSystem: boolean;
        deadline: boolean;
        overall: boolean;
    }>;
    private checkDatabaseHealth;
    private checkNominationSystemHealth;
    private checkDeadlineStatus;
}
