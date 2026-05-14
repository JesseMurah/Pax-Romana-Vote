import {IsArray, IsBoolean, IsDate, IsNumber, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {PositionResultDto} from "./position-result.dto";


export class ResultSummaryDto {
    @IsNumber()
    totalPositions: number;

    @IsNumber()
    certifiedPositions: number;

    @IsNumber()
    pendingPositions: number;

    @IsNumber()
    totalVotesCast: number;

    @IsNumber()
    totalEligibleVoters: number;

    @IsNumber()
    overallTurnout: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PositionResultDto)
    positionResults: PositionResultDto[];

    @IsDate()
    lastUpdated: Date;

    @IsBoolean()
    electionComplete: boolean;
}