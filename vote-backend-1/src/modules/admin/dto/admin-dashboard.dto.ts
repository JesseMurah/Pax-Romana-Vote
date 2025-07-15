import { IsDateString, IsEnum, IsOptional } from "class-validator";
import { NominationStatus } from "@prisma/client";


export class AdminDashboardDto {
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


export class NominationStatsFilterDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsEnum(NominationStatus)
    status?: NominationStatus;
}