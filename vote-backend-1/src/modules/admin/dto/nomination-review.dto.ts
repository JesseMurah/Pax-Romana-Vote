import {IsArray, IsEnum, IsOptional, IsString, IsUUID} from "class-validator";
import { AdminActions } from "../../common/enums/nomination-status.enum";

export class NominationReviewDto {
    @IsString()
    nominationId: string;

    @IsEnum(AdminActions)
    action: AdminActions;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsString()
    @IsOptional()
    comments?: string;
}

export class BulkNominationReviewDto {
    @IsArray()
    @IsString({ each: true })
    nominationIds: string[];

    @IsEnum(AdminActions)
    action: AdminActions;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsString()
    @IsOptional()
    comments?: string;
}