import {Candidate_Position} from "@prisma/client/index";

export class VotingProgressDto {
    totalVotes: number;
    totalEligibleVoters: number;
    turnoutPercentage: number;
    positionStats: PositionStatsDto[];
    lastUpdated: Date;
}

export class PositionStatsDto {
    position: Candidate_Position;
    totalVotes: number;
    candidates: CandidateStatsDto[];
    isCompleted: boolean;
}

export class CandidateStatsDto {
    candidateId: string;
    name: string;
    candidateNumber: number;
    voteCount: number;
    percentage: number;
    isLeading: boolean;
}