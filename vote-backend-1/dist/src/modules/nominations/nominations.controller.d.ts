import { NominationService } from './services/nomination.service';
import { CreateNominationDto } from './dto/create-nomination.dto';
import { NominatorVerificationService } from "./services/nominator-verification.service";
import { GuarantorVerificationService } from "./services/guarantor-verification.service";
import { VerificationResponseDto } from "../auth/dto/auth-response.dto";
export declare class NominationController {
    private readonly nominationService;
    private nominatorVerificationService;
    private guarantorVerificationService;
    private readonly logger;
    constructor(nominationService: NominationService, nominatorVerificationService: NominatorVerificationService, guarantorVerificationService: GuarantorVerificationService);
    create(createNominationDto: CreateNominationDto): Promise<{
        nominatorVerification: {
            subgroup: string;
            programme: string;
            name: string;
            email: string;
            level: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nominationId: string;
            status: string;
            userId: string | null;
            comments: string | null;
            contact: string;
            verifiedAt: Date | null;
            declinedAt: Date | null;
        } | null;
        guarantorVerifications: {
            subgroup: string;
            programme: string;
            name: string;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nominationId: string;
            status: string;
            userId: string | null;
            comments: string | null;
            contact: string;
            verifiedAt: Date | null;
            declinedAt: Date | null;
            verificationTokenId: string | null;
        }[];
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
    }>;
    getVerificationData(token: string): Promise<{
        nomineeName: string;
        position: import(".prisma/client").$Enums.Candidate_Position;
        expiresAt: Date;
    }>;
    confirmVerification(token: string, comments?: string): Promise<{
        message: string;
    }>;
    declineVerification(token: string, comments?: string): Promise<{
        message: string;
    }>;
    getNominatorVerificationDetails(token: string): Promise<{
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
    verifyNominator(verificationDto: VerificationResponseDto): Promise<{
        message: string;
        nominationId: string;
    }>;
    getGuarantorVerificationDetails(token: string): Promise<{
        nomination: any;
        guarantorName: string;
        guarantorEmail: string;
        tokenType: "GUARANTOR_VERIFICATION";
        isExpired: false;
        isAlreadyVerified: boolean;
        verificationStatus: string;
    }>;
    verifyGuarantor(verificationDto: VerificationResponseDto): Promise<{
        message: string;
        nominationId: string;
    }>;
}
