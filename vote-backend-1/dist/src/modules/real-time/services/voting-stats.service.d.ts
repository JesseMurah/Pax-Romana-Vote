import { PrismaService } from "../../../../db";
import { CacheService } from "../../caches/cache.service";
import { PositionStatsDto, VotingProgressDto } from "../dto/voting-progress.dto";
import { Candidate_Position } from "@prisma/client/index";
export declare class VotingStatsService {
    private prisma;
    private cacheService;
    private readonly logger;
    constructor(prisma: PrismaService, cacheService: CacheService);
    getVotingProgress(): Promise<VotingProgressDto>;
    private calculateVotingProgress;
    private getPositionStatistics;
    getPositionStats(position: Candidate_Position): Promise<PositionStatsDto>;
    getVotingVelocity(): Promise<{
        current: number;
        average: number;
    }>;
    private getVotingStartTime;
    clearStatsCache(): Promise<void>;
}
