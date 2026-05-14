import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VoteSubmissionService } from './vote-submission.service';
import { PrismaService } from '../../../../db';
import { CacheService } from '../../caches/cache.service';
import { RealTimeService } from '../../real-time/services/real-time.service';
import { VotingStatsService } from '../../real-time/services/voting-stats.service';
import { AnomalyDetectionService } from '../../real-time/services/anomaly-detection.service';

const mockPrisma = {
    candidate: { findMany: jest.fn(), update: jest.fn() },
    votingSession: { findUnique: jest.fn(), update: jest.fn() },
    vote: { create: jest.fn() },
    user: { update: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn().mockImplementation((fn) => fn(mockPrisma)),
};
const mockCacheService = {
    getBallot: jest.fn(),
    setBallot: jest.fn(),
    deleteVotingSession: jest.fn(),
};
const mockRealTimeService = {
    broadcast: jest.fn(),
    broadcastToAdmins: jest.fn(),
    broadcastToRole: jest.fn(),
    getConnectionStats: jest.fn().mockReturnValue({ totalConnections: 0 }),
};
const mockVotingStatsService = {
    clearStatsCache: jest.fn(),
    getVotingProgress: jest.fn(),
    getVotingVelocity: jest.fn(),
    getPositionStats: jest.fn(),
};
const mockAnomalyService = { shouldRunDetection: jest.fn().mockResolvedValue(false) };
const mockConfigService = { get: jest.fn().mockReturnValue('test-encryption-key') };

describe('VoteSubmissionService', () => {
    let service: VoteSubmissionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VoteSubmissionService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: CacheService, useValue: mockCacheService },
                { provide: RealTimeService, useValue: mockRealTimeService },
                { provide: VotingStatsService, useValue: mockVotingStatsService },
                { provide: AnomalyDetectionService, useValue: mockAnomalyService },
            ],
        }).compile();
        service = module.get<VoteSubmissionService>(VoteSubmissionService);
        jest.clearAllMocks();
    });

    describe('getBallot', () => {
        it('returns cached ballot when available', async () => {
            const cached = { ballot: { PRESIDENT: [] }, totalPositions: 1 };
            mockCacheService.getBallot.mockResolvedValue(cached);

            const result = await service.getBallot();

            expect(result).toEqual(cached);
            expect(mockPrisma.candidate.findMany).not.toHaveBeenCalled();
        });

        it('queries DB and caches ballot on cache miss', async () => {
            mockCacheService.getBallot.mockResolvedValue(null);
            mockPrisma.candidate.findMany.mockResolvedValue([
                { id: 'c1', name: 'Alice', position: 'PRESIDENT', candidateNumber: 1, photoUrl: null, biography: null, nomination: {} },
            ]);
            mockCacheService.setBallot.mockResolvedValue(undefined);

            const result = await service.getBallot();

            expect(result).toHaveProperty('ballot');
            expect(result).toHaveProperty('instructions');
            expect(mockCacheService.setBallot).toHaveBeenCalled();
        });
    });

    describe('validateSession', () => {
        it('returns valid info for active, non-voted session', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                sessionId: 'sess1',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                user: { id: 'u1', name: 'Bob', email: 'bob@test.com', hasVoted: false },
            });

            const result = await service.validateSession('sess1');

            expect(result.valid).toBe(true);
            expect(result.user.name).toBe('Bob');
        });

        it('throws NotFoundException for unknown session', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue(null);
            await expect(service.validateSession('bad')).rejects.toThrow(NotFoundException);
        });

        it('throws ForbiddenException for expired session', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                expiresAt: new Date(Date.now() - 1000),
                user: { id: 'u1' },
            });
            await expect(service.validateSession('sess1')).rejects.toThrow(ForbiddenException);
        });

        it('throws ConflictException when user already voted', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                user: { id: 'u1', name: 'Bob', email: 'bob@test.com', hasVoted: true },
            });
            await expect(service.validateSession('sess1')).rejects.toThrow(ConflictException);
        });
    });

    describe('submitVote', () => {
        const dto = { sessionId: 'sess1', votes: { PRESIDENT: 'c1' } };

        it('throws NotFoundException for unknown session', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue(null);
            await expect(service.submitVote(dto)).rejects.toThrow(NotFoundException);
        });

        it('throws ForbiddenException for expired session', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                expiresAt: new Date(Date.now() - 1000),
                user: { hasVoted: false },
            });
            await expect(service.submitVote(dto)).rejects.toThrow(ForbiddenException);
        });

        it('throws ConflictException when user already voted', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                user: { hasVoted: true },
            });
            await expect(service.submitVote(dto)).rejects.toThrow(ConflictException);
        });

        it('throws BadRequestException for invalid candidate', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                user: { hasVoted: false },
                voterHash: 'hash1',
            });
            mockPrisma.candidate.findMany.mockResolvedValue([]);
            await expect(service.submitVote(dto)).rejects.toThrow(BadRequestException);
        });
    });
});
