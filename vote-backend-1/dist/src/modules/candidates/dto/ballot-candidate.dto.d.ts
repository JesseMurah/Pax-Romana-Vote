import { Candidate_Position } from "@prisma/client/index";
export declare class BallotCandidateDto {
    id: string;
    name: string;
    position: Candidate_Position;
    photoUrl?: string;
    candidateNumber: number;
    displayOrder: number;
}
