import { IsNumber, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDTO {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    search?: string;

    @IsOptional()
    sortBy?: string;

    @IsOptional()
    sortOrder?: 'asc' | 'desc' = 'desc';
}