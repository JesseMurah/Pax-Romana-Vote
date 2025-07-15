import {IsEnum, IsOptional, IsString, IsUUID} from "class-validator";
import {AdminActions} from "../enums/nomination-status.enum";

export class AdminActionDto {
    @IsUUID()
    nominationId: string;

    @IsEnum(AdminActions)
    action: AdminActions;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    comment?: string;
}

export class BulkAdminActionDto {
    @IsUUID(4, { each: true })
    nominationIds: string[];

    @IsEnum(AdminActions)
    action: AdminActions;

    @IsOptional()
    @IsString()
    reason?: string;
}