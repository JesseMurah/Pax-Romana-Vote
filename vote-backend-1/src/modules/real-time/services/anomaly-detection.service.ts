import { AnomalyAlertDto } from "../dto/anomaly-alert.dto";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../../db";
import { CacheService } from "../../caches/cache.service";

@Injectable()
export class AnomalyDetectionService {
    private readonly logger = new Logger(AnomalyDetectionService.name);
    private readonly VOTING_SPIKE_THRESHOLD = 50; // votes per minute
    private readonly DUPLICATE_IP_THRESHOLD = 10; // attempts from same IP

    constructor(
        private prisma: PrismaService,
        private cacheService: CacheService,
    ) {}

    /**
     * Detect voting anomalies
     */
    async detectAnomalies(): Promise<AnomalyAlertDto[]> {
        const anomalies: AnomalyAlertDto[] = [];

        // Check for voting spikes
        const votingSpike = await this.detectVotingSpike();
        if (votingSpike) anomalies.push(votingSpike);

        // Check for suspicious IP patterns
        const suspiciousIPs = await this.detectSuspiciousIPActivity();
        anomalies.push(...suspiciousIPs);

        // Check for duplicate voting attempts
        const duplicateAttempts = await this.detectDuplicateVotingAttempts();
        anomalies.push(...duplicateAttempts);

        // Check system overload
        const systemOverload = await this.detectSystemOverload();
        if (systemOverload) anomalies.push(systemOverload);

        return anomalies;
    }

    /**
     * Detect unusual voting spikes
     */
    private async detectVotingSpike(): Promise<AnomalyAlertDto | null> {
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

    /**
     * Detect suspicious IP activity
     */
    private async detectSuspiciousIPActivity(): Promise<AnomalyAlertDto[]> {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000);

        // Group votes by IP address in the last hour
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
            type: 'SUSPICIOUS_PATTERN' as const,
            severity: 'MEDIUM' as const,
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

    /**
     * Detect duplicate voting attempts
     */
    private async detectDuplicateVotingAttempts(): Promise<AnomalyAlertDto[]> {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000);

        // Find users with multiple voting sessions in the last hour
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
            type: 'DUPLICATE_ATTEMPT' as const,
            severity: 'HIGH' as const,
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

    /**
     * Detect system overload
     */
    private async detectSystemOverload(): Promise<AnomalyAlertDto | null> {
        // Check active voting sessions
        const activeSessions = await this.prisma.votingSession.count({
            where: {
                status: 'ACTIVE',
                expiresAt: { gt: new Date() },
            },
        });

        const MAX_CONCURRENT_SESSIONS = 100; // Adjust based on your capacity

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

    /**
     * Check if anomaly detection should run (throttling)
     */
    async shouldRunDetection(): Promise<boolean> {
        const cacheKey = 'anomaly:last_check';
        const lastCheck = await this.cacheService.get(cacheKey);

        if (!lastCheck) {
            await this.cacheService.set(cacheKey, new Date(), 30); // Check every 30 seconds
            return true;
        }

        return false;
    }
}