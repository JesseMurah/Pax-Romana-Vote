import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../db';
import { CacheService } from '../../caches/cache.service';
import { RealTimeService } from '../../real-time/services/real-time.service';
import { VotingStatsService } from '../../real-time/services/voting-stats.service';
import { AnomalyDetectionService } from '../../real-time/services/anomaly-detection.service';
import { SseEventType } from '../../real-time/enums/sse-event-types.enum';
import { Candidate_Position } from '@prisma/client';
import * as csvWriter from 'csv-writer';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class VotingAdminService {
    private readonly logger = new Logger(VotingAdminService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly realTimeService: RealTimeService,
        private readonly votingStatsService: VotingStatsService,
        private readonly anomalyDetectionService: AnomalyDetectionService,
    ) {}

    async pauseVoting(reason: string, pausedBy: string): Promise<void> {
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_PAUSED' },
            update: { value: 'true', updatedAt: new Date() },
            create: { key: 'VOTING_PAUSED', value: 'true', type: 'boolean' },
        });
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_PAUSE_REASON' },
            update: { value: reason, updatedAt: new Date() },
            create: { key: 'VOTING_PAUSE_REASON', value: reason, type: 'string' },
        });
        await this.prisma.auditLog.create({
            data: { action: 'VOTING_PAUSED', entity: 'System', newValues: { reason, pausedBy, timestamp: new Date() } },
        });
        this.realTimeService.broadcast({
            type: SseEventType.SYSTEM_STATUS,
            data: { status: 'VOTING_PAUSED', reason, pausedBy, message: 'Voting has been temporarily paused by administrators', timestamp: new Date() },
            timestamp: new Date(),
        });
    }

    async resumeVoting(reason: string, resumedBy: string): Promise<void> {
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_PAUSED' },
            update: { value: 'false', updatedAt: new Date() },
            create: { key: 'VOTING_PAUSED', value: 'false', type: 'boolean' },
        });
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_RESUME_REASON' },
            update: { value: reason, updatedAt: new Date() },
            create: { key: 'VOTING_RESUME_REASON', value: reason, type: 'string' },
        });
        await this.prisma.auditLog.create({
            data: { action: 'VOTING_RESUMED', entity: 'System', newValues: { reason, resumedBy, timestamp: new Date() } },
        });
        this.realTimeService.broadcast({
            type: SseEventType.SYSTEM_STATUS,
            data: { status: 'VOTING_RESUMED', reason, resumedBy, message: 'Voting has been resumed', timestamp: new Date() },
            timestamp: new Date(),
        });
    }

    async getActiveSessions(): Promise<any> {
        const now = new Date();
        const sessions = await this.prisma.votingSession.findMany({
            where: { status: 'ACTIVE', expiresAt: { gt: now } },
            select: {
                id: true, sessionId: true, voterHash: true, status: true, startTime: true, expiresAt: true,
                user: { select: { name: true, email: true, hasVoted: true } },
            },
            orderBy: { startTime: 'desc' },
        });
        return {
            activeSessions: sessions.map((s) => ({
                sessionId: s.sessionId.slice(0, 8) + '***',
                voterHash: s.voterHash.slice(0, 8) + '***',
                voterName: s.user.name.split(' ')[0] + ' ***',
                status: s.status,
                startTime: s.startTime,
                expiresAt: s.expiresAt,
                timeRemaining: Math.max(0, s.expiresAt.getTime() - now.getTime()),
                hasVoted: s.user.hasVoted,
            })),
            totalActive: sessions.length,
            lastUpdated: now,
        };
    }

    async getAnomalies(): Promise<any> {
        return this.anomalyDetectionService.detectAnomalies();
    }

    async getSystemHealth(): Promise<any> {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

        return this.prisma.$transaction(async (tx) => {
            const recentVotes = await tx.vote.count({ where: { createdAt: { gte: oneMinuteAgo }, isValid: true } });
            const activeSessions = await tx.votingSession.count({ where: { status: 'ACTIVE', expiresAt: { gt: now } } });
            const failedVotes = await tx.vote.count({ where: { createdAt: { gte: fiveMinutesAgo }, isValid: false } });
            const cacheHealthy = await this.checkCacheHealth();
            return {
                database: { connected: true, responseTime: 'Good' },
                voting: { recentActivity: recentVotes, activeSessions, failedVotes },
                cache: { healthy: cacheHealthy, status: cacheHealthy ? 'Connected' : 'Disconnected' },
                realTime: { connections: this.realTimeService.getConnectionStats() },
                overall: 'HEALTHY',
                lastChecked: now,
            };
        });
    }

    async getVotingAnalytics(options: { timeframe: string; position?: Candidate_Position; requestedBy: string }): Promise<any> {
        const { timeframe, position, requestedBy } = options;
        const now = new Date();
        let startDate: Date;

        switch (timeframe) {
            case 'hour': startDate = new Date(now.getTime() - 60 * 60 * 1000); break;
            case 'day': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
            default: startDate = new Date(0);
        }

        const analytics = await this.prisma.$transaction(async (tx) => {
            const voteTimeline = await tx.vote.findMany({
                where: { createdAt: { gte: startDate }, isValid: true },
                select: { createdAt: true, voterHash: true },
                orderBy: { createdAt: 'asc' },
            });
            const hourlyBreakdown = this.groupVotesByHour(voteTimeline);
            const positionData = position ? await this.votingStatsService.getPositionStats(position) : null;
            const velocity = await this.votingStatsService.getVotingVelocity();
            const activeSessions = await tx.votingSession.count({ where: { status: 'ACTIVE', expiresAt: { gt: now } } });
            return { timeframe, dateRange: { from: startDate, to: now }, totalVotes: voteTimeline.length, hourlyBreakdown, velocity, activeSessions, positionData, requestedBy, generatedAt: now };
        });

        await this.prisma.auditLog.create({
            data: { action: 'ANALYTICS_REQUESTED', entity: 'VotingAnalytics', newValues: { timeframe, position: position || null, requestedBy } },
        });

        return analytics;
    }

    async exportVotingData(options: { format: string; includePersonalData: boolean; exportedBy: string }): Promise<any> {
        const { format, includePersonalData, exportedBy } = options;

        await this.prisma.auditLog.create({
            data: { action: 'DATA_EXPORT_REQUESTED', entity: 'VotingData', newValues: { format, includePersonalData, exportedBy, timestamp: new Date() } },
        });

        const exportData = await this.prisma.$transaction(async (tx) => {
            const stats = await this.votingStatsService.getVotingProgress();
            const votes = await tx.vote.findMany({
                where: { isValid: true },
                select: { id: true, encryptedVote: includePersonalData, voterHash: true, submissionTime: true, createdAt: true },
                orderBy: { createdAt: 'asc' },
            });
            const candidates = await tx.candidate.findMany({
                where: { isActive: true },
                include: { nomination: { select: { nomineeCollege: true, nomineeDepartment: true, nomineeProgramme: true, nomineeLevel: true } } },
                orderBy: [{ position: 'asc' }, { candidateNumber: 'asc' }],
            });
            const userStats = await tx.user.groupBy({ by: ['role', 'hasVoted'], _count: { id: true } });
            return {
                exportInfo: { generatedBy: exportedBy, generatedAt: new Date(), format, includesPersonalData: includePersonalData, totalRecords: { votes: votes.length, candidates: candidates.length, users: userStats.reduce((s, x) => s + x._count.id, 0) } },
                votingStatistics: stats,
                votes: includePersonalData ? votes : votes.map((v) => ({ id: v.id, voterHash: v.voterHash.slice(0, 8) + '***', submissionTime: v.submissionTime, createdAt: v.createdAt })),
                candidates,
                userStatistics: userStats,
            };
        });

        if (format === 'csv') return this.generateCSVExport(exportData);
        return exportData;
    }

    private groupVotesByHour(votes: Array<{ createdAt: Date }>): Array<{ hour: Date; count: number }> {
        const grouped = new Map<string, number>();
        votes.forEach((vote) => {
            const hour = new Date(vote.createdAt);
            hour.setMinutes(0, 0, 0);
            const key = hour.toISOString();
            grouped.set(key, (grouped.get(key) || 0) + 1);
        });
        return Array.from(grouped.entries())
            .map(([h, count]) => ({ hour: new Date(h), count }))
            .sort((a, b) => a.hour.getTime() - b.hour.getTime());
    }

    private async checkCacheHealth(): Promise<boolean> {
        try {
            const testKey = 'health_check_' + Date.now();
            await this.cacheService.set(testKey, 'test', 1);
            const retrieved = await this.cacheService.get(testKey);
            await this.cacheService.del(testKey);
            return retrieved === 'test';
        } catch {
            return false;
        }
    }

    private async generateCSVExport(data: any): Promise<any> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportDir = join(process.cwd(), 'exports');
        await fs.mkdir(exportDir, { recursive: true });
        const files: string[] = [];

        const summaryPath = join(exportDir, `voting-summary-${timestamp}.csv`);
        await csvWriter.createObjectCsvWriter({
            path: summaryPath,
            header: [{ id: 'metric', title: 'Metric' }, { id: 'value', title: 'Value' }, { id: 'description', title: 'Description' }],
        }).writeRecords([
            { metric: 'Total Votes', value: data.votingStatistics.totalVotes, description: 'Total valid votes cast' },
            { metric: 'Turnout Percentage', value: `${data.votingStatistics.turnoutPercentage}%`, description: 'Percentage of eligible voters who voted' },
            { metric: 'Export Generated By', value: data.exportInfo.generatedBy, description: 'User who generated this export' },
            { metric: 'Export Generated At', value: data.exportInfo.generatedAt.toISOString(), description: 'Timestamp of export' },
        ]);
        files.push(summaryPath);

        const candidatesPath = join(exportDir, `candidates-${timestamp}.csv`);
        await csvWriter.createObjectCsvWriter({
            path: candidatesPath,
            header: [
                { id: 'name', title: 'Candidate Name' }, { id: 'position', title: 'Position' },
                { id: 'candidateNumber', title: 'Candidate Number' }, { id: 'voteCount', title: 'Vote Count' },
                { id: 'college', title: 'College' }, { id: 'department', title: 'Department' },
            ],
        }).writeRecords(data.candidates.map((c) => ({
            name: c.name, position: c.position, candidateNumber: c.candidateNumber, voteCount: c.voteCount,
            college: c.nomination?.nomineeCollege || 'N/A', department: c.nomination?.nomineeDepartment || 'N/A',
        })));
        files.push(candidatesPath);

        return {
            format: 'csv',
            files: files.map((p) => ({ name: p.split('/').pop(), path: p })),
            summary: { totalFiles: files.length, generatedAt: new Date(), includesPersonalData: data.exportInfo.includesPersonalData, exportedBy: data.exportInfo.generatedBy },
        };
    }
}
