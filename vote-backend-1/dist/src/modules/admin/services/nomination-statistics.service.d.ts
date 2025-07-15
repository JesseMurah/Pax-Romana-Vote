import { PrismaService } from '../../../../db';
import { NominationStatus, Candidate_Position } from '@prisma/client/index';
export declare class NominationStatsFilterDto {
    position?: Candidate_Position;
    status?: NominationStatus;
    dateFrom?: Date;
    dateTo?: Date;
}
export declare class NominationStatisticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getStatistics(filterDto: NominationStatsFilterDto): Promise<{
        total: number;
        byPosition: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.NominationGroupByOutputType, "nomineePosition"[]> & {
            _count: {
                id: number;
            };
        })[];
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.NominationGroupByOutputType, "status"[]> & {
            _count: {
                id: number;
            };
        })[];
        recent: {
            id: string;
            createdAt: Date;
            nomineeName: string;
            nomineePosition: import(".prisma/client").$Enums.Candidate_Position;
            status: import(".prisma/client").$Enums.NominationStatus;
        }[];
    }>;
    private getNominationsByPosition;
    private getNominationsByStatus;
    private getRecentNominations;
}
