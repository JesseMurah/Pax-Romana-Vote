import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {PrismaService} from "../../../db";
import {CacheService} from "../caches/cache.service";
import { HttpService } from '@nestjs/axios';
import {GenerateOtpDto} from "./dto/generate-otp.dto";
import {firstValueFrom} from "rxjs";
import {VerifyOtpDto} from "./dto/verify-otp.dto";
import { createHash } from 'crypto';
import * as CryptoJS from 'crypto-js';
import {SubmitVoteDto} from "./dto/submit-vote.dto";

// ========== REAL-TIME IMPORTS ==========
import { RealTimeService } from '../real-time/services/real-time.service';
import { VotingStatsService } from '../real-time/services/voting-stats.service';
import { AnomalyDetectionService } from '../real-time/services/anomaly-detection.service';
import { SseEventType } from '../real-time/enums/sse-event-types.enum';
import { UserRole } from '@prisma/client';
import {Candidate_Position} from "@prisma/client/index";

import * as csvWriter from 'csv-writer';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class VotingService {
    private readonly encryptionKey: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        // ========== REAL-TIME SERVICES ==========
        private readonly realTimeService: RealTimeService,
        private readonly votingStatsService: VotingStatsService,
        private readonly anomalyDetectionService: AnomalyDetectionService,
    ) {
        this.encryptionKey = this.configService.get('VOTE_ENCRYPTION_KEY') || '3041a8efad5e974cc27bc09cf57c8ad8555f80958f4c1d27b7f4d68d5b3c8de6';
    }

    // ========== OTP GENERATION ==========
    async generateOtp(dto: GenerateOtpDto): Promise<any> {
        const { phoneNumber, name, email } = dto;

        // Check if user already voted
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser?.hasVoted) {
            throw new ConflictException('You have already voted in this election');
        }

        const apiKey = this.configService.get('ARKESEL_API_KEY');
        if (!apiKey) {
            throw new BadRequestException('SMS service is not configured');
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
            const response = await firstValueFrom(
                this.httpService.post(
                    'https://sms.arkesel.com/api/otp/generate',
                    data,
                    {
                        headers: { 'api-key': apiKey },
                    },
                ),
            );

            if (response.data.code === '1000') {
                // Store OTP request in cache (5 minutes)
                await this.cacheService.setSmsCode(phoneNumber, JSON.stringify({
                    name,
                    email,
                    timestamp: Date.now(),
                    status: 'PENDING'
                }));

                // ========== REAL-TIME: Broadcast OTP generation to admins ==========
                this.realTimeService.broadcastToAdmins({
                    type: SseEventType.SYSTEM_STATUS,
                    data: {
                        action: 'OTP_GENERATED',
                        phoneNumber: phoneNumber.slice(-4), // Only last 4 digits for privacy
                        email: email.split('@')[0] + '@***', // Masked email
                        timestamp: new Date(),
                    },
                    timestamp: new Date(),
                });

                return {
                    message: 'OTP sent successfully to ' + phoneNumber,
                    ussd_code: response.data.ussd_code,
                    expiresIn: '5 minutes'
                };
            } else {
                throw new BadRequestException(`Failed to generate OTP: ${response.data.message}`);
            }
        } catch (error) {
            // ========== REAL-TIME: Broadcast OTP error to admins ==========
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'OTP_GENERATION_FAILED',
                    phoneNumber: phoneNumber.slice(-4),
                    error: error.message,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });

            if (error.response?.status === 401) {
                throw new BadRequestException('SMS service authentication failed');
            }
            throw new BadRequestException(`Error generating OTP: ${error.message}`);
        }
    }

    // ========== OTP VERIFICATION ==========
    async verifyOtp(dto: VerifyOtpDto): Promise<any> {
        const { phoneNumber, otp, email } = dto;

        // Verify with Arkesel
        const apiKey = this.configService.get('ARKESEL_API_KEY');
        const data = { number: phoneNumber, otp };

        try {
            const response = await firstValueFrom(
                this.httpService.post('https://sms.arkesel.com/api/otp/verify', data, {
                    headers: { 'api-key': apiKey },
                }),
            );

            if (response.data.code !== '1000') {
                // ========== REAL-TIME: Broadcast failed OTP verification ==========
                this.realTimeService.broadcastToAdmins({
                    type: SseEventType.SYSTEM_STATUS,
                    data: {
                        action: 'OTP_VERIFICATION_FAILED',
                        phoneNumber: phoneNumber.slice(-4),
                        reason: 'Invalid or expired OTP',
                        timestamp: new Date(),
                    },
                    timestamp: new Date(),
                });

                throw new BadRequestException('Invalid or expired OTP');
            }

            // Get cached OTP data
            const cachedData = await this.cacheService.getSmsCode(phoneNumber);
            if (!cachedData) {
                throw new NotFoundException('OTP session not found or expired');
            }

            const otpData = JSON.parse(cachedData);
            if (otpData.email !== email) {
                throw new BadRequestException('Email mismatch with OTP request');
            }

            // Create or update user
            const phoneHash = createHash('sha256').update(phoneNumber).digest('hex');

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
            } else if (user.hasVoted) {
                throw new ConflictException('You have already voted in this election');
            }

            // Create a voting session
            const sessionId = createHash('sha256')
                .update(`${phoneNumber}_${Date.now()}_${Math.random()}`)
                .digest('hex');

            const votingSession = await this.prisma.votingSession.create({
                data: {
                    sessionId,
                    voterHash: phoneHash,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
                },
            });

            // Cache the session
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

            // Clear OTP from cache
            await this.cacheService.clearSmsCode(phoneNumber);

            // ========== REAL-TIME: Broadcast successful login ==========
            const connectionStats = this.realTimeService.getConnectionStats();
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'VOTER_LOGIN_SUCCESS',
                    voterName: user.name.split(' ')[0] + ' ***', // Partial name for privacy
                    sessionId: sessionId.slice(0, 8) + '***', // Partial session ID
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
        } catch (error) {
            throw new BadRequestException(`Error verifying OTP: ${error.message}`);
        }
    }

    // ========== GET BALLOT ==========
    async getBallot(): Promise<any> {
        // Check cache first
        const cachedBallot = await this.cacheService.getBallot();
        if (cachedBallot) {
            return cachedBallot;
        }

        // Query candidates from database
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

        // Group by position
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

        // Cache the complete ballot response for 30 minutes
        await this.cacheService.setBallot(ballotResponse);

        return ballotResponse;
    }

    // ========== SUBMIT VOTE ==========
    async submitVote(dto: SubmitVoteDto): Promise<any> {
        const { sessionId, votes } = dto;

        // Validate session
        const session = await this.prisma.votingSession.findUnique({
            where: { sessionId },
            include: { user: true },
        });

        if (!session) {
            throw new NotFoundException('Invalid voting session');
        }

        if (session.expiresAt < new Date()) {
            throw new ForbiddenException('Voting session has expired');
        }

        if (session.user.hasVoted) {
            throw new ConflictException('You have already submitted your vote');
        }

        // Validate candidates exist
        const candidateIds = Object.values(votes);
        const validCandidates = await this.prisma.candidate.findMany({
            where: {
                id: { in: candidateIds },
                isActive: true,
            },
        });

        if (validCandidates.length !== candidateIds.length) {
            throw new BadRequestException('One or more selected candidates are invalid');
        }

        try {
            // Encrypt vote data
            const encryptedVote = CryptoJS.AES.encrypt(
                JSON.stringify(votes),
                this.encryptionKey,
            ).toString();

            // Submit a vote in transaction
            const result = await this.prisma.$transaction(async (tx) => {
                // Create vote record
                const vote = await tx.vote.create({
                    data: {
                        encryptedVote,
                        voterHash: session.voterHash,
                        sessionId: session.id,
                    },
                });

                // Update user as voted
                await tx.user.update({
                    where: { id: session.userId },
                    data: {
                        hasVoted: true,
                        // inkVerified: true, // Will be manually verified
                    },
                });

                // Update session status
                await tx.votingSession.update({
                    where: { id: session.id },
                    data: {
                        status: 'COMPLETED',
                        endTime: new Date(),
                    },
                });

                // Increment candidate vote counts (for quick stats)
                for (const candidateId of candidateIds) {
                    await tx.candidate.update({
                        where: { id: candidateId },
                        data: { voteCount: { increment: 1 } },
                    });
                }

                return vote;
            });

            // ========== REAL-TIME INTEGRATION - VOTE SUBMITTED ==========

            // 1. Clear voting statistics cache to force refresh
            await this.votingStatsService.clearStatsCache();

            // 2. Get updated voting statistics
            const updatedStats = await this.votingStatsService.getVotingProgress();

            // 3. Broadcast progress update to ALL connected clients (public stream)
            this.realTimeService.broadcast({
                type: SseEventType.VOTING_PROGRESS,
                data: {
                    totalVotes: updatedStats.totalVotes,
                    turnoutPercentage: updatedStats.turnoutPercentage,
                    lastUpdated: new Date(),
                },
                timestamp: new Date(),
            });

            // 4. Send detailed statistics to ADMIN streams
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.POSITION_UPDATE,
                data: {
                    voteEvent: {
                        voteId: result.id,
                        timestamp: result.createdAt,
                        positionsVoted: Object.keys(votes).length,
                        voterHash: session.voterHash.slice(0, 8) + '***', // Partial hash for privacy
                    },
                    updatedStatistics: updatedStats,
                    velocityData: await this.votingStatsService.getVotingVelocity(),
                },
                timestamp: new Date(),
            });

            // 5. Send position-specific updates to admins
            const votedPositions = Object.keys(votes);
            for (const position of votedPositions) {
                const positionStats = await this.votingStatsService.getPositionStats(position as any);

                this.realTimeService.broadcastToAdmins({
                    type: SseEventType.POSITION_UPDATE,
                    data: {
                        position,
                        stats: positionStats,
                        lastVoteTime: new Date(),
                    },
                    timestamp: new Date(),
                });
            }

            // 6. Check for anomalies and send alerts if needed
            if (await this.anomalyDetectionService.shouldRunDetection()) {
                try {
                    const anomalies = await this.anomalyDetectionService.detectAnomalies();

                    if (anomalies.length > 0) {
                        // Send anomaly alerts to SUPER_ADMIN only
                        this.realTimeService.broadcastToRole({
                            type: SseEventType.ANOMALY_ALERT,
                            data: {
                                anomalies,
                                triggeredBy: 'VOTE_SUBMISSION',
                                voteId: result.id
                            },
                            timestamp: new Date(),
                        }, UserRole.SUPER_ADMIN);
                    }
                } catch (anomalyError) {
                    // Log anomaly detection error but don't fail the vote
                    console.error('Anomaly detection failed:', anomalyError);
                }
            }

            // 7. Broadcast system status update
            const connectionStats = this.realTimeService.getConnectionStats();
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'VOTE_SUBMITTED_SUCCESS',
                    totalVotes: updatedStats.totalVotes,
                    turnoutPercentage: updatedStats.turnoutPercentage,
                    activeConnections: connectionStats.totalConnections,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });

            // ========== END REAL-TIME INTEGRATION ==========

            // Clear session from cache
            await this.cacheService.deleteVotingSession(session.voterHash);

            // Log successful vote
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

        } catch (error) {
            // ========== REAL-TIME: Broadcast vote submission error ==========
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'VOTE_SUBMISSION_FAILED',
                    sessionId: sessionId.slice(0, 8) + '***',
                    error: error.message,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });

            throw new BadRequestException(`Error submitting vote: ${error.message}`);
        }
    }

    // ========== GET VOTING STATS (ENHANCED WITH REAL-TIME) ==========
    async getVotingStats(): Promise<any> {
        // Use the real-time voting stats service for consistency
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
        } catch (error) {
            // Fallback to original stats method if real-time service fails
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

    // ========== VALIDATE SESSION (ENHANCED WITH REAL-TIME) ==========
    async validateSession(sessionId: string): Promise<any> {
        const session = await this.prisma.votingSession.findUnique({
            where: { sessionId },
            include: { user: true },
        });

        if (!session) {
            // ========== REAL-TIME: Broadcast invalid session attempt ==========
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'INVALID_SESSION_ACCESS',
                    sessionId: sessionId.slice(0, 8) + '***',
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });

            throw new NotFoundException('Session not found');
        }

        if (session.expiresAt < new Date()) {
            // ========== REAL-TIME: Broadcast expired session ==========
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'EXPIRED_SESSION_ACCESS',
                    sessionId: sessionId.slice(0, 8) + '***',
                    userId: session.user.id,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });

            throw new ForbiddenException('Session expired');
        }

        if (session.user.hasVoted) {
            throw new ConflictException('User has already voted');
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

    // ========== NEW REAL-TIME METHODS ==========

    /**
     * Trigger manual statistics refresh and broadcast
     */
    async refreshAndBroadcastStats(): Promise<void> {
        try {
            await this.votingStatsService.clearStatsCache();
            const updatedStats = await this.votingStatsService.getVotingProgress();

            // Broadcast to all clients
            this.realTimeService.broadcast({
                type: SseEventType.VOTING_PROGRESS,
                data: updatedStats,
                timestamp: new Date(),
            });

            // Send detailed stats to admins
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'MANUAL_STATS_REFRESH',
                    statistics: updatedStats,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
        } catch (error) {
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'STATS_REFRESH_FAILED',
                    error: error.message,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
        }
    }

    /**
     * Get real-time connection information
     */
    async getRealtimeConnectionInfo(): Promise<any> {
        const connectionStats = this.realTimeService.getConnectionStats();
        const votingStats = await this.votingStatsService.getVotingProgress();

        return {
            connections: connectionStats,
            votingProgress: votingStats,
            systemStatus: 'HEALTHY',
            lastUpdated: new Date(),
        };
    }

    /**
     * Broadcast a custom message to a specific role
     */
    async broadcastMessage(message: string, role: UserRole, type: SseEventType = SseEventType.SYSTEM_STATUS): Promise<void> {
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


    /**
     * Get position-specific statistics
     */
    async getPositionStats(position: Candidate_Position): Promise<any> {
        return this.votingStatsService.getPositionStats(position);
    }

    /**
     * Get voting velocity data
     */
    async getVotingVelocity(): Promise<any> {
        return this.votingStatsService.getVotingVelocity();
    }

    /**
     * Get detailed voting analytics
     */
    async getVotingAnalytics(options: {
        timeframe: string;
        position?: Candidate_Position;
        requestedBy: string;
    }): Promise<any> {
        const { timeframe, position, requestedBy } = options;

        let startDate: Date;
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
            // Vote distribution over time
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

            // Group votes by hour
            const hourlyBreakdown = this.groupVotesByHour(voteTimeline);

            // Position-specific data if requested
            let positionData = null;
            if (position) {
                //@ts-ignore
                positionData = await this.votingStatsService.getPositionStats(position);
            }

            // Velocity calculations
            const velocity = await this.votingStatsService.getVotingVelocity();

            // Active sessions
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

        // Log analytics request
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

    /**
     * Group votes by hour for timeline analysis
     */
    private groupVotesByHour(votes: Array<{ createdAt: Date }>): Array<{ hour: Date; count: number }> {
        const grouped = new Map<string, number>();

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

    /**
     * Get system health information
     */
    async getSystemHealth(): Promise<any> {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

        const health = await this.prisma.$transaction(async (tx) => {
            // Database connectivity (this query succeeds if DB is connected)
            const dbConnected = true;

            // Recent vote activity
            const recentVotes = await tx.vote.count({
                where: {
                    createdAt: { gte: oneMinuteAgo },
                    isValid: true,
                },
            });

            // Active sessions
            const activeSessions = await tx.votingSession.count({
                where: {
                    status: 'ACTIVE',
                    expiresAt: { gt: now },
                },
            });

            // Failed votes (if you track them)
            const failedVotes = await tx.vote.count({
                where: {
                    createdAt: { gte: fiveMinutesAgo },
                    isValid: false,
                },
            });

            // Cache health (basic check)
            const cacheHealthy = await this.checkCacheHealth();

            return {
                database: {
                    connected: dbConnected,
                    responseTime: 'Good', // You could measure actual response time
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
                overall: 'HEALTHY', // Could be calculated based on thresholds
                lastChecked: now,
            };
        });

        return health;
    }

    /**
     * Check cache health
     */
    private async checkCacheHealth(): Promise<boolean> {
        try {
            const testKey = 'health_check_' + Date.now();
            await this.cacheService.set(testKey, 'test', 1);
            const retrieved = await this.cacheService.get(testKey);
            await this.cacheService.del(testKey);
            return retrieved === 'test';
        } catch (error) {
            return false;
        }
    }

    /**
     * Get anomaly detection results
     */
    async getAnomalies(): Promise<any> {
        return this.anomalyDetectionService.detectAnomalies();
    }

    /**
     * Emergency pause voting
     */
    async pauseVoting(reason: string, pausedBy: string): Promise<void> {
        // Update system config to pause voting
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

        // Store pause reason
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

        // Log the action
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

        // Broadcast emergency pause to all clients
        this.realTimeService.broadcast({
            type: SseEventType.SYSTEM_STATUS,
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

    /**
     * Emergency resume voting
     */
    async resumeVoting(reason: string, resumedBy: string): Promise<void> {
        // Update system config to resume voting
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

        // Store resume reason
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

        // Log the action
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

        // Broadcast resume to all clients
        this.realTimeService.broadcast({
            type: SseEventType.SYSTEM_STATUS,
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

    /**
     * Get active voting sessions
     */
    async getActiveSessions(): Promise<any> {
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
                sessionId: session.sessionId.slice(0, 8) + '***', // Partial for privacy
                voterHash: session.voterHash.slice(0, 8) + '***',
                voterName: session.user.name.split(' ')[0] + ' ***', // First name only
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

    /**
     * Export voting data with proper CSV formatting
     */
    async exportVotingData(options: {
        format: string;
        includePersonalData: boolean;
        exportedBy: string;
    }): Promise<any> {
        const { format, includePersonalData, exportedBy } = options;

        // Log export request
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
            // Basic voting statistics
            const stats = await this.votingStatsService.getVotingProgress();

            // Vote records (encrypted, without personal data)
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

            // Candidate information
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

            // User statistics (anonymized unless personal data included)
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
            // Generate CSV files and return file paths
            return await this.generateCSVExport(exportData);
        }

        return exportData;
    }

    /**
     * Generate CSV export using csv-writer library
     */
    private async generateCSVExport(data: any): Promise<any> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportDir = join(process.cwd(), 'exports');

        // Ensure export directory exists
        try {
            await fs.mkdir(exportDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        const files: string[] = [];

        // 1. Export Summary CSV
        const summaryPath = join(exportDir, `voting-summary-${timestamp}.csv`);
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

        // 2. Export Candidates CSV
        const candidatesPath = join(exportDir, `candidates-${timestamp}.csv`);
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

        // 3. Export Position Statistics CSV
        const positionsPath = join(exportDir, `position-stats-${timestamp}.csv`);
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

        // 4. Export Vote Records CSV (if personal data included)
        if (data.exportInfo.includesPersonalData) {
            const votesPath = join(exportDir, `vote-records-${timestamp}.csv`);
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

        // 5. Export User Statistics CSV
        const userStatsPath = join(exportDir, `user-statistics-${timestamp}.csv`);
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
                size: 'Generated' // You could get actual file size if needed
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

    /**
     * Get voting timeline and milestones
     */
    async getVotingTimeline(): Promise<any> {
        const timeline = await this.prisma.electionTimeline.findMany({
            orderBy: { startDate: 'asc' },
        });

        const now = new Date();
        const currentPhase = timeline.find(phase =>
            phase.startDate <= now && phase.endDate >= now && phase.isActive
        );

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

    /**
     * Get public dashboard data (filtered for public consumption)
     */
    async getPublicDashboardData(): Promise<any> {
        const stats = await this.votingStatsService.getVotingProgress();

        // Filter sensitive information for public view
        return {
            totalVotes: stats.totalVotes,
            turnoutPercentage: stats.turnoutPercentage,
            positionSummary: stats.positionStats.map(position => ({
                position: position.position,
                totalVotes: position.totalVotes,
                candidateCount: position.candidates.length,
                // Don't include individual candidate vote counts for public
            })),
            votingStatus: await this.getVotingStats(),
            lastUpdated: stats.lastUpdated,
            systemStatus: 'ACTIVE', // Basic status for public
        };
    }
}