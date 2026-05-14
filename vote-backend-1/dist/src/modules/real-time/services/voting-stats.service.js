"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VotingStatsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotingStatsService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
const cache_service_1 = require("../../caches/cache.service");
const index_1 = require("@prisma/client/index");
let VotingStatsService = VotingStatsService_1 = class VotingStatsService {
    prisma;
    cacheService;
    logger = new common_1.Logger(VotingStatsService_1.name);
    constructor(prisma, cacheService) {
        this.prisma = prisma;
        this.cacheService = cacheService;
    }
    async getVotingProgress() {
        const cacheKey = 'voting:progress:current';
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const progress = await this.calculateVotingProgress();
        await this.cacheService.set(cacheKey, progress, 30);
        return progress;
    }
    async calculateVotingProgress() {
        const totalEligibleVoters = await this.prisma.user.count({
            where: { role: index_1.UserRole.VOTER, isActive: true },
        });
        const totalVotes = await this.prisma.vote.count({
            where: { isValid: true },
        });
        const turnoutPercentage = totalEligibleVoters > 0
            ? (totalVotes / totalEligibleVoters) * 100
            : 0;
        const positionStats = await this.getPositionStatistics();
        return {
            totalVotes,
            totalEligibleVoters,
            turnoutPercentage: Math.round(turnoutPercentage * 100) / 100,
            positionStats,
            lastUpdated: new Date(),
        };
    }
    async getPositionStatistics() {
        const positions = Object.values(index_1.Candidate_Position);
        const positionStats = [];
        for (const position of positions) {
            const stats = await this.getPositionStats(position);
            positionStats.push(stats);
        }
        return positionStats;
    }
    async getPositionStats(position) {
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
        const candidateStats = [];
        let totalPositionVotes = 0;
        for (const candidate of candidates) {
            const voteCount = candidate.voteCount || 0;
            totalPositionVotes += voteCount;
            candidateStats.push({
                candidateId: candidate.id,
                name: candidate.name,
                candidateNumber: candidate.candidateNumber,
                voteCount,
                percentage: 0,
                isLeading: false,
            });
        }
        candidateStats.forEach(stats => {
            stats.percentage = totalPositionVotes > 0
                ? Math.round((stats.voteCount / totalPositionVotes) * 10000) / 100
                : 0;
        });
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
    async getVotingVelocity() {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const votingStartTime = await this.getVotingStartTime();
        const recentVotes = await this.prisma.vote.count({
            where: {
                createdAt: { gte: oneMinuteAgo },
                isValid: true,
            },
        });
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
    async getVotingStartTime() {
        const votingPhase = await this.prisma.electionTimeline.findUnique({
            where: { phase: 'voting' },
        });
        return votingPhase?.startDate || null;
    }
    async clearStatsCache() {
        await this.cacheService.del('voting:progress:current');
        this.logger.log('Voting statistics cache cleared');
    }
};
exports.VotingStatsService = VotingStatsService;
exports.VotingStatsService = VotingStatsService = VotingStatsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        cache_service_1.CacheService])
], VotingStatsService);
//# sourceMappingURL=voting-stats.service.js.map