import { PositionResultDto } from "./position-result.dto";
export declare class ResultSummaryDto {
    totalPositions: number;
    certifiedPositions: number;
    pendingPositions: number;
    totalVotesCast: number;
    totalEligibleVoters: number;
    overallTurnout: number;
    positionResults: PositionResultDto[];
    lastUpdated: Date;
    electionComplete: boolean;
}
