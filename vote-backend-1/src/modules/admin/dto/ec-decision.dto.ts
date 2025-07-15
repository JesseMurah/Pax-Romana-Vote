import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { AdminActions } from "../../common/enums/nomination-status.enum";


export class EcDecisionDto {
    @IsUUID()
    nominationId: string;

    @IsEnum(AdminActions)
    decision: AdminActions;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class EcConsensusStatusDto {
    @IsUUID()
    nominationId: string;

    approvals: number;
    rejections: number;
    pending: number;
    isConsensusReached: boolean;
    finalDecision?: AdminActions;
}