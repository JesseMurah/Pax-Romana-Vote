import { PrismaService } from '../../../../db';
import { NominationWorkflowService } from './nomination-workflow.service';
import { VerificationResponseDto } from '../dto/verification-response.dto';
export declare class NominatorVerificationService {
    private prisma;
    private workflowService;
    constructor(prisma: PrismaService, workflowService: NominationWorkflowService);
    verifyNominator(verificationDto: VerificationResponseDto): Promise<{
        message: string;
        nominationId: string;
    }>;
    getVerificationDetails(token: string): Promise<{
        nomination: {
            nominatorVerification: {
                name: string;
                status: string;
                verifiedAt: Date | null;
            } | null;
            guarantorVerifications: {
                name: string;
                status: string;
                verifiedAt: Date | null;
            }[];
            aspirant: {
                name: string;
                phone: string | null;
                email: string;
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
        };
        nominatorName: string;
        nominatorEmail: string;
        tokenType: "NOMINATOR_VERIFICATION";
        isExpired: false;
        isAlreadyVerified: boolean;
        verificationStatus: string;
    }>;
}
