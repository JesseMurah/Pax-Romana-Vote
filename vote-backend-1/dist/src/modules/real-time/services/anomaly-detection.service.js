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
var AnomalyDetectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnomalyDetectionService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
const cache_service_1 = require("../../caches/cache.service");
let AnomalyDetectionService = AnomalyDetectionService_1 = class AnomalyDetectionService {
    prisma;
    cacheService;
    logger = new common_1.Logger(AnomalyDetectionService_1.name);
    VOTING_SPIKE_THRESHOLD = 50;
    DUPLICATE_IP_THRESHOLD = 10;
    constructor(prisma, cacheService) {
        this.prisma = prisma;
        this.cacheService = cacheService;
    }
    async detectAnomalies() {
        const anomalies = [];
        const votingSpike = await this.detectVotingSpike();
        if (votingSpike)
            anomalies.push(votingSpike);
        const suspiciousIPs = await this.detectSuspiciousIPActivity();
        anomalies.push(...suspiciousIPs);
        const duplicateAttempts = await this.detectDuplicateVotingAttempts();
        anomalies.push(...duplicateAttempts);
        const systemOverload = await this.detectSystemOverload();
        if (systemOverload)
            anomalies.push(systemOverload);
        return anomalies;
    }
    async detectVotingSpike() {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const recentVotes = await this.prisma.vote.count({
            where: {
                createdAt: { gte: oneMinuteAgo },
                isValid: true,
            },
        });
        if (recentVotes > this.VOTING_SPIKE_THRESHOLD) {
            return {
                type: 'VOTING_SPIKE',
                severity: 'HIGH',
                message: `Unusual voting spike detected: ${recentVotes} votes in the last minute`,
                details: {
                    votesPerMinute: recentVotes,
                    threshold: this.VOTING_SPIKE_THRESHOLD,
                    timeWindow: '1 minute',
                },
                timestamp: new Date(),
                requiresAction: true,
            };
        }
        return null;
    }
    async detectSuspiciousIPActivity() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000);
        const ipActivity = await this.prisma.vote.groupBy({
            by: ['ipAddress'],
            where: {
                createdAt: { gte: oneHourAgo },
                ipAddress: { not: null },
            },
            _count: {
                id: true,
            },
            having: {
                id: {
                    _count: {
                        gt: this.DUPLICATE_IP_THRESHOLD,
                    },
                },
            },
        });
        return ipActivity.map(activity => ({
            type: 'SUSPICIOUS_PATTERN',
            severity: 'MEDIUM',
            message: `High voting activity from single IP: ${activity.ipAddress}`,
            details: {
                ipAddress: activity.ipAddress,
                voteCount: activity._count.id,
                threshold: this.DUPLICATE_IP_THRESHOLD,
                timeWindow: '1 hour',
            },
            timestamp: new Date(),
            requiresAction: true,
        }));
    }
    async detectDuplicateVotingAttempts() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000);
        const duplicateSessions = await this.prisma.votingSession.groupBy({
            by: ['voterHash'],
            where: {
                createdAt: { gte: oneHourAgo },
            },
            _count: {
                id: true,
            },
            having: {
                id: {
                    _count: {
                        gt: 1,
                    },
                },
            },
        });
        return duplicateSessions.map(session => ({
            type: 'DUPLICATE_ATTEMPT',
            severity: 'HIGH',
            message: `Multiple voting attempts detected from same user`,
            details: {
                voterHash: session.voterHash,
                sessionCount: session._count.id,
                timeWindow: '1 hour',
            },
            timestamp: new Date(),
            requiresAction: true,
        }));
    }
    async detectSystemOverload() {
        const activeSessions = await this.prisma.votingSession.count({
            where: {
                status: 'ACTIVE',
                expiresAt: { gt: new Date() },
            },
        });
        const MAX_CONCURRENT_SESSIONS = 100;
        if (activeSessions > MAX_CONCURRENT_SESSIONS) {
            return {
                type: 'SYSTEM_OVERLOAD',
                severity: 'CRITICAL',
                message: `System overload: ${activeSessions} concurrent voting sessions`,
                details: {
                    activeSessions,
                    maxCapacity: MAX_CONCURRENT_SESSIONS,
                    utilizationPercentage: (activeSessions / MAX_CONCURRENT_SESSIONS) * 100,
                },
                timestamp: new Date(),
                requiresAction: true,
            };
        }
        return null;
    }
    async shouldRunDetection() {
        const cacheKey = 'anomaly:last_check';
        const lastCheck = await this.cacheService.get(cacheKey);
        if (!lastCheck) {
            await this.cacheService.set(cacheKey, new Date(), 30);
            return true;
        }
        return false;
    }
};
exports.AnomalyDetectionService = AnomalyDetectionService;
exports.AnomalyDetectionService = AnomalyDetectionService = AnomalyDetectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        cache_service_1.CacheService])
], AnomalyDetectionService);
//# sourceMappingURL=anomaly-detection.service.js.map