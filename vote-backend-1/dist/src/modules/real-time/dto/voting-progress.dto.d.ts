import { Candidate_Position } from "@prisma/client/index";
export declare class VotingProgressDto {
    totalVotes: number;
    totalEligibleVoters: number;
    turnoutPercentage: number;
    positionStats: PositionStatsDto[];
    lastUpdated: Date;
}
export declare class PositionStatsDto {
    position: Candidate_Position;
    totalVotes: number;
    candidates: CandidateStatsDto[];
    isCompleted: boolean;
}
export declare class CandidateStatsDto {
    candidateId: string;
    name: string;
    candidateNumber: number;
    voteCount: number;
    percentage: number;
    isLeading: boolean;
}
