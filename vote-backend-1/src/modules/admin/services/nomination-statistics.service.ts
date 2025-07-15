import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../db';
import { NominationStatus, Candidate_Position } from '@prisma/client/index';

export class NominationStatsFilterDto {
    position?: Candidate_Position;
    status?: NominationStatus;
    dateFrom?: Date;
    dateTo?: Date;
}

@Injectable()
export class NominationStatisticsService {
    constructor(private prisma: PrismaService) {}

    async getStatistics(filterDto: NominationStatsFilterDto) {
        const whereClause: any = {};

        if (filterDto.position) {
            whereClause.nomineePosition = filterDto.position;
        }

        if (filterDto.status) {
            whereClause.status = filterDto.status;
        }

        if (filterDto.dateFrom || filterDto.dateTo) {
            whereClause.createdAt = {};
            if (filterDto.dateFrom) {
                whereClause.createdAt.gte = filterDto.dateFrom;
            }
            if (filterDto.dateTo) {
                whereClause.createdAt.lte = filterDto.dateTo;
            }
        }

        const [
            totalNominations,
            byPosition,
            byStatus,
            recent,
        ] = await Promise.all([
            this.prisma.nomination.count({ where: whereClause }),
            this.getNominationsByPosition(whereClause),
            this.getNominationsByStatus(whereClause),
            this.getRecentNominations(whereClause),
        ]);

        return {
            total: totalNominations,
            byPosition,
            byStatus,
            recent,
        };
    }

    private async getNominationsByPosition(whereClause: any) {
        return this.prisma.nomination.groupBy({
            by: ['nomineePosition'],
            where: whereClause,
            _count: { id: true },
        });
    }

    private async getNominationsByStatus(whereClause: any) {
        return this.prisma.nomination.groupBy({
            by: ['status'],
            where: whereClause,
            _count: { id: true },
        });
    }

    private async getRecentNominations(whereClause: any) {
        return this.prisma.nomination.findMany({
            where: whereClause,
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                nomineeName: true,
                nomineePosition: true,
                status: true,
                createdAt: true,
            },
        });
    }
}