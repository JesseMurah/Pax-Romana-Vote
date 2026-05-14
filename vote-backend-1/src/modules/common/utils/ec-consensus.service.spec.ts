import { Test, TestingModule } from '@nestjs/testing';
import { EcConsensusService } from './ec-consensus.service';
import { PrismaService } from '../../../../db';

const mockPrisma = {
    ecReview: { findMany: jest.fn(), findUnique: jest.fn() },
    user: { count: jest.fn() },
    nomination: { findMany: jest.fn() },
};

describe('EcConsensusService', () => {
    let service: EcConsensusService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EcConsensusService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        service = module.get<EcConsensusService>(EcConsensusService);
        jest.clearAllMocks();
    });

    describe('checkConsensus', () => {
        it('returns APPROVE when 2/3 majority approves', async () => {
            mockPrisma.ecReview.findMany.mockResolvedValue([
                { approved: true, reviewer: { role: 'EC_MEMBER', isActive: true } },
                { approved: true, reviewer: { role: 'EC_MEMBER', isActive: true } },
                { approved: false, reviewer: { role: 'EC_MEMBER', isActive: true } },
            ]);
            mockPrisma.user.count.mockResolvedValue(3);

            const result = await service.checkConsensus('nom1');

            expect(result.isConsensusReached).toBe(true);
            expect(result.finalDecision).toBe('APPROVE');
            expect(result.approvals).toBe(2);
        });

        it('returns REJECT when 2/3 majority rejects', async () => {
            mockPrisma.ecReview.findMany.mockResolvedValue([
                { approved: false, reviewer: {} },
                { approved: false, reviewer: {} },
            ]);
            mockPrisma.user.count.mockResolvedValue(3);

            const result = await service.checkConsensus('nom1');

            expect(result.finalDecision).toBe('REJECT');
        });

        it('returns null decision when consensus not reached', async () => {
            mockPrisma.ecReview.findMany.mockResolvedValue([
                { approved: true, reviewer: {} },
            ]);
            mockPrisma.user.count.mockResolvedValue(5);

            const result = await service.checkConsensus('nom1');

            expect(result.isConsensusReached).toBe(false);
            expect(result.finalDecision).toBeNull();
        });

        it('calculates pending as totalMembers minus decisions', async () => {
            mockPrisma.ecReview.findMany.mockResolvedValue([
                { approved: true, reviewer: {} },
                { approved: true, reviewer: {} },
            ]);
            mockPrisma.user.count.mockResolvedValue(5);

            const result = await service.checkConsensus('nom1');

            expect(result.pending).toBe(3);
        });
    });

    describe('canMemberVote', () => {
        it('returns true when member has not yet voted', async () => {
            mockPrisma.ecReview.findUnique.mockResolvedValue(null);
            const result = await service.canMemberVote('reviewer1', 'nom1');
            expect(result).toBe(true);
        });

        it('returns false when member already voted', async () => {
            mockPrisma.ecReview.findUnique.mockResolvedValue({ id: 'r1', approved: true });
            const result = await service.canMemberVote('reviewer1', 'nom1');
            expect(result).toBe(false);
        });
    });
});
