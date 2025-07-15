import { IsString, IsEmail, IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Candidate_Position } from '@prisma/client';

class NominatorVerificationDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    contact: string;

    @IsString()
    level: string;

    @IsString()
    subgroup: string;

    @IsString()
    programme: string;
}

class GuarantorVerificationDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    contact: string;

    @IsString()
    programme: string;

    @IsString()
    subgroup: string;
}

export class CreateNominationDto {
    @IsString()
    aspirantName: string;

    @IsString()
    aspirantPhoneNumber: string;

    @IsEmail()
    aspirantEmail: string;

    @IsEnum(Candidate_Position)
    position: Candidate_Position;

    @IsString()
    @IsOptional()
    photoUrl?: string;

    @IsString()
    nomineeCollege: string;

    @IsString()
    nomineeDepartment: string;

    @IsDateString()
    nomineeDateOfBirth: string;

    @IsString()
    nomineeHostel: string;

    @IsString()
    nomineeRoom: string;

    @IsString()
    nomineeSex: string;

    @IsString()
    nomineeCwa: string;

    @IsString()
    nomineeProgramme: string;

    @IsString()
    nomineeLevel: string;

    @IsString()
    nomineeParish: string;

    @IsString()
    nomineeNationality: string;

    @IsString()
    nomineeRegion: string;

    @IsArray()
    @IsString({ each: true })
    nomineeSubgroups: string[];

    @IsArray()
    @IsString({ each: true })
    nomineeEducation: string[];

    @IsBoolean()
    hasLeadershipPosition: boolean;

    @IsArray()
    @IsString({ each: true })
    leadershipPositions: string[];

    @IsBoolean()
    hasServedCommittee: boolean;

    @IsArray()
    @IsString({ each: true })
    committees: string[];

    @IsArray()
    @IsString({ each: true })
    skills: string[];

    @IsArray()
    @IsString({ each: true })
    visionForOffice: string[];

    @IsArray()
    @IsString({ each: true })
    knowledgeAboutOffice: string[];

    @ValidateNested()
    @Type(() => NominatorVerificationDto)
    nominatorVerification: NominatorVerificationDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GuarantorVerificationDto)
    guarantorVerifications: GuarantorVerificationDto[];
}