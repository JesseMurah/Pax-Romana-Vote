export declare class NominationStatisticsDto {
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
export declare class BulkActionResultDto {
    totalProcessed: number;
    successful: number;
    failed: number;
    errors: string[];
}
