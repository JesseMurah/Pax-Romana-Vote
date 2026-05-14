import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../db';
import { VotingStatsService } from '../real-time/services/voting-stats.service';
import { RealTimeService } from '../real-time/services/real-time.service';
import { SseEventType } from '../real-time/enums/sse-event-types.enum';
import { Candidate_Position, UserRole } from '@prisma/client';

@Injectable()
export class VotingService {
    private readonly logger = new Logger(VotingService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly votingStatsService: VotingStatsService,
        private readonly realTimeService: RealTimeService,
    ) {}

    async getVotingStats(): Promise<any> {
        try {
            const realtimeStats = await this.votingStatsService.getVotingProgress();
            const velocityData = await this.votingStatsService.getVotingVelocity();
            return { ...realtimeStats, velocity: velocityData, systemInfo: { cacheEnabled: true, realTimeEnabled: true, lastRefresh: new Date() } };
        } catch {
            return this.prisma.$transaction(async (tx) => {
                const totalVoters = await tx.user.count({ where: { role: 'VOTER' } });
                const votedCount = await tx.user.count({ where: { role: 'VOTER', hasVoted: true } });
                const totalVotes = await tx.vote.count();
                const candidateStats = await tx.candidate.findMany({
                    select: { id: true, name: true, position: true, voteCount: true },
                    orderBy: [{ position: 'asc' }, { voteCount: 'desc' }],
                });
                return { totalVoters, votedCount, totalVotes, turnoutPercentage: totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0, candidateStats };
            });
        }
    }

    async getVotingTimeline(): Promise<any> {
        const timeline = await this.prisma.electionTimeline.findMany({ orderBy: { startDate: 'asc' } });
        const now = new Date();
        const currentPhase = timeline.find((p) => p.startDate <= now && p.endDate >= now && p.isActive);
        return {
            timeline: timeline.map((p) => ({
                phase: p.phase, startDate: p.startDate, endDate: p.endDate, isActive: p.isActive,
                isCurrent: p.id === currentPhase?.id,
                status: p.endDate < now ? 'COMPLETED' : p.startDate > now ? 'UPCOMING' : 'ACTIVE',
            })),
            currentPhase: currentPhase?.phase || 'UNKNOWN',
            nextPhase: timeline.find((p) => p.startDate > now),
            lastUpdated: now,
        };
    }

    async getPublicDashboardData(): Promise<any> {
        const stats = await this.votingStatsService.getVotingProgress();
        return {
            totalVotes: stats.totalVotes,
            turnoutPercentage: stats.turnoutPercentage,
            positionSummary: stats.positionStats.map((p) => ({ position: p.position, totalVotes: p.totalVotes, candidateCount: p.candidates.length })),
            votingStatus: await this.getVotingStats(),
            lastUpdated: stats.lastUpdated,
            systemStatus: 'ACTIVE',
        };
    }

    async refreshAndBroadcastStats(): Promise<void> {
        try {
            await this.votingStatsService.clearStatsCache();
            const updatedStats = await this.votingStatsService.getVotingProgress();
            this.realTimeService.broadcast({ type: SseEventType.VOTING_PROGRESS, data: updatedStats, timestamp: new Date() });
            this.realTimeService.broadcastToAdmins({ type: SseEventType.SYSTEM_STATUS, data: { action: 'MANUAL_STATS_REFRESH', statistics: updatedStats, timestamp: new Date() }, timestamp: new Date() });
        } catch (error) {
            this.realTimeService.broadcastToAdmins({ type: SseEventType.SYSTEM_STATUS, data: { action: 'STATS_REFRESH_FAILED', error: error.message, timestamp: new Date() }, timestamp: new Date() });
        }
    }

    async getRealtimeConnectionInfo(): Promise<any> {
        return {
            connections: this.realTimeService.getConnectionStats(),
            votingProgress: await this.votingStatsService.getVotingProgress(),
            systemStatus: 'HEALTHY',
            lastUpdated: new Date(),
        };
    }

    async broadcastMessage(message: string, role: UserRole, type: SseEventType = SseEventType.SYSTEM_STATUS): Promise<void> {
        this.realTimeService.broadcastToRole({ type, data: { message, timestamp: new Date(), source: 'VOTING_SERVICE' }, timestamp: new Date() }, role);
    }

    async getPositionStats(position: Candidate_Position): Promise<any> {
        return this.votingStatsService.getPositionStats(position);
    }

    async getVotingVelocity(): Promise<any> {
        return this.votingStatsService.getVotingVelocity();
    }
}
