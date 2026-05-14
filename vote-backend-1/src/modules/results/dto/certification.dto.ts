import {IsArray, IsEnum, IsOptional, IsString, ValidateNested} from "class-validator";
import {Candidate_Position} from "@prisma/client/index";
import {Type} from "class-transformer";

export class CertifyPositionDto {
    @IsEnum(Candidate_Position)
    position: Candidate_Position;

    @IsOptional()
    @IsString()
    comments?: string;
}

export class CertifyResultsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CertifyPositionDto)
    positions: CertifyPositionDto[];

    @IsOptional()
    @IsString()
    overallComments?: string;
}

export class CertificationRecordDto {
    @IsString()
    id: string;

    @IsEnum(Candidate_Position)
    position: Candidate_Position;

    @IsString()
    certifiedBy: string;

    @IsString()
    certifiedByName: string;

    @IsOptional()
    @IsString()
    comments?: string;

    @IsString()
    certifiedAt: string;

    @IsArray()
    finalVoteCounts: any[];
}