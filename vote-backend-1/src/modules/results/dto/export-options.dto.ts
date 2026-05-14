import {IsArray, IsBoolean, IsEnum, IsOptional} from "class-validator";
import {ExportFormat} from "../enums/result-status.enum";
import {Candidate_Position} from "@prisma/client/index";

export class ExportOptionsDto {
    @IsEnum(ExportFormat)
    format: ExportFormat;

    @IsOptional()
    @IsArray()
    @IsEnum(Candidate_Position, { each: true })
    positions?: Candidate_Position[];

    @IsOptional()
    @IsBoolean()
    includeAuditTrail?: boolean;

    @IsOptional()
    @IsBoolean()
    includeCharts?: boolean;

    @IsOptional()
    @IsBoolean()
    certifiedOnly?: boolean;
}