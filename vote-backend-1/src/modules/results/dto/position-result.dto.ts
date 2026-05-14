import {IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested} from "class-validator";
import { Candidate_Position } from "@prisma/client/index";
import {Type} from "class-transformer";
import {CertificationStatus, ResultStatus} from "../enums/result-status.enum";

export class VoteCountDto {
    @IsString()
    candidateId: string;

    @IsString()
    candidateName: string;

    @IsNumber()
    candidateNumber: number;

    @IsEnum(Candidate_Position)
    position: Candidate_Position;

    @IsNumber()
    voteCount: number;

    @IsNumber()
    percentage: number;

    @IsBoolean()
    isWinner: boolean;

    @IsBoolean()
    isRunnerUp: boolean;

    @IsBoolean()
    isUnopposed: boolean;
}

export class PositionResultDto {
    @IsEnum(Candidate_Position)
    position: Candidate_Position;

    @IsNumber()
    totalVotes: number;

    @IsNumber()
    totalEligibleVoters: number;

    @IsNumber()
    turnoutPercentage: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VoteCountDto)
    candidates: VoteCountDto[];

    @IsEnum(ResultStatus)
    status: ResultStatus;

    @IsEnum(CertificationStatus)
    certificationStatus: CertificationStatus;

    @IsOptional()
    @ValidateNested()
    @Type(() => VoteCountDto)
    winner?: VoteCountDto;

    @IsBoolean()
    requiresRunoff: boolean;

    @IsBoolean()
    unopposedThresholdMet: boolean;

    @IsOptional()
    @IsString()
    certifiedAt?: string;

    @IsOptional()
    @IsString()
    certifiedBy?: string;

    @IsOptional()
    @IsString()
    certificationComments?: string;
}