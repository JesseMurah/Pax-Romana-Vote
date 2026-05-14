import { ConfigService } from '@nestjs/config';
import { Candidate_Position } from '@prisma/client';
import { PrismaService } from "../../../../db";
interface DecryptedVote {
    sessionId: string;
    voterHash: string;
    selections: Record<Candidate_Position, string>;
    timestamp: Date;
    isValid: boolean;
}
export declare class VoteEncryptionService {
    private configService;
    private prisma;
    private readonly logger;
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly tagLength;
    private encryptionKey;
    constructor(configService: ConfigService, prisma: PrismaService);
    private initializeEncryptionKey;
    encryptVote(selections: Record<Candidate_Position, string>): string;
    decryptVote(encryptedVote: string): Record<Candidate_Position, string>;
    decryptAllVotes(): Promise<DecryptedVote[]>;
    validateEncryptedVote(encryptedVote: string): boolean;
    generateNewEncryptionKey(): string;
    testEncryption(): Promise<{
        success: boolean;
        message: string;
    }>;
    private createDecryptionErrorLog;
    decryptVotesWithProgress(onProgress?: (current: number, total: number) => void): Promise<DecryptedVote[]>;
}
export {};
