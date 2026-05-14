import { DashboardDataService } from "../services/dashboard-data.service";
import { VotingStatsService } from "../services/voting-stats.service";
import { AnomalyDetectionService } from "../services/anomaly-detection.service";
import { RealTimeService } from "../services/real-time.service";
import { Candidate_Position, UserRole } from "@prisma/client/index";
export declare class RealTimeDataController {
    private votingStatsService;
    private anomalyDetectionService;
    private dashboardDataService;
    private realtimeService;
    constructor(votingStatsService: VotingStatsService, anomalyDetectionService: AnomalyDetectionService, dashboardDataService: DashboardDataService, realtimeService: RealTimeService);
    getVotingProgress(): Promise<import("../dto/voting-progress.dto").VotingProgressDto>;
    getPositionStats(position: Candidate_Position): Promise<import("../dto/voting-progress.dto").PositionStatsDto>;
    getPublicDashboard(): Promise<{
        totalVotes: number;
        turnoutPercentage: number;
        positionStats: {
            position: import(".prisma/client").$Enums.Candidate_Position;
            totalVotes: number;
            candidateCount: number;
        }[];
        lastUpdated: Date;
    }>;
    getAdminDashboard(): Promise<{
        votingProgress: import("../dto/voting-progress.dto").VotingProgressDto;
        systemStatus: {
            activeVotingSessions: number;
            totalRegisteredVoters: number;
            currentPhase: string;
            systemHealth: string;
        };
        recentActivity: {
            recentVotes: number;
            timeline: {
                timestamp: Date;
                voteCount: number;
            }[];
        };
        velocityData: {
            current: number;
            average: number;
        };
        lastUpdated: Date;
    }>;
    getVotingVelocity(): Promise<{
        current: number;
        average: number;
    }>;
    getAnomalies(): Promise<import("../dto/anomaly-alert.dto").AnomalyAlertDto[]>;
    getConnectionStats(): Promise<{
        totalConnections: number;
        roleBreakdown: Record<UserRole, number>;
        activeConnections: number;
    }>;
    refreshCache(): Promise<{
        message: string;
    }>;
}
