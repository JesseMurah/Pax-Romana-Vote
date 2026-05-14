import { Candidate_Position } from "@prisma/client/index";

export class CandidateResponseDto {
    id: string;
    name: string;
    position: Candidate_Position;
    photoUrl?: string;
    biography?: string;
    candidateNumber: number;
    displayOrder: number;
    isActive: boolean;
    voteCount: number;
    createdAt: Date;
    updatedAt: Date;
    photoPublicId: number;
}