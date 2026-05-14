import { AnomalyAlertDto } from "../dto/anomaly-alert.dto";
import { PrismaService } from "../../../../db";
import { CacheService } from "../../caches/cache.service";
export declare class AnomalyDetectionService {
    private prisma;
    private cacheService;
    private readonly logger;
    private readonly VOTING_SPIKE_THRESHOLD;
    private readonly DUPLICATE_IP_THRESHOLD;
    constructor(prisma: PrismaService, cacheService: CacheService);
    detectAnomalies(): Promise<AnomalyAlertDto[]>;
    private detectVotingSpike;
    private detectSuspiciousIPActivity;
    private detectDuplicateVotingAttempts;
    private detectSystemOverload;
    shouldRunDetection(): Promise<boolean>;
}
