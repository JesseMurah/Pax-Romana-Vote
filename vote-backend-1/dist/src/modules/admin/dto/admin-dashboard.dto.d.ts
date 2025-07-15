import { NominationStatus } from "@prisma/client";
export declare class AdminDashboardDto {
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
        };
        isInGracePeriod: boolean;
    };
    recentActivity: any[];
}
export declare class NominationStatsFilterDto {
    startDate?: string;
    endDate?: string;
    status?: NominationStatus;
}
