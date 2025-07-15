import { PrismaService } from "../../../../db";
export declare class EcConsensusService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getAllConsensusStatuses(): Promise<{
        nominationId: string;
        approvals: number;
        rejections: number;
        pending: number;
        totalEcMembers: number;
        requiredForConsensus: number;
        isConsensusReached: boolean;
        finalDecision: "APPROVE" | "REJECT" | null;
        position: import(".prisma/client").$Enums.Candidate_Position;
        aspirantName: string;
        nomineeName: string;
    }[]>;
}
