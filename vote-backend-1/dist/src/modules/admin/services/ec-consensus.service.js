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
const db_1 = require("../../../../db");
const common_1 = require("@nestjs/common");
const index_1 = require("@prisma/client/index");
let EcConsensusService = class EcConsensusService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
                role: index_1.UserRole.EC_MEMBER,
                isActive: true,
            },
        });
        const approvals = decisions.filter(d => d.approved === true).length;
        const rejections = decisions.filter(d => d.approved === false).length;
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
    async getAllConsensusStatuses() {
        const nominations = await this.prisma.nomination.findMany({
            where: {
                status: index_1.NominationStatus.VERIFIED,
            },
            select: {
                id: true,
                nomineePosition: true,
                nomineeName: true,
                aspirant: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        const consensusStatuses = await Promise.all(nominations.map(async (nomination) => {
            const consensus = await this.checkConsensus(nomination.id);
            return {
                nominationId: nomination.id,
                position: nomination.nomineePosition,
                aspirantName: nomination.aspirant.name,
                nomineeName: nomination.nomineeName,
                ...consensus,
            };
        }));
        return consensusStatuses;
    }
};
exports.EcConsensusService = EcConsensusService;
exports.EcConsensusService = EcConsensusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService])
], EcConsensusService);
//# sourceMappingURL=ec-consensus.service.js.map