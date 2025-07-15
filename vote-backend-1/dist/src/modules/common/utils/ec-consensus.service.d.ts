import { PrismaService } from '../../../../db';
export declare class EcConsensusService {
    private prisma;
    constructor(prisma: PrismaService);
    canMemberVote(reviewerId: string, nominationId: string): Promise<boolean>;
    checkConsensus(nominationId: string): Promise<{
        nominationId: string;
        approvals: number;
        rejections: number;
        pending: number;
        totalEcMembers: number;
        requiredForConsensus: number;
        isConsensusReached: boolean;
        finalDecision: "APPROVE" | "REJECT" | null;
    }>;
}
