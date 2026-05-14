import { Test, TestingModule } from '@nestjs/testing';
import { VotingService } from './voting.service';
import { PrismaService } from '../../../db';
import { VotingStatsService } from '../real-time/services/voting-stats.service';
import { RealTimeService } from '../real-time/services/real-time.service';

const mockPrisma = {
    user: { count: jest.fn() },
    vote: { count: jest.fn() },
    candidate: { findMany: jest.fn() },
    electionTimeline: { findMany: jest.fn() },
    $transaction: jest.fn().mockImplementation((fn) => fn(mockPrisma)),
};
const mockVotingStatsService = {
    getVotingProgress: jest.fn(),
    getVotingVelocity: jest.fn(),
    getPositionStats: jest.fn(),
    clearStatsCache: jest.fn(),
};
const mockRealTimeService = {
    broadcast: jest.fn(),
    broadcastToAdmins: jest.fn(),
    broadcastToRole: jest.fn(),
    getConnectionStats: jest.fn().mockReturnValue({ totalConnections: 1 }),
};

describe('VotingService', () => {
    let service: VotingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VotingService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: VotingStatsService, useValue: mockVotingStatsService },
                { provide: RealTimeService, useValue: mockRealTimeService },
            ],
        }).compile();
        service = module.get<VotingService>(VotingService);
        jest.clearAllMocks();
    });

    describe('getVotingStats', () => {
        it('returns realtime stats on success', async () => {
            mockVotingStatsService.getVotingProgress.mockResolvedValue({ totalVotes: 100, turnoutPercentage: 55, positionStats: [] });
            mockVotingStatsService.getVotingVelocity.mockResolvedValue({ votesPerMinute: 2 });

            const result = await service.getVotingStats();

            expect(result.totalVotes).toBe(100);
            expect(result.systemInfo.realTimeEnabled).toBe(true);
        });

        it('falls back to DB query when realtime service throws', async () => {
            mockVotingStatsService.getVotingProgress.mockRejectedValue(new Error('Redis down'));
            mockPrisma.user.count.mockResolvedValue(200);
            mockPrisma.vote.count.mockResolvedValue(100);
            mockPrisma.candidate.findMany.mockResolvedValue([]);

            const result = await service.getVotingStats();

            expect(result).toHaveProperty('totalVoters');
            expect(result).toHaveProperty('totalVotes');
        });
    });

    describe('getVotingTimeline', () => {
        it('marks current phase correctly', async () => {
            const now = new Date();
            const past = new Date(now.getTime() - 60 * 60 * 1000);
            const future = new Date(now.getTime() + 60 * 60 * 1000);
            mockPrisma.electionTimeline.findMany.mockResolvedValue([
                { id: '1', phase: 'NOMINATIONS', startDate: past, endDate: future, isActive: true },
            ]);

            const result = await service.getVotingTimeline();

            expect(result.currentPhase).toBe('NOMINATIONS');
        });

        it('returns UNKNOWN when no active phase', async () => {
            const past = new Date(Date.now() - 2 * 60 * 60 * 1000);
            const pastEnd = new Date(Date.now() - 60 * 60 * 1000);
            mockPrisma.electionTimeline.findMany.mockResolvedValue([
                { id: '1', phase: 'NOMINATIONS', startDate: past, endDate: pastEnd, isActive: false },
            ]);

            const result = await service.getVotingTimeline();

            expect(result.currentPhase).toBe('UNKNOWN');
        });
    });

    describe('refreshAndBroadcastStats', () => {
        it('clears cache, fetches stats, and broadcasts to all clients and admins', async () => {
            mockVotingStatsService.clearStatsCache.mockResolvedValue(undefined);
            mockVotingStatsService.getVotingProgress.mockResolvedValue({ totalVotes: 10, positionStats: [] });

            await service.refreshAndBroadcastStats();

            expect(mockVotingStatsService.clearStatsCache).toHaveBeenCalled();
            expect(mockRealTimeService.broadcast).toHaveBeenCalled();
            expect(mockRealTimeService.broadcastToAdmins).toHaveBeenCalled();
        });
    });
});
