"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominationStatisticsService = exports.NominationStatsFilterDto = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
class NominationStatsFilterDto {
    position;
    status;
    dateFrom;
    dateTo;
}
exports.NominationStatsFilterDto = NominationStatsFilterDto;
let NominationStatisticsService = class NominationStatisticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStatistics(filterDto) {
        const whereClause = {};
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
        const [totalNominations, byPosition, byStatus, recent,] = await Promise.all([
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
    async getNominationsByPosition(whereClause) {
        return this.prisma.nomination.groupBy({
            by: ['nomineePosition'],
            where: whereClause,
            _count: { id: true },
        });
    }
    async getNominationsByStatus(whereClause) {
        return this.prisma.nomination.groupBy({
            by: ['status'],
            where: whereClause,
            _count: { id: true },
        });
    }
    async getRecentNominations(whereClause) {
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
};
exports.NominationStatisticsService = NominationStatisticsService;
exports.NominationStatisticsService = NominationStatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService])
], NominationStatisticsService);
//# sourceMappingURL=nomination-statistics.service.js.map