import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../db";
import { VotingStatsService } from "./voting-stats.service";
import {VotingStatus} from "@prisma/client";
import {UserRole} from "@prisma/client/index";

@Injectable()
export class DashboardDataService {
    constructor(
        private prisma: PrismaService,
        private votingStatsService: VotingStatsService,
    ) {}

    /**
     * Get comprehensive admin dashboard data
     */
    async getAdminDashboardData() {
        const [
            votingProgress,
            systemStatus,
            recentActivity,
            velocityData,
        ] = await Promise.all([
            this.votingStatsService.getVotingProgress(),
            this.getSystemStatus(),
            this.getRecentActivity(),
            this.votingStatsService.getVotingVelocity(),
        ]);

        return {
            votingProgress,
            systemStatus,
            recentActivity,
            velocityData,
            lastUpdated: new Date(),
        };
    }

    /**
     * Get system status information
     */
    private async getSystemStatus() {
        const [
            activeVotingSessions,
            totalRegisteredVoters,
            currentPhase,
        ] = await Promise.all([
            this.prisma.votingSession.count({
                where: {
                    status: VotingStatus.ACTIVE,
                    expiresAt: { gt: new Date() },
                },
            }),
            this.prisma.user.count({
                where: { role: UserRole.VOTER, isActive: true },
            }),
            this.getCurrentElectionPhase(),
        ]);

        return {
            activeVotingSessions,
            totalRegisteredVoters,
            currentPhase,
            systemHealth: 'HEALTHY',
        };
    }

    /**
     * Get recent voting activity
     */
    private async getRecentActivity() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const recentVotes = await this.prisma.vote.findMany({
            where: {
                createdAt: { gte: fiveMinutesAgo },
                isValid: true,
            },
            select: {
                createdAt: true,
                voterHash: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return {
            recentVotes: recentVotes.length,
            timeline: this.groupVotesByMinute(recentVotes),
        };
    }

    /**
     * Group votes by minute for timeline display
     */
    private groupVotesByMinute(votes: Array<{ createdAt: Date }>) {
        const grouped = new Map<string, number>();

        votes.forEach(vote => {
            const minute = new Date(vote.createdAt);
            minute.setSeconds(0, 0);
            const key = minute.getTime().toString();
            grouped.set(key, (grouped.get(key) || 0) + 1);
        });

        return Array.from(grouped.entries()).map(([timestamp, count]) => ({
            timestamp: new Date(parseInt(timestamp)),
            voteCount: count,
        }));
    }

    /**
     * Get current election phase
     */
    private async getCurrentElectionPhase() {
        const now = new Date();

        const currentPhase = await this.prisma.electionTimeline.findFirst({
            where: {
                startDate: { lte: now },
                endDate: { gte: now },
                isActive: true,
            },
        });

        return currentPhase?.phase || 'UNKNOWN';
    }

    /**
     * Get public voting statistics (filtered for public consumption)
     */
    async getPublicDashboardData() {
        const votingProgress = await this.votingStatsService.getVotingProgress();

        // Filter sensitive information for public view
        return {
            totalVotes: votingProgress.totalVotes,
            turnoutPercentage: votingProgress.turnoutPercentage,
            positionStats: votingProgress.positionStats.map(position => ({
                position: position.position,
                totalVotes: position.totalVotes,
                candidateCount: position.candidates.length,
            })),
            lastUpdated: votingProgress.lastUpdated,
        };
    }
}