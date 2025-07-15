import {IsEnum, IsOptional, IsString} from "class-validator";
import { AdminActions } from "../../common/enums/nomination-status.enum";

export class AdminAlertDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsEnum(AdminActions)
    @IsOptional()
    actionType?: AdminActions;

    @IsString()
    @IsOptional()
    nominationId?: string;

    @IsString()
    @IsOptional()
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}