import { Test, TestingModule } from '@nestjs/testing';
import { VotingAdminService } from './voting-admin.service';
import { PrismaService } from '../../../../db';
import { CacheService } from '../../caches/cache.service';
import { RealTimeService } from '../../real-time/services/real-time.service';
import { VotingStatsService } from '../../real-time/services/voting-stats.service';
import { AnomalyDetectionService } from '../../real-time/services/anomaly-detection.service';

const mockPrisma = {
    systemConfig: { upsert: jest.fn() },
    auditLog: { create: jest.fn() },
    votingSession: { findMany: jest.fn(), count: jest.fn() },
    vote: { findMany: jest.fn(), count: jest.fn() },
    candidate: { findMany: jest.fn() },
    user: { groupBy: jest.fn() },
    $transaction: jest.fn(),
};
const mockCacheService = { set: jest.fn(), get: jest.fn(), del: jest.fn() };
const mockRealTimeService = {
    broadcast: jest.fn(),
    broadcastToAdmins: jest.fn(),
    getConnectionStats: jest.fn().mockReturnValue({ totalConnections: 2 }),
};
const mockVotingStatsService = {
    getVotingProgress: jest.fn(),
    getVotingVelocity: jest.fn(),
    getPositionStats: jest.fn(),
};
const mockAnomalyService = { detectAnomalies: jest.fn() };

describe('VotingAdminService', () => {
    let service: VotingAdminService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VotingAdminService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: CacheService, useValue: mockCacheService },
                { provide: RealTimeService, useValue: mockRealTimeService },
                { provide: VotingStatsService, useValue: mockVotingStatsService },
                { provide: AnomalyDetectionService, useValue: mockAnomalyService },
            ],
        }).compile();
        service = module.get<VotingAdminService>(VotingAdminService);
        jest.clearAllMocks();
    });

    describe('pauseVoting', () => {
        it('upserts VOTING_PAUSED=true and broadcasts pause event', async () => {
            mockPrisma.systemConfig.upsert.mockResolvedValue({});
            mockPrisma.auditLog.create.mockResolvedValue({});

            await service.pauseVoting('Suspicious activity', 'admin@test.com');

            expect(mockPrisma.systemConfig.upsert).toHaveBeenCalledWith(
                expect.objectContaining({ where: { key: 'VOTING_PAUSED' }, update: expect.objectContaining({ value: 'true' }) }),
            );
            expect(mockRealTimeService.broadcast).toHaveBeenCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ status: 'VOTING_PAUSED' }) }),
            );
        });
    });

    describe('resumeVoting', () => {
        it('upserts VOTING_PAUSED=false and broadcasts resume event', async () => {
            mockPrisma.systemConfig.upsert.mockResolvedValue({});
            mockPrisma.auditLog.create.mockResolvedValue({});

            await service.resumeVoting('Issue resolved', 'admin@test.com');

            expect(mockPrisma.systemConfig.upsert).toHaveBeenCalledWith(
                expect.objectContaining({ update: expect.objectContaining({ value: 'false' }) }),
            );
            expect(mockRealTimeService.broadcast).toHaveBeenCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ status: 'VOTING_RESUMED' }) }),
            );
        });
    });

    describe('getActiveSessions', () => {
        it('returns masked session data with privacy redaction', async () => {
            mockPrisma.votingSession.findMany.mockResolvedValue([
                {
                    id: 's1', sessionId: 'abc123456789', voterHash: 'hash12345678',
                    status: 'ACTIVE', startTime: new Date(), expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                    user: { name: 'John Doe', email: 'john@test.com', hasVoted: false },
                },
            ]);

            const result = await service.getActiveSessions();

            expect(result.totalActive).toBe(1);
            expect(result.activeSessions[0].sessionId).toMatch(/\*\*\*$/);
            expect(result.activeSessions[0].voterName).not.toContain('Doe');
        });
    });

    describe('getAnomalies', () => {
        it('delegates to anomaly detection service', async () => {
            mockAnomalyService.detectAnomalies.mockResolvedValue([{ type: 'BURST', count: 50 }]);

            const result = await service.getAnomalies();

            expect(mockAnomalyService.detectAnomalies).toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });
    });

    describe('getSystemHealth', () => {
        it('returns health object with all expected keys', async () => {
            // getSystemHealth uses $transaction — implement it to call the callback with a tx proxy
            mockPrisma.$transaction.mockImplementation(async (fn: any) => {
                const tx = {
                    vote: { count: jest.fn().mockResolvedValue(5) },
                    votingSession: { count: jest.fn().mockResolvedValue(2) },
                };
                return fn(tx);
            });
            mockCacheService.set.mockResolvedValue(undefined);
            mockCacheService.get.mockResolvedValue('test');
            mockCacheService.del.mockResolvedValue(undefined);

            const result = await service.getSystemHealth();

            expect(result).toHaveProperty('database');
            expect(result).toHaveProperty('voting');
            expect(result).toHaveProperty('cache');
            expect(result).toHaveProperty('realTime');
            expect(result.overall).toBe('HEALTHY');
        });
    });
});
