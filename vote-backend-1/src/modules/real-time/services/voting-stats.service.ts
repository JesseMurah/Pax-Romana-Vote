import {Injectable, Logger} from "@nestjs/common";
import {PrismaService} from "../../../../db";
import {CacheService} from "../../caches/cache.service";
import {CandidateStatsDto, PositionStatsDto, VotingProgressDto} from "../dto/voting-progress.dto";
import {Candidate_Position, UserRole} from "@prisma/client/index";

@Injectable()
export class VotingStatsService {
    private readonly logger = new Logger(VotingStatsService.name);

    constructor(
        private prisma: PrismaService,
        private cacheService: CacheService,
    ) {}

    /**
     * Get current voting progress (cached for 30 seconds)
     */
    async getVotingProgress(): Promise<VotingProgressDto> {
        const cacheKey = 'voting:progress:current';
        const cached = await this.cacheService.get(cacheKey);

        if (cached) {
            return cached as VotingProgressDto;
        }

        const progress = await this.calculateVotingProgress();
        await this.cacheService.set(cacheKey, progress, 30); // 30 second caches

        return progress;
    }

    /**
     * Calculate current voting statistics
     */
    private async calculateVotingProgress(): Promise<VotingProgressDto> {
        // Get total eligible voters
        const totalEligibleVoters = await this.prisma.user.count({
            where: { role: UserRole.VOTER, isActive: true },
        });

        // Get total votes cast
        const totalVotes = await this.prisma.vote.count({
            where: { isValid: true },
        });

        // Calculate turnout
        const turnoutPercentage = totalEligibleVoters > 0
            ? (totalVotes / totalEligibleVoters) * 100
            : 0;

        // Get position statistics
        const positionStats = await this.getPositionStatistics();

        return {
            totalVotes,
            totalEligibleVoters,
            turnoutPercentage: Math.round(turnoutPercentage * 100) / 100,
            positionStats,
            lastUpdated: new Date(),
        };
    }

    /**
     * Get statistics for all positions
     */
    private async getPositionStatistics(): Promise<PositionStatsDto[]> {
        const positions = Object.values(Candidate_Position);
        const positionStats: PositionStatsDto[] = [];

        for (const position of positions) {
            const stats = await this.getPositionStats(position);
            positionStats.push(stats);
        }

        return positionStats;
    }

    /**
     * Get statistics for specific position
     */
    async getPositionStats(position: Candidate_Position): Promise<PositionStatsDto> {
        // Get candidates for this position
        const candidates = await this.prisma.candidate.findMany({
            where: { position, isActive: true },
            include: { nomination: true },
            orderBy: { candidateNumber: 'asc' },
        });

        if (candidates.length === 0) {
            return {
                position,
                totalVotes: 0,
                candidates: [],
                isCompleted: false,
            };
        }

        // Calculate votes for each candidate
        const candidateStats: CandidateStatsDto[] = [];
        let totalPositionVotes = 0;

        for (const candidate of candidates) {
            const voteCount = candidate.voteCount || 0;
            totalPositionVotes += voteCount;

            candidateStats.push({
                candidateId: candidate.id,
                name: candidate.name,
                candidateNumber: candidate.candidateNumber,
                voteCount,
                percentage: 0, // Will calculate after we have total
                isLeading: false, // Will determine after sorting
            });
        }

        // Calculate percentages
        candidateStats.forEach(stats => {
            stats.percentage = totalPositionVotes > 0
                ? Math.round((stats.voteCount / totalPositionVotes) * 10000) / 100
                : 0;
        });

        // Sort by vote count and mark leader
        candidateStats.sort((a, b) => b.voteCount - a.voteCount);
        if (candidateStats.length > 0 && candidateStats[0].voteCount > 0) {
            candidateStats[0].isLeading = true;
        }

        return {
            position,
            totalVotes: totalPositionVotes,
            candidates: candidateStats,
            isCompleted: false,
        };
    }

    /**
     * Get voting velocity (votes per minute)
     */
    async getVotingVelocity(): Promise<{ current: number; average: number }> {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const votingStartTime = await this.getVotingStartTime();

        // Votes in last minute
        const recentVotes = await this.prisma.vote.count({
            where: {
                createdAt: { gte: oneMinuteAgo },
                isValid: true,
            },
        });

        // Average votes per minute since voting started
        let averageVpm = 0;
        if (votingStartTime) {
            const totalMinutes = Math.max(1, (now.getTime() - votingStartTime.getTime()) / 60000);
            const totalVotes = await this.prisma.vote.count({
                where: {
                    createdAt: { gte: votingStartTime },
                    isValid: true,
                },
            });
            averageVpm = totalVotes / totalMinutes;
        }

        return {
            current: recentVotes,
            average: Math.round(averageVpm * 100) / 100,
        };
    }

    /**
     * Get voting start time from election timeline
     */
    private async getVotingStartTime(): Promise<Date | null> {
        const votingPhase = await this.prisma.electionTimeline.findUnique({
            where: { phase: 'voting' },
        });

        return votingPhase?.startDate || null;
    }

    /**
     * Clear voting statistics cache
     */
    async clearStatsCache(): Promise<void> {
        await this.cacheService.del('voting:progress:current');
        this.logger.log('Voting statistics cache cleared');
    }
}