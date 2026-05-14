import { PrismaService } from "../../../../db";
import { CacheService } from "../../caches/cache.service";
import { PositionResult } from "../types/results.types";
import { Candidate_Position } from "@prisma/client/index";
import { VoteEncryptionService } from "./vote-encryption.service";
export declare class VoteCountingService {
    private prisma;
    private cacheService;
    private encryption;
    private readonly logger;
    private readonly UNOPPOSED_THRESHOLD;
    constructor(prisma: PrismaService, cacheService: CacheService, encryption: VoteEncryptionService);
    countAllVotes(): Promise<PositionResult[]>;
    countVotesForPosition(position: Candidate_Position, useCache?: boolean): Promise<PositionResult>;
    private decryptAllVotes;
    private decryptVote;
    clearDecryptedVotesCache(): Promise<void>;
    private countVotesPerCandidate;
    private determineWinner;
    private checkRunoffRequired;
    private determineResultStatus;
    private createEmptyPositionResult;
    clearResultsCache(): Promise<void>;
    updateCandidateVoteCounts(): Promise<void>;
}
