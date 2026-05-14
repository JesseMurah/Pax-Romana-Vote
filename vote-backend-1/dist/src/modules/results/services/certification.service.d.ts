import { RealTimeService } from "../../real-time/services/real-time.service";
import { PrismaService } from "../../../../db";
import { VoteCountingService } from "./vote-counting.service";
import { CertifyResultsDto } from "../dto/certification.dto";
import { Candidate_Position } from "@prisma/client/index";
export declare class CertificationService {
    private prisma;
    private voteCountingService;
    private sseService;
    private readonly logger;
    constructor(prisma: PrismaService, voteCountingService: VoteCountingService, sseService: RealTimeService);
    certifyResults(certifyDto: CertifyResultsDto, certifiedByUserId: string): Promise<{
        success: boolean;
        certifiedPositions: string[];
        errors: string[];
    }>;
    private certifyPosition;
    private createCertificationRecord;
    getCertificationHistory(): Promise<any[]>;
    isElectionFullyCertified(): Promise<boolean>;
    revokeCertification(position: Candidate_Position, revokedBy: string, reason: string): Promise<void>;
}
