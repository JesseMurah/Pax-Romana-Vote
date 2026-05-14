import { Candidate_Position } from "@prisma/client/index";
export declare class CreateCandidateDto {
    name: string;
    position: Candidate_Position;
    biography?: string;
    candidateNumber?: number;
    displayOrder?: number;
    isActive?: boolean;
    photoUrl?: string;
    photoPublicId?: string;
}
