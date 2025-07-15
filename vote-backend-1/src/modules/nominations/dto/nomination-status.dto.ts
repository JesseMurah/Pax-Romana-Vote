import {IsArray, IsEnum, IsOptional, IsString} from "class-validator";
import { NominationStatus } from "@prisma/client";


export class NominationStatusDto {
    @IsString()
    id: string;

    @IsEnum(NominationStatus)
    status: NominationStatus;

    @IsString()
    aspirantName: string;

    @IsString()
    position: string;

    @IsOptional()
    @IsArray()
    verificationStatus?: {
        nominator: boolean;
        guarantor1: boolean;
        guarantor2: boolean;
    };

    @IsOptional()
    @IsArray()
    ecVotes?: {
        memberId: string;
        memberName: string;
        vote: 'APPROVE' | 'REJECT' | 'PENDING';
        reason?: string;
    }[];

    @IsString()
    @IsOptional()
    submittedAt?: string;

    @IsString()
    @IsOptional()
    reviewedAt?: string;
}