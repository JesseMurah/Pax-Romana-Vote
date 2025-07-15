import { AdminDashboardService } from "../services/admin-dashboard.service";
import { NominationStatsFilterDto } from "../dto/admin-dashboard.dto";
import { NominationStatisticsService } from "../services/nomination-statistics.service";
export declare class AdminDashboardController {
    private adminDashboardService;
    private nominationStatisticsService;
    constructor(adminDashboardService: AdminDashboardService, nominationStatisticsService: NominationStatisticsService);
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
    getStatistics(filterDto: NominationStatsFilterDto): Promise<{
        total: number;
        byPosition: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.NominationGroupByOutputType, "nomineePosition"[]> & {
            _count: {
                id: number;
            };
        })[];
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.NominationGroupByOutputType, "status"[]> & {
            _count: {
                id: number;
            };
        })[];
        recent: {
            id: string;
            createdAt: Date;
            nomineeName: string;
            nomineePosition: import(".prisma/client").$Enums.Candidate_Position;
            status: import(".prisma/client").$Enums.NominationStatus;
        }[];
    }>;
    getSystemHealth(): Promise<{
        database: boolean;
        nominationSystem: boolean;
        deadline: boolean;
        overall: boolean;
    }>;
}
