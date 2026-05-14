import { Candidate_Position } from "@prisma/client/index";
import { CertificationStatus, ResultStatus } from "../enums/result-status.enum";

export interface VoteCount {
    candidateId: string;
    candidateName: string;
    candidateNumber: number;
    position: Candidate_Position;
    voteCount: number;
    percentage: number;
    isWinner: boolean;
    isRunnerUp: boolean;
    isUnopposed: boolean;
}

export interface PositionResult {
    position: Candidate_Position;
    totalVotes: number;
    totalEligibleVoters: number;
    turnoutPercentage: number;
    candidates: VoteCount[];
    status: ResultStatus;
    certificationStatus: CertificationStatus;
    winner?: VoteCount;
    requiresRunoff: boolean;
    unopposedThresholdMet: boolean;
    certifiedAt?: Date;
    certifiedBy?: string;
    certificationComments?: string;
}

export interface ResultSummary {
    totalPositions: number;
    certifiedPositions: number;
    pendingPositions: number;
    totalVotesCast: number;
    totalEligibleVoters: number;
    overallTurnout: number;
    positionResults: PositionResult[];
    lastUpdated: Date;
    electionComplete: boolean;
}

export interface DecryptedVote {
    sessionId: string;
    voterHash: string;
    selections: Record<Candidate_Position, string>; // position -> candidateId
    timestamp: Date;
    isValid: boolean;
}