import { VotingService } from "./voting.service";
import { GenerateOtpDto } from "./dto/generate-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { SubmitVoteDto } from "./dto/submit-vote.dto";
import { UserRole } from "@prisma/client/index";
import { SseEventType } from "../real-time/enums/sse-event-types.enum";
export declare class VotingController {
    private readonly votingService;
    private readonly logger;
    constructor(votingService: VotingService);
    generateOtp(dto: GenerateOtpDto): Promise<any>;
    verifyOtp(dto: VerifyOtpDto): Promise<any>;
    getBallot(): Promise<any>;
    submitVote(dto: SubmitVoteDto): Promise<any>;
    validateSession(sessionId: string): Promise<any>;
    getVotingStats(): Promise<any>;
    getVotingProgress(): Promise<any>;
    getPositionStats(position: string): Promise<any>;
    getRealtimeConnections(user: any): Promise<any>;
    refreshStats(user: any): Promise<{
        message: string;
        triggeredBy: any;
        timestamp: Date;
    }>;
    broadcastMessage(body: {
        message: string;
        role: UserRole;
        eventType?: SseEventType;
    }, user: any): Promise<{
        message: string;
        targetRole: import(".prisma/client").$Enums.UserRole;
        broadcastedBy: any;
        timestamp: Date;
    }>;
    getVotingVelocity(user: any): Promise<any>;
    getVotingAnalytics(user: any, timeframe?: string, position?: string): Promise<any>;
    getSystemHealth(user: any): Promise<any>;
    getAnomalies(user: any): Promise<any>;
    pauseVoting(body: {
        reason: string;
    }, user: any): Promise<{
        message: string;
        reason: string;
        pausedBy: any;
        timestamp: Date;
    }>;
    resumeVoting(body: {
        reason: string;
    }, user: any): Promise<{
        message: string;
        reason: string;
        resumedBy: any;
        timestamp: Date;
    }>;
    getActiveSessions(user: any): Promise<any>;
    exportVotingData(user: any, format?: string, includePersonalData?: string): Promise<any>;
    testRealtimeConnection(user: any): Promise<{
        message: string;
        testBy: any;
        timestamp: Date;
    }>;
    getVotingTimeline(): Promise<any>;
    getPublicDashboard(): Promise<any>;
}
