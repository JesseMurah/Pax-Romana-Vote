import { IsEnum, IsOptional, IsString } from "class-validator";


export enum VerificationAction {
    CONFIRM = 'CONFIRM',
    DECLINE = 'DECLINE',
}

export class VerificationResponseDto {
    @IsString()
    verificationToken: string;

    @IsEnum(VerificationAction)
    action: VerificationAction;

    @IsString()
    @IsOptional()
    reason?: string;
}

export class NomineeVerificationDto {
    @IsString()
    verificationToken: string;

    @IsEnum(VerificationAction)
    action: VerificationAction;

    @IsString()
    @IsOptional()
    reason?: string;
}