import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength, MinLength} from "class-validator";
import {Candidate_Position} from "@prisma/client/index";

export class CreateCandidateDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsEnum(Candidate_Position)
    position: Candidate_Position;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    biography?: string;

    @IsNumber()
    candidateNumber?: number;

    @IsOptional()
    @IsNumber()
    displayOrder?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @IsOptional()
    @IsString()
    photoPublicId?: string;
}