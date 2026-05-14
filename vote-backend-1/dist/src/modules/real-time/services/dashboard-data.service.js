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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardDataService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
const voting_stats_service_1 = require("./voting-stats.service");
const client_1 = require("@prisma/client");
const index_1 = require("@prisma/client/index");
let DashboardDataService = class DashboardDataService {
    prisma;
    votingStatsService;
    constructor(prisma, votingStatsService) {
        this.prisma = prisma;
        this.votingStatsService = votingStatsService;
    }
    async getAdminDashboardData() {
        const [votingProgress, systemStatus, recentActivity, velocityData,] = await Promise.all([
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
    async getSystemStatus() {
        const [activeVotingSessions, totalRegisteredVoters, currentPhase,] = await Promise.all([
            this.prisma.votingSession.count({
                where: {
                    status: client_1.VotingStatus.ACTIVE,
                    expiresAt: { gt: new Date() },
                },
            }),
            this.prisma.user.count({
                where: { role: index_1.UserRole.VOTER, isActive: true },
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
    async getRecentActivity() {
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
    groupVotesByMinute(votes) {
        const grouped = new Map();
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
    async getCurrentElectionPhase() {
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
    async getPublicDashboardData() {
        const votingProgress = await this.votingStatsService.getVotingProgress();
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
};
exports.DashboardDataService = DashboardDataService;
exports.DashboardDataService = DashboardDataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        voting_stats_service_1.VotingStatsService])
], DashboardDataService);
//# sourceMappingURL=dashboard-data.service.js.map