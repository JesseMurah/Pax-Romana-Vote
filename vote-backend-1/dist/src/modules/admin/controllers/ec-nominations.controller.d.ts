import { NominationReviewService } from "../services/nomination-review.service";
import { EcConsensusService } from "../services/ec-consensus.service";
import { BulkNominationReviewDto, NominationReviewDto } from "../dto/nomination-review.dto";
export declare class EcNominationsController {
    private nominationReviewService;
    private ecConsensusService;
    constructor(nominationReviewService: NominationReviewService, ecConsensusService: EcConsensusService);
    getNominationsForReview(req: any): Promise<({
        EcReview: {
            createdAt: Date;
            approved: boolean;
            reviewerId: string;
            comments: string | null;
        }[];
        aspirant: {
            name: string;
            phone: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subgroupId: string | null;
        aspirantId: string;
        nomineeName: string;
        nomineeEmail: string;
        nomineeContact: string;
        nomineePosition: import(".prisma/client").$Enums.Candidate_Position;
        photoUrl: string | null;
        photoPublicId: string | null;
        status: import(".prisma/client").$Enums.NominationStatus;
        nomineeCollege: string;
        nomineeDepartment: string;
        nomineeDateOfBirth: Date;
        nomineeHostel: string;
        nomineeRoom: string;
        nomineeSex: string;
        nomineeCwa: string;
        nomineeProgramme: string;
        nomineeLevel: string;
        nomineeParish: string;
        nomineeNationality: string;
        nomineeRegion: string;
        nomineeSubgroups: string[];
        nomineeEducation: string[];
        hasLeadershipPosition: boolean;
        leadershipPositions: string[];
        hasServedCommittee: boolean;
        committees: string[];
        skills: string[];
        visionForOffice: string[];
        knowledgeAboutOffice: string[];
        approvalCount: number;
        rejectionCount: number;
        reviewedAt: Date | null;
        rejectionReason: string | null;
        userId: string | null;
    })[]>;
    reviewNomination(reviewDto: NominationReviewDto, req: any): Promise<{
        message: string;
        consensusStatus: {
            nominationId: string;
            approvals: number;
            rejections: number;
            pending: number;
            totalEcMembers: number;
            requiredForConsensus: number;
            isConsensusReached: boolean;
            finalDecision: "APPROVE" | "REJECT" | null;
        };
    }>;
    bulkReviewNominations(bulkReviewDto: BulkNominationReviewDto, req: any): Promise<{
        totalProcessed: number;
        successful: number;
        failed: number;
        errors: string[];
    }>;
    getConsensusStatus(nominationId: string): Promise<{
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
