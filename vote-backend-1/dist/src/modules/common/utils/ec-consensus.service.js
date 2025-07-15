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
exports.EcConsensusService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
const client_1 = require("@prisma/client");
let EcConsensusService = class EcConsensusService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canMemberVote(reviewerId, nominationId) {
        const existingReview = await this.prisma.ecReview.findUnique({
            where: {
                nominationId_reviewerId: {
                    nominationId,
                    reviewerId,
                },
            },
        });
        return !existingReview;
    }
    async checkConsensus(nominationId) {
        const decisions = await this.prisma.ecReview.findMany({
            where: { nominationId },
            include: {
                reviewer: {
                    select: {
                        role: true,
                        isActive: true,
                    },
                },
            },
        });
        const totalEcMembers = await this.prisma.user.count({
            where: {
                role: { in: [client_1.UserRole.ADMIN, client_1.UserRole.EC_MEMBER] },
                isActive: true,
            },
        });
        const approvals = decisions.filter((d) => d.approved).length;
        const rejections = decisions.filter((d) => !d.approved).length;
        const pending = totalEcMembers - decisions.length;
        const requiredForConsensus = Math.ceil((totalEcMembers * 2) / 3);
        const isConsensusReached = approvals >= requiredForConsensus || rejections >= requiredForConsensus;
        let finalDecision = null;
        if (isConsensusReached) {
            finalDecision = approvals >= requiredForConsensus ? 'APPROVE' : 'REJECT';
        }
        return {
            nominationId,
            approvals,
            rejections,
            pending,
            totalEcMembers,
            requiredForConsensus,
            isConsensusReached,
            finalDecision,
        };
    }
};
exports.EcConsensusService = EcConsensusService;
exports.EcConsensusService = EcConsensusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService])
], EcConsensusService);
//# sourceMappingURL=ec-consensus.service.js.map