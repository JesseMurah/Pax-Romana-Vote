import { NominationService } from "../services/nomination.service";
import { CreateNominationDto } from "../dto/create-nomination.dto";
import { NominationStatus } from "@prisma/client/index";
export declare class NominationsController {
    private nominationService;
    constructor(nominationService: NominationService);
    create(createNominationDto: CreateNominationDto, file: Express.Multer.File): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    getMyNominations(user: any): Promise<{
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
    }[]>;
    getStatistics(): Promise<{
        total: number;
        approved: number;
        pending: number;
        rejected: number;
        timeRemaining: {
            days: number;
            hours: number;
            minutes: number;
            seconds: number;
        };
    }>;
    getNominationsByPosition(position: string): Promise<{
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
    }[]>;
    getNomination(id: string): Promise<{
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
    getAllNominations(status?: NominationStatus, position?: string): Promise<{
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
    }[]>;
}
