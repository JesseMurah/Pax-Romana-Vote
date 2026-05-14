import { Candidate_Position } from "@prisma/client/index";
import { CertificationStatus, ResultStatus } from "../enums/result-status.enum";
export declare class VoteCountDto {
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
export declare class PositionResultDto {
    position: Candidate_Position;
    totalVotes: number;
    totalEligibleVoters: number;
    turnoutPercentage: number;
    candidates: VoteCountDto[];
    status: ResultStatus;
    certificationStatus: CertificationStatus;
    winner?: VoteCountDto;
    requiresRunoff: boolean;
    unopposedThresholdMet: boolean;
    certifiedAt?: string;
    certifiedBy?: string;
    certificationComments?: string;
}
