import { IsNumber, IsString } from "class-validator";


export class NominationStatisticsDto {
    byStatus: {
        [key: string]: number;
    };
    byPosition: {
        [key: string]: number;
    };
    byTimeframe: {
        daily: any[];
        weekly: any[];
    };
    ecMemberStats: {
        [key: string]: {
            reviewed: number;
            approved: number;
            rejected: number;
        };
    };
}


export class BulkActionResultDto {
    @IsNumber()
    totalProcessed: number;

    @IsNumber()
    successful: number;

    @IsNumber()
    failed: number;

    @IsString({ each: true })
    errors: string[];
}