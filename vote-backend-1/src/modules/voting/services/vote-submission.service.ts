import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import { PrismaService } from '../../../../db';
import { CacheService } from '../../caches/cache.service';
import { RealTimeService } from '../../real-time/services/real-time.service';
import { VotingStatsService } from '../../real-time/services/voting-stats.service';
import { AnomalyDetectionService } from '../../real-time/services/anomaly-detection.service';
import { SseEventType } from '../../real-time/enums/sse-event-types.enum';
import { UserRole } from '@prisma/client';
import { SubmitVoteDto } from '../dto/submit-vote.dto';

@Injectable()
export class VoteSubmissionService {
    private readonly logger = new Logger(VoteSubmissionService.name);
    private readonly encryptionKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly realTimeService: RealTimeService,
        private readonly votingStatsService: VotingStatsService,
        private readonly anomalyDetectionService: AnomalyDetectionService,
    ) {
        this.encryptionKey =
            this.configService.get('VOTE_ENCRYPTION_KEY') ||
            '3041a8efad5e974cc27bc09cf57c8ad8555f80958f4c1d27b7f4d68d5b3c8de6';
    }

    async getBallot(): Promise<any> {
        const cachedBallot = await this.cacheService.getBallot();
        if (cachedBallot) return cachedBallot;

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
            orderBy: [{ position: 'asc' }, { candidateNumber: 'asc' }],
        });

        const ballot = candidates.reduce((acc, candidate) => {
            const position = candidate.position;
            if (!acc[position]) acc[position] = [];
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
                "You can skip positions you don't want to vote for",
                'Review your selections before submitting',
                'Once submitted, your vote cannot be changed',
            ],
        };

        await this.cacheService.setBallot(ballotResponse);
        return ballotResponse;
    }

    async validateSession(sessionId: string): Promise<any> {
        const session = await this.prisma.votingSession.findUnique({
            where: { sessionId },
            include: { user: true },
        });

        if (!session) {
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: { action: 'INVALID_SESSION_ACCESS', sessionId: sessionId.slice(0, 8) + '***', timestamp: new Date() },
                timestamp: new Date(),
            });
            throw new NotFoundException('Session not found');
        }

        if (session.expiresAt < new Date()) {
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: { action: 'EXPIRED_SESSION_ACCESS', sessionId: sessionId.slice(0, 8) + '***', userId: session.user.id, timestamp: new Date() },
                timestamp: new Date(),
            });
            throw new ForbiddenException('Session expired');
        }

        if (session.user.hasVoted) {
            throw new ConflictException('User has already voted');
        }

        return {
            valid: true,
            user: { name: session.user.name, email: session.user.email },
            expiresAt: session.expiresAt,
            timeRemaining: Math.max(0, session.expiresAt.getTime() - Date.now()),
        };
    }

    async submitVote(dto: SubmitVoteDto): Promise<any> {
        const { sessionId, votes } = dto;

        const session = await this.prisma.votingSession.findUnique({
            where: { sessionId },
            include: { user: true },
        });

        if (!session) throw new NotFoundException('Invalid voting session');
        if (session.expiresAt < new Date()) throw new ForbiddenException('Voting session has expired');
        if (session.user.hasVoted) throw new ConflictException('You have already submitted your vote');

        const candidateIds = Object.values(votes) as string[];
        const validCandidates = await this.prisma.candidate.findMany({
            where: { id: { in: candidateIds }, isActive: true },
        });

        if (validCandidates.length !== candidateIds.length) {
            throw new BadRequestException('One or more selected candidates are invalid');
        }

        try {
            const encryptedVote = CryptoJS.AES.encrypt(
                JSON.stringify(votes),
                this.encryptionKey,
            ).toString();

            const result = await this.prisma.$transaction(async (tx) => {
                const vote = await tx.vote.create({
                    data: { encryptedVote, voterHash: session.voterHash, sessionId: session.id },
                });
                await tx.user.update({ where: { id: session.userId }, data: { hasVoted: true } });
                await tx.votingSession.update({
                    where: { id: session.id },
                    data: { status: 'COMPLETED', endTime: new Date() },
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
                type: SseEventType.VOTING_PROGRESS,
                data: { totalVotes: updatedStats.totalVotes, turnoutPercentage: updatedStats.turnoutPercentage, lastUpdated: new Date() },
                timestamp: new Date(),
            });

            this.realTimeService.broadcastToAdmins({
                type: SseEventType.POSITION_UPDATE,
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

            for (const position of Object.keys(votes)) {
                const positionStats = await this.votingStatsService.getPositionStats(position as any);
                this.realTimeService.broadcastToAdmins({
                    type: SseEventType.POSITION_UPDATE,
                    data: { position, stats: positionStats, lastVoteTime: new Date() },
                    timestamp: new Date(),
                });
            }

            if (await this.anomalyDetectionService.shouldRunDetection()) {
                try {
                    const anomalies = await this.anomalyDetectionService.detectAnomalies();
                    if (anomalies.length > 0) {
                        this.realTimeService.broadcastToRole({
                            type: SseEventType.ANOMALY_ALERT,
                            data: { anomalies, triggeredBy: 'VOTE_SUBMISSION', voteId: result.id },
                            timestamp: new Date(),
                        }, UserRole.SUPER_ADMIN);
                    }
                } catch (anomalyError) {
                    this.logger.error('Anomaly detection failed', anomalyError);
                }
            }

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

            await this.cacheService.deleteVotingSession(session.voterHash);
            await this.prisma.auditLog.create({
                data: {
                    action: 'VOTE_SUBMITTED',
                    entity: 'Vote',
                    entityId: result.id,
                    userId: session.userId,
                    newValues: { positions: Object.keys(votes).length, timestamp: new Date() },
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
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: { action: 'VOTE_SUBMISSION_FAILED', sessionId: sessionId.slice(0, 8) + '***', error: error.message, timestamp: new Date() },
                timestamp: new Date(),
            });
            throw new BadRequestException(`Error submitting vote: ${error.message}`);
        }
    }
}
