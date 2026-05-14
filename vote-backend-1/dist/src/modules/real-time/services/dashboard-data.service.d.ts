import { PrismaService } from "../../../../db";
import { VotingStatsService } from "./voting-stats.service";
export declare class DashboardDataService {
    private prisma;
    private votingStatsService;
    constructor(prisma: PrismaService, votingStatsService: VotingStatsService);
    getAdminDashboardData(): Promise<{
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
    private getSystemStatus;
    private getRecentActivity;
    private groupVotesByMinute;
    private getCurrentElectionPhase;
    getPublicDashboardData(): Promise<{
        totalVotes: number;
        turnoutPercentage: number;
        positionStats: {
            position: import(".prisma/client").$Enums.Candidate_Position;
            totalVotes: number;
            candidateCount: number;
        }[];
        lastUpdated: Date;
    }>;
}
