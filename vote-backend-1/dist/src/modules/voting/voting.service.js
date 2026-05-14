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
exports.VotingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const db_1 = require("../../../db");
const cache_service_1 = require("../caches/cache.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const crypto_1 = require("crypto");
const CryptoJS = require("crypto-js");
const real_time_service_1 = require("../real-time/services/real-time.service");
const voting_stats_service_1 = require("../real-time/services/voting-stats.service");
const anomaly_detection_service_1 = require("../real-time/services/anomaly-detection.service");
const sse_event_types_enum_1 = require("../real-time/enums/sse-event-types.enum");
const client_1 = require("@prisma/client");
const csvWriter = require("csv-writer");
const fs_1 = require("fs");
const path_1 = require("path");
let VotingService = class VotingService {
    httpService;
    configService;
    prisma;
    cacheService;
    realTimeService;
    votingStatsService;
    anomalyDetectionService;
    encryptionKey;
    constructor(httpService, configService, prisma, cacheService, realTimeService, votingStatsService, anomalyDetectionService) {
        this.httpService = httpService;
        this.configService = configService;
        this.prisma = prisma;
        this.cacheService = cacheService;
        this.realTimeService = realTimeService;
        this.votingStatsService = votingStatsService;
        this.anomalyDetectionService = anomalyDetectionService;
        this.encryptionKey = this.configService.get('VOTE_ENCRYPTION_KEY') || '3041a8efad5e974cc27bc09cf57c8ad8555f80958f4c1d27b7f4d68d5b3c8de6';
    }
    async generateOtp(dto) {
        const { phoneNumber, name, email } = dto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser?.hasVoted) {
            throw new common_1.ConflictException('You have already voted in this election');
        }
        const apiKey = this.configService.get('ARKESEL_API_KEY');
        if (!apiKey) {
            throw new common_1.BadRequestException('SMS service is not configured');
        }
        const data = {
            expiry: 5,
            length: 6,
            medium: 'sms',
            message: 'Your Pax Romana KNUST voting OTP is %otp_code%. Valid for 5 minutes.',
            number: phoneNumber,
            sender_id: 'VotingApp',
            type: 'numeric',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://sms.arkesel.com/api/otp/generate', data, {
                headers: { 'api-key': apiKey },
            }));
            if (response.data.code === '1000') {
                await this.cacheService.setSmsCode(phoneNumber, JSON.stringify({
                    name,
                    email,
                    timestamp: Date.now(),
                    status: 'PENDING'
                }));
                this.realTimeService.broadcastToAdmins({
                    type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
                    data: {
                        action: 'OTP_GENERATED',
                        phoneNumber: phoneNumber.slice(-4),
                        email: email.split('@')[0] + '@***',
                        timestamp: new Date(),
                    },
                    timestamp: new Date(),
                });
                return {
                    message: 'OTP sent successfully to ' + phoneNumber,
                    ussd_code: response.data.ussd_code,
                    expiresIn: '5 minutes'
                };
            }
            else {
                throw new common_1.BadRequestException(`Failed to generate OTP: ${response.data.message}`);
            }
        }
        catch (error) {
            this.realTimeService.broadcastToAdmins({
                type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'OTP_GENERATION_FAILED',
                    phoneNumber: phoneNumber.slice(-4),
                    error: error.message,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
            if (error.response?.status === 401) {
                throw new common_1.BadRequestException('SMS service authentication failed');
            }
            throw new common_1.BadRequestException(`Error generating OTP: ${error.message}`);
        }
    }
    async verifyOtp(dto) {
        const { phoneNumber, otp, email } = dto;
        const apiKey = this.configService.get('ARKESEL_API_KEY');
        const data = { number: phoneNumber, otp };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://sms.arkesel.com/api/otp/verify', data, {
                headers: { 'api-key': apiKey },
            }));
            if (response.data.code !== '1000') {
                this.realTimeService.broadcastToAdmins({
                    type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
                    data: {
                        action: 'OTP_VERIFICATION_FAILED',
                        phoneNumber: phoneNumber.slice(-4),
                        reason: 'Invalid or expired OTP',
                        timestamp: new Date(),
                    },
                    timestamp: new Date(),
                });
                throw new common_1.BadRequestException('Invalid or expired OTP');
            }
            const cachedData = await this.cacheService.getSmsCode(phoneNumber);
            if (!cachedData) {
                throw new common_1.NotFoundException('OTP session not found or expired');
            }
            const otpData = JSON.parse(cachedData);
            if (otpData.email !== email) {
                throw new common_1.BadRequestException('Email mismatch with OTP request');
            }
            const phoneHash = (0, crypto_1.createHash)('sha256').update(phoneNumber).digest('hex');
            let user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        name: otpData.name,
                        email,
                        phone: phoneNumber,
                        phoneVerified: true,
                        role: 'VOTER',
                    },
                });
            }
            else if (user.hasVoted) {
                throw new common_1.ConflictException('You have already voted in this election');
            }
            const sessionId = (0, crypto_1.createHash)('sha256')
                .update(`${phoneNumber}_${Date.now()}_${Math.random()}`)
                .digest('hex');
            const votingSession = await this.prisma.votingSession.create({
                data: {
                    sessionId,
                    voterHash: phoneHash,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                },
            });
            await this.cacheService.setVotingSession(phoneHash, {
                sessionId,
                userId: user.id,
                email: user.email,
                name: user.name,
                createdAt: votingSession.createdAt,
                voterHash: "",
                currentStep: 0,
                isValid: false
            });
            await this.cacheService.clearSmsCode(phoneNumber);
            const connectionStats = this.realTimeService.getConnectionStats();
            this.realTimeService.broadcastToAdmins({
                type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'VOTER_LOGIN_SUCCESS',
                    voterName: user.name.split(' ')[0] + ' ***',
                    sessionId: sessionId.slice(0, 8) + '***',
                    activeVotingSessions: connectionStats.totalConnections + 1,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
            return {
                message: 'OTP verified successfully',
                sessionId,
                voter: {
                    name: user.name,
                    email: user.email,
                },
                expiresAt: votingSession.expiresAt,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error verifying OTP: ${error.message}`);
        }
    }
    async getBallot() {
        const cachedBallot = await this.cacheService.getBallot();
        if (cachedBallot) {
            return cachedBallot;
        }
        const candidates = await this.prisma.candidate.findMany({
            where: { isActive: true },
            include: {
                nomination: {
                    select: {
                        nomineeCollege: true,
                        nomineeDepartment: true,
                        nomineeProgramme: true,
                        nomineeLevel: true,
                        visionForOffice: true,
                    },
                },
            },
            orderBy: [
                { position: 'asc' },
                { candidateNumber: 'asc' },
            ],
        });
        const ballot = candidates.reduce((acc, candidate) => {
            const position = candidate.position;
            if (!acc[position]) {
                acc[position] = [];
            }
            acc[position].push({
                id: candidate.id,
                name: candidate.name,
                candidateNumber: candidate.candidateNumber,
                photoUrl: candidate.photoUrl,
                biography: candidate.biography,
                college: candidate.nomination?.nomineeCollege,
                department: candidate.nomination?.nomineeDepartment,
                programme: candidate.nomination?.nomineeProgramme,
                level: candidate.nomination?.nomineeLevel,
                vision: candidate.nomination?.visionForOffice,
            });
            return acc;
        }, {});
        const ballotResponse = {
            ballot,
            totalPositions: Object.keys(ballot).length,
            totalCandidates: candidates.length,
            instructions: [
                'Vote for ONE candidate per position',
                'You can skip positions you don\'t want to vote for',
                'Review your selections before submitting',
                'Once submitted, your vote cannot be changed',
            ],
        };
        await this.cacheService.setBallot(ballotResponse);
        return ballotResponse;
    }
    async submitVote(dto) {
        const { sessionId, votes } = dto;
        const session = await this.prisma.votingSession.findUnique({
            where: { sessionId },
            include: { user: true },
        });
        if (!session) {
            throw new common_1.NotFoundException('Invalid voting session');
        }
        if (session.expiresAt < new Date()) {
            throw new common_1.ForbiddenException('Voting session has expired');
        }
        if (session.user.hasVoted) {
            throw new common_1.ConflictException('You have already submitted your vote');
        }
        const candidateIds = Object.values(votes);
        const validCandidates = await this.prisma.candidate.findMany({
            where: {
                id: { in: candidateIds },
                isActive: true,
            },
        });
        if (validCandidates.length !== candidateIds.length) {
            throw new common_1.BadRequestException('One or more selected candidates are invalid');
        }
        try {
            const encryptedVote = CryptoJS.AES.encrypt(JSON.stringify(votes), this.encryptionKey).toString();
            const result = await this.prisma.$transaction(async (tx) => {
                const vote = await tx.vote.create({
                    data: {
                        encryptedVote,
                        voterHash: session.voterHash,
                        sessionId: session.id,
                    },
                });
                await tx.user.update({
                    where: { id: session.userId },
                    data: {
                        hasVoted: true,
                    },
                });
                await tx.votingSession.update({
                    where: { id: session.id },
                    data: {
                        status: 'COMPLETED',
                        endTime: new Date(),
                    },
                });
                for (const candidateId of candidateIds) {
                    await tx.candidate.update({
                        where: { id: candidateId },
                        data: { voteCount: { increment: 1 } },
                    });
                }
                return vote;
            });
            await this.votingStatsService.clearStatsCache();
            const updatedStats = await this.votingStatsService.getVotingProgress();
            this.realTimeService.broadcast({
                type: sse_event_types_enum_1.SseEventType.VOTING_PROGRESS,
                data: {
                    totalVotes: updatedStats.totalVotes,
                    turnoutPercentage: updatedStats.turnoutPercentage,
                    lastUpdated: new Date(),
                },
                timestamp: new Date(),
            });
            this.realTimeService.broadcastToAdmins({
                type: sse_event_types_enum_1.SseEventType.POSITION_UPDATE,
                data: {
                    voteEvent: {
                        voteId: result.id,
                        timestamp: result.createdAt,
                        positionsVoted: Object.keys(votes).length,
                        voterHash: session.voterHash.slice(0, 8) + '***',
                    },
                    updatedStatistics: updatedStats,
                    velocityData: await this.votingStatsService.getVotingVelocity(),
                },
                timestamp: new Date(),
            });
            const votedPositions = Object.keys(votes);
            for (const position of votedPositions) {
                const positionStats = await this.votingStatsService.getPositionStats(position);
                this.realTimeService.broadcastToAdmins({
                    type: sse_event_types_enum_1.SseEventType.POSITION_UPDATE,
                    data: {
                        position,
                        stats: positionStats,
                        lastVoteTime: new Date(),
                    },
                    timestamp: new Date(),
                });
            }
            if (await this.anomalyDetectionService.shouldRunDetection()) {
                try {
                    const anomalies = await this.anomalyDetectionService.detectAnomalies();
                    if (anomalies.length > 0) {
                        this.realTimeService.broadcastToRole({
                            type: sse_event_types_enum_1.SseEventType.ANOMALY_ALERT,
                            data: {
                                anomalies,
                                triggeredBy: 'VOTE_SUBMISSION',
                                voteId: result.id
                            },
                            timestamp: new Date(),
                        }, client_1.UserRole.SUPER_ADMIN);
                    }
                }
                catch (anomalyError) {
                    console.error('Anomaly detection failed:', anomalyError);
                }
            }
            const connectionStats = this.realTimeService.getConnectionStats();
            this.realTimeService.broadcastToAdmins({
                type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'VOTE_SUBMITTED_SUCCESS',
                    totalVotes: updatedStats.totalVotes,
                    turnoutPercentage: updatedStats.turnoutPercentage,
                    activeConnections: connectionStats.totalConnections,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
            await this.cacheService.deleteVotingSession(session.voterHash);
            await this.prisma.auditLog.create({
                data: {
                    action: 'VOTE_SUBMITTED',
                    entity: 'Vote',
                    entityId: result.id,
                    userId: session.userId,
                    newValues: {
                        positions: Object.keys(votes).length,
                        timestamp: new Date(),
                    },
                },
            });
            return {
                message: 'Vote submitted successfully',
                voteId: result.id,
                timestamp: result.createdAt,
                positionsVoted: Object.keys(votes).length,
                instructions: [
                    'Your vote has been securely recorded',
                    'Please proceed to the ink verification station',
                    'Thank you for participating in the election',
                ],
            };
        }
        catch (error) {
            this.realTimeService.broadcastToAdmins({
                type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'VOTE_SUBMISSION_FAILED',
                    sessionId: sessionId.slice(0, 8) + '***',
                    error: error.message,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
            throw new common_1.BadRequestException(`Error submitting vote: ${error.message}`);
        }
    }
    async getVotingStats() {
        try {
            const realtimeStats = await this.votingStatsService.getVotingProgress();
            const velocityData = await this.votingStatsService.getVotingVelocity();
            return {
                ...realtimeStats,
                velocity: velocityData,
                systemInfo: {
                    cacheEnabled: true,
                    realTimeEnabled: true,
                    lastRefresh: new Date(),
                }
            };
        }
        catch (error) {
            const stats = await this.prisma.$transaction(async (tx) => {
                const totalVoters = await tx.user.count({
                    where: { role: 'VOTER' },
                });
                const votedCount = await tx.user.count({
                    where: {
                        role: 'VOTER',
                        hasVoted: true,
                    },
                });
                const totalVotes = await tx.vote.count();
                const candidateStats = await tx.candidate.findMany({
                    select: {
                        id: true,
                        name: true,
                        position: true,
                        voteCount: true,
                    },
                    orderBy: [
                        { position: 'asc' },
                        { voteCount: 'desc' },
                    ],
                });
                return {
                    totalVoters,
                    votedCount,
                    totalVotes,
                    turnoutPercentage: totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0,
                    candidateStats,
                };
            });
            return stats;
        }
    }
    async validateSession(sessionId) {
        const session = await this.prisma.votingSession.findUnique({
            where: { sessionId },
            include: { user: true },
        });
        if (!session) {
            this.realTimeService.broadcastToAdmins({
                type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'INVALID_SESSION_ACCESS',
                    sessionId: sessionId.slice(0, 8) + '***',
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.expiresAt < new Date()) {
            this.realTimeService.broadcastToAdmins({
                type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'EXPIRED_SESSION_ACCESS',
                    sessionId: sessionId.slice(0, 8) + '***',
                    userId: session.user.id,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
            throw new common_1.ForbiddenException('Session expired');
        }
        if (session.user.hasVoted) {
            throw new common_1.ConflictException('User has already voted');
        }
        return {
            valid: true,
            user: {
                name: session.user.name,
                email: session.user.email,
            },
            expiresAt: session.expiresAt,
            timeRemaining: Math.max(0, session.expiresAt.getTime() - Date.now()),
        };
    }
    async refreshAndBroadcastStats() {
        try {
            await this.votingStatsService.clearStatsCache();
            const updatedStats = await this.votingStatsService.getVotingProgress();
            this.realTimeService.broadcast({
                type: sse_event_types_enum_1.SseEventType.VOTING_PROGRESS,
                data: updatedStats,
                timestamp: new Date(),
            });
            this.realTimeService.broadcastToAdmins({
                type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'MANUAL_STATS_REFRESH',
                    statistics: updatedStats,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.realTimeService.broadcastToAdmins({
                type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'STATS_REFRESH_FAILED',
                    error: error.message,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
        }
    }
    async getRealtimeConnectionInfo() {
        const connectionStats = this.realTimeService.getConnectionStats();
        const votingStats = await this.votingStatsService.getVotingProgress();
        return {
            connections: connectionStats,
            votingProgress: votingStats,
            systemStatus: 'HEALTHY',
            lastUpdated: new Date(),
        };
    }
    async broadcastMessage(message, role, type = sse_event_types_enum_1.SseEventType.SYSTEM_STATUS) {
        this.realTimeService.broadcastToRole({
            type,
            data: {
                message,
                timestamp: new Date(),
                source: 'VOTING_SERVICE',
            },
            timestamp: new Date(),
        }, role);
    }
    async getPositionStats(position) {
        return this.votingStatsService.getPositionStats(position);
    }
    async getVotingVelocity() {
        return this.votingStatsService.getVotingVelocity();
    }
    async getVotingAnalytics(options) {
        const { timeframe, position, requestedBy } = options;
        let startDate;
        const now = new Date();
        switch (timeframe) {
            case 'hour':
                startDate = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = await this.getVotingStats() || new Date(0);
        }
        const analytics = await this.prisma.$transaction(async (tx) => {
            const voteTimeline = await tx.vote.findMany({
                where: {
                    createdAt: { gte: startDate },
                    isValid: true,
                },
                select: {
                    createdAt: true,
                    voterHash: true,
                },
                orderBy: { createdAt: 'asc' },
            });
            const hourlyBreakdown = this.groupVotesByHour(voteTimeline);
            let positionData = null;
            if (position) {
                positionData = await this.votingStatsService.getPositionStats(position);
            }
            const velocity = await this.votingStatsService.getVotingVelocity();
            const activeSessions = await tx.votingSession.count({
                where: {
                    status: 'ACTIVE',
                    expiresAt: { gt: now },
                },
            });
            return {
                timeframe,
                dateRange: { from: startDate, to: now },
                totalVotes: voteTimeline.length,
                hourlyBreakdown,
                velocity,
                activeSessions,
                positionData,
                requestedBy,
                generatedAt: now,
            };
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'ANALYTICS_REQUESTED',
                entity: 'VotingAnalytics',
                newValues: {
                    timeframe,
                    position: position || null,
                    requestedBy,
                },
            },
        });
        return analytics;
    }
    groupVotesByHour(votes) {
        const grouped = new Map();
        votes.forEach(vote => {
            const hour = new Date(vote.createdAt);
            hour.setMinutes(0, 0, 0);
            const key = hour.toISOString();
            grouped.set(key, (grouped.get(key) || 0) + 1);
        });
        return Array.from(grouped.entries())
            .map(([hourStr, count]) => ({
            hour: new Date(hourStr),
            count,
        }))
            .sort((a, b) => a.hour.getTime() - b.hour.getTime());
    }
    async getSystemHealth() {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
        const health = await this.prisma.$transaction(async (tx) => {
            const dbConnected = true;
            const recentVotes = await tx.vote.count({
                where: {
                    createdAt: { gte: oneMinuteAgo },
                    isValid: true,
                },
            });
            const activeSessions = await tx.votingSession.count({
                where: {
                    status: 'ACTIVE',
                    expiresAt: { gt: now },
                },
            });
            const failedVotes = await tx.vote.count({
                where: {
                    createdAt: { gte: fiveMinutesAgo },
                    isValid: false,
                },
            });
            const cacheHealthy = await this.checkCacheHealth();
            return {
                database: {
                    connected: dbConnected,
                    responseTime: 'Good',
                },
                voting: {
                    recentActivity: recentVotes,
                    activeSessions,
                    failedVotes,
                },
                cache: {
                    healthy: cacheHealthy,
                    status: cacheHealthy ? 'Connected' : 'Disconnected',
                },
                realTime: {
                    connections: this.realTimeService.getConnectionStats(),
                },
                overall: 'HEALTHY',
                lastChecked: now,
            };
        });
        return health;
    }
    async checkCacheHealth() {
        try {
            const testKey = 'health_check_' + Date.now();
            await this.cacheService.set(testKey, 'test', 1);
            const retrieved = await this.cacheService.get(testKey);
            await this.cacheService.del(testKey);
            return retrieved === 'test';
        }
        catch (error) {
            return false;
        }
    }
    async getAnomalies() {
        return this.anomalyDetectionService.detectAnomalies();
    }
    async pauseVoting(reason, pausedBy) {
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_PAUSED' },
            update: {
                value: 'true',
                updatedAt: new Date(),
            },
            create: {
                key: 'VOTING_PAUSED',
                value: 'true',
                type: 'boolean',
            },
        });
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_PAUSE_REASON' },
            update: {
                value: reason,
                updatedAt: new Date(),
            },
            create: {
                key: 'VOTING_PAUSE_REASON',
                value: reason,
                type: 'string',
            },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'VOTING_PAUSED',
                entity: 'System',
                newValues: {
                    reason,
                    pausedBy,
                    timestamp: new Date(),
                },
            },
        });
        this.realTimeService.broadcast({
            type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
            data: {
                status: 'VOTING_PAUSED',
                reason,
                pausedBy,
                message: 'Voting has been temporarily paused by administrators',
                timestamp: new Date(),
            },
            timestamp: new Date(),
        });
    }
    async resumeVoting(reason, resumedBy) {
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_PAUSED' },
            update: {
                value: 'false',
                updatedAt: new Date(),
            },
            create: {
                key: 'VOTING_PAUSED',
                value: 'false',
                type: 'boolean',
            },
        });
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_RESUME_REASON' },
            update: {
                value: reason,
                updatedAt: new Date(),
            },
            create: {
                key: 'VOTING_RESUME_REASON',
                value: reason,
                type: 'string',
            },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'VOTING_RESUMED',
                entity: 'System',
                newValues: {
                    reason,
                    resumedBy,
                    timestamp: new Date(),
                },
            },
        });
        this.realTimeService.broadcast({
            type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
            data: {
                status: 'VOTING_RESUMED',
                reason,
                resumedBy,
                message: 'Voting has been resumed',
                timestamp: new Date(),
            },
            timestamp: new Date(),
        });
    }
    async getActiveSessions() {
        const now = new Date();
        const sessions = await this.prisma.votingSession.findMany({
            where: {
                status: 'ACTIVE',
                expiresAt: { gt: now },
            },
            select: {
                id: true,
                sessionId: true,
                voterHash: true,
                status: true,
                startTime: true,
                expiresAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        hasVoted: true,
                    },
                },
            },
            orderBy: { startTime: 'desc' },
        });
        return {
            activeSessions: sessions.map(session => ({
                sessionId: session.sessionId.slice(0, 8) + '***',
                voterHash: session.voterHash.slice(0, 8) + '***',
                voterName: session.user.name.split(' ')[0] + ' ***',
                status: session.status,
                startTime: session.startTime,
                expiresAt: session.expiresAt,
                timeRemaining: Math.max(0, session.expiresAt.getTime() - now.getTime()),
                hasVoted: session.user.hasVoted,
            })),
            totalActive: sessions.length,
            lastUpdated: now,
        };
    }
    async exportVotingData(options) {
        const { format, includePersonalData, exportedBy } = options;
        await this.prisma.auditLog.create({
            data: {
                action: 'DATA_EXPORT_REQUESTED',
                entity: 'VotingData',
                newValues: {
                    format,
                    includePersonalData,
                    exportedBy,
                    timestamp: new Date(),
                },
            },
        });
        const exportData = await this.prisma.$transaction(async (tx) => {
            const stats = await this.votingStatsService.getVotingProgress();
            const votes = await tx.vote.findMany({
                where: { isValid: true },
                select: {
                    id: true,
                    encryptedVote: includePersonalData,
                    voterHash: true,
                    submissionTime: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'asc' },
            });
            const candidates = await tx.candidate.findMany({
                where: { isActive: true },
                include: {
                    nomination: {
                        select: {
                            nomineeCollege: true,
                            nomineeDepartment: true,
                            nomineeProgramme: true,
                            nomineeLevel: true,
                        },
                    },
                },
                orderBy: [
                    { position: 'asc' },
                    { candidateNumber: 'asc' },
                ],
            });
            const userStats = await tx.user.groupBy({
                by: ['role', 'hasVoted'],
                _count: {
                    id: true,
                },
            });
            return {
                exportInfo: {
                    generatedBy: exportedBy,
                    generatedAt: new Date(),
                    format,
                    includesPersonalData: includePersonalData,
                    totalRecords: {
                        votes: votes.length,
                        candidates: candidates.length,
                        users: userStats.reduce((sum, stat) => sum + stat._count.id, 0),
                    },
                },
                votingStatistics: stats,
                votes: includePersonalData ? votes : votes.map(vote => ({
                    id: vote.id,
                    voterHash: vote.voterHash.slice(0, 8) + '***',
                    submissionTime: vote.submissionTime,
                    createdAt: vote.createdAt,
                })),
                candidates,
                userStatistics: userStats,
            };
        });
        if (format === 'csv') {
            return await this.generateCSVExport(exportData);
        }
        return exportData;
    }
    async generateCSVExport(data) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportDir = (0, path_1.join)(process.cwd(), 'exports');
        try {
            await fs_1.promises.mkdir(exportDir, { recursive: true });
        }
        catch (error) {
        }
        const files = [];
        const summaryPath = (0, path_1.join)(exportDir, `voting-summary-${timestamp}.csv`);
        const summaryWriter = csvWriter.createObjectCsvWriter({
            path: summaryPath,
            header: [
                { id: 'metric', title: 'Metric' },
                { id: 'value', title: 'Value' },
                { id: 'description', title: 'Description' }
            ]
        });
        const summaryData = [
            {
                metric: 'Total Votes',
                value: data.votingStatistics.totalVotes,
                description: 'Total number of valid votes cast'
            },
            {
                metric: 'Total Eligible Voters',
                value: data.votingStatistics.totalEligibleVoters,
                description: 'Total number of registered voters'
            },
            {
                metric: 'Turnout Percentage',
                value: `${data.votingStatistics.turnoutPercentage}%`,
                description: 'Percentage of eligible voters who voted'
            },
            {
                metric: 'Export Generated By',
                value: data.exportInfo.generatedBy,
                description: 'User who generated this export'
            },
            {
                metric: 'Export Generated At',
                value: data.exportInfo.generatedAt.toISOString(),
                description: 'Timestamp when export was generated'
            }
        ];
        await summaryWriter.writeRecords(summaryData);
        files.push(summaryPath);
        const candidatesPath = (0, path_1.join)(exportDir, `candidates-${timestamp}.csv`);
        const candidatesWriter = csvWriter.createObjectCsvWriter({
            path: candidatesPath,
            header: [
                { id: 'name', title: 'Candidate Name' },
                { id: 'position', title: 'Position' },
                { id: 'candidateNumber', title: 'Candidate Number' },
                { id: 'voteCount', title: 'Vote Count' },
                { id: 'college', title: 'College' },
                { id: 'department', title: 'Department' },
                { id: 'programme', title: 'Programme' },
                { id: 'level', title: 'Level' }
            ]
        });
        const candidatesData = data.candidates.map(candidate => ({
            name: candidate.name,
            position: candidate.position,
            candidateNumber: candidate.candidateNumber,
            voteCount: candidate.voteCount,
            college: candidate.nomination?.nomineeCollege || 'N/A',
            department: candidate.nomination?.nomineeDepartment || 'N/A',
            programme: candidate.nomination?.nomineeProgramme || 'N/A',
            level: candidate.nomination?.nomineeLevel || 'N/A'
        }));
        await candidatesWriter.writeRecords(candidatesData);
        files.push(candidatesPath);
        const positionsPath = (0, path_1.join)(exportDir, `position-stats-${timestamp}.csv`);
        const positionsWriter = csvWriter.createObjectCsvWriter({
            path: positionsPath,
            header: [
                { id: 'position', title: 'Position' },
                { id: 'totalVotes', title: 'Total Votes' },
                { id: 'candidateCount', title: 'Number of Candidates' },
                { id: 'leadingCandidate', title: 'Leading Candidate' },
                { id: 'leadingVotes', title: 'Leading Vote Count' },
                { id: 'isCompleted', title: 'Voting Completed' }
            ]
        });
        const positionsData = data.votingStatistics.positionStats.map(position => {
            const leadingCandidate = position.candidates.find(c => c.isLeading);
            return {
                position: position.position,
                totalVotes: position.totalVotes,
                candidateCount: position.candidates.length,
                leadingCandidate: leadingCandidate?.name || 'No votes yet',
                leadingVotes: leadingCandidate?.voteCount || 0,
                isCompleted: position.isCompleted ? 'Yes' : 'No'
            };
        });
        await positionsWriter.writeRecords(positionsData);
        files.push(positionsPath);
        if (data.exportInfo.includesPersonalData) {
            const votesPath = (0, path_1.join)(exportDir, `vote-records-${timestamp}.csv`);
            const votesWriter = csvWriter.createObjectCsvWriter({
                path: votesPath,
                header: [
                    { id: 'voteId', title: 'Vote ID' },
                    { id: 'voterHash', title: 'Voter Hash' },
                    { id: 'submissionTime', title: 'Submission Time' },
                    { id: 'createdAt', title: 'Created At' },
                    { id: 'hasEncryptedData', title: 'Has Encrypted Vote Data' }
                ]
            });
            const votesData = data.votes.map(vote => ({
                voteId: vote.id,
                voterHash: vote.voterHash,
                submissionTime: vote.submissionTime?.toISOString() || 'N/A',
                createdAt: vote.createdAt.toISOString(),
                hasEncryptedData: vote.encryptedVote ? 'Yes' : 'No'
            }));
            await votesWriter.writeRecords(votesData);
            files.push(votesPath);
        }
        const userStatsPath = (0, path_1.join)(exportDir, `user-statistics-${timestamp}.csv`);
        const userStatsWriter = csvWriter.createObjectCsvWriter({
            path: userStatsPath,
            header: [
                { id: 'role', title: 'User Role' },
                { id: 'hasVoted', title: 'Has Voted' },
                { id: 'count', title: 'Count' }
            ]
        });
        const userStatsData = data.userStatistics.map(stat => ({
            role: stat.role,
            hasVoted: stat.hasVoted ? 'Yes' : 'No',
            count: stat._count.id
        }));
        await userStatsWriter.writeRecords(userStatsData);
        files.push(userStatsPath);
        return {
            format: 'csv',
            files: files.map(filePath => ({
                name: filePath.split('/').pop() || filePath.split('\\').pop(),
                path: filePath,
                size: 'Generated'
            })),
            summary: {
                totalFiles: files.length,
                generatedAt: new Date(),
                includesPersonalData: data.exportInfo.includesPersonalData,
                exportedBy: data.exportInfo.generatedBy
            },
            downloadInstructions: [
                'CSV files have been generated in the exports directory',
                'Each file contains different aspects of the voting data',
                'Files are timestamped to prevent conflicts',
                'Personal data is only included if explicitly requested'
            ]
        };
    }
    async getVotingTimeline() {
        const timeline = await this.prisma.electionTimeline.findMany({
            orderBy: { startDate: 'asc' },
        });
        const now = new Date();
        const currentPhase = timeline.find(phase => phase.startDate <= now && phase.endDate >= now && phase.isActive);
        return {
            timeline: timeline.map(phase => ({
                phase: phase.phase,
                startDate: phase.startDate,
                endDate: phase.endDate,
                isActive: phase.isActive,
                isCurrent: phase.id === currentPhase?.id,
                status: phase.endDate < now ? 'COMPLETED' :
                    phase.startDate > now ? 'UPCOMING' : 'ACTIVE',
            })),
            currentPhase: currentPhase?.phase || 'UNKNOWN',
            nextPhase: timeline.find(phase => phase.startDate > now),
            lastUpdated: now,
        };
    }
    async getPublicDashboardData() {
        const stats = await this.votingStatsService.getVotingProgress();
        return {
            totalVotes: stats.totalVotes,
            turnoutPercentage: stats.turnoutPercentage,
            positionSummary: stats.positionStats.map(position => ({
                position: position.position,
                totalVotes: position.totalVotes,
                candidateCount: position.candidates.length,
            })),
            votingStatus: await this.getVotingStats(),
            lastUpdated: stats.lastUpdated,
            systemStatus: 'ACTIVE',
        };
    }
};
exports.VotingService = VotingService;
exports.VotingService = VotingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        db_1.PrismaService,
        cache_service_1.CacheService,
        real_time_service_1.RealTimeService,
        voting_stats_service_1.VotingStatsService,
        anomaly_detection_service_1.AnomalyDetectionService])
], VotingService);
//# sourceMappingURL=voting.service.js.map