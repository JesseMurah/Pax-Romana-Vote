import { Candidate_Position } from '@prisma/client';
declare class NominatorVerificationDto {
    name: string;
    email: string;
    contact: string;
    level: string;
    subgroup: string;
    programme: string;
}
declare class GuarantorVerificationDto {
    name: string;
    email: string;
    contact: string;
    programme: string;
    subgroup: string;
}
export declare class CreateNominationDto {
    aspirantName: string;
    aspirantPhoneNumber: string;
    aspirantEmail: string;
    position: Candidate_Position;
    photoUrl?: string;
    nomineeCollege: string;
    nomineeDepartment: string;
    nomineeDateOfBirth: string;
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
    nominatorVerification: NominatorVerificationDto;
    guarantorVerifications: GuarantorVerificationDto[];
}
export {};
