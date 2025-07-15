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
exports.NominationReviewService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
const notification_service_1 = require("../../notifications/notification.service");
const ec_consensus_service_1 = require("./ec-consensus.service");
const client_1 = require("@prisma/client");
const nomination_status_enum_1 = require("../../common/enums/nomination-status.enum");
let NominationReviewService = class NominationReviewService {
    prisma;
    notificationsService;
    ecConsensusService;
    constructor(prisma, notificationsService, ecConsensusService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.ecConsensusService = ecConsensusService;
    }
    async reviewNomination(reviewDto, reviewerId) {
        const nomination = await this.prisma.nomination.findUnique({
            where: { id: reviewDto.nominationId },
            include: {
                aspirant: true,
            },
        });
        if (!nomination) {
            throw new common_1.BadRequestException('Nomination not found');
        }
        if (nomination.status !== client_1.NominationStatus.VERIFIED) {
            throw new common_1.BadRequestException('Nomination not ready for review');
        }
        const existingReview = await this.prisma.ecReview.findUnique({
            where: {
                nominationId_reviewerId: {
                    nominationId: reviewDto.nominationId,
                    reviewerId: reviewerId,
                },
            },
        });
        if (existingReview) {
            throw new common_1.BadRequestException('You have already reviewed this nomination');
        }
        await this.prisma.ecReview.create({
            data: {
                nominationId: reviewDto.nominationId,
                reviewerId: reviewerId,
                approved: reviewDto.action === nomination_status_enum_1.AdminActions.APPROVE,
                comments: reviewDto.comments,
            },
        });
        const updateData = reviewDto.action === nomination_status_enum_1.AdminActions.APPROVE
            ? { approvalCount: { increment: 1 } }
            : { rejectionCount: { increment: 1 } };
        await this.prisma.nomination.update({
            where: { id: reviewDto.nominationId },
            data: updateData,
        });
        const consensusResult = await this.ecConsensusService.checkConsensus(reviewDto.nominationId);
        if (consensusResult.isConsensusReached) {
            await this.finalizeNomination(reviewDto.nominationId, consensusResult.finalDecision);
        }
        await this.notificationsService.notifyEcMembersOfDecision(reviewDto.nominationId, reviewerId, reviewDto.action);
        return {
            message: 'Review submitted successfully',
            consensusStatus: consensusResult,
        };
    }
    async bulkReviewNominations(bulkReviewDto, reviewerId) {
        const results = {
            totalProcessed: bulkReviewDto.nominationIds.length,
            successful: 0,
            failed: 0,
            errors: [],
        };
        for (const nominationId of bulkReviewDto.nominationIds) {
            try {
                await this.reviewNomination({
                    nominationId,
                    action: bulkReviewDto.action,
                    reason: bulkReviewDto.reason,
                    comments: bulkReviewDto.comments,
                }, reviewerId);
                results.successful++;
            }
            catch (error) {
                results.failed++;
                results.errors.push(`${nominationId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        return results;
    }
    async finalizeNomination(nominationId, decision) {
        if (!decision)
            return;
        const status = decision === nomination_status_enum_1.AdminActions.APPROVE ? client_1.NominationStatus.APPROVED : client_1.NominationStatus.REJECTED;
        await this.prisma.nomination.update({
            where: { id: nominationId },
            data: {
                status,
                reviewedAt: new Date(),
                rejectionReason: decision === nomination_status_enum_1.AdminActions.REJECT ? 'Rejected by EC consensus' : null,
            },
        });
        await this.notificationsService.notifyAspirantOfDecision(nominationId, decision);
        if (decision === nomination_status_enum_1.AdminActions.APPROVE) {
            await this.createCandidateFromNomination(nominationId);
        }
    }
    async createCandidateFromNomination(nominationId) {
        const nomination = await this.prisma.nomination.findUnique({
            where: { id: nominationId },
            include: {
                aspirant: true,
            },
        });
        if (!nomination)
            return;
        const lastCandidate = await this.prisma.candidate.findFirst({
            orderBy: { candidateNumber: 'desc' },
        });
        const nextCandidateNumber = lastCandidate ? lastCandidate.candidateNumber + 1 : 1;
        await this.prisma.candidate.create({
            data: {
                name: nomination.nomineeName,
                position: nomination.nomineePosition,
                nominationId: nomination.id,
                photoUrl: nomination.photoUrl,
                photoPublicId: nomination.photoPublicId,
                candidateNumber: nextCandidateNumber,
                isActive: true,
            },
        });
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
    async getNominationsForReview(ecMemberId) {
        const where = {
            status: client_1.NominationStatus.VERIFIED,
        };
        return this.prisma.nomination.findMany({
            where,
            include: {
                aspirant: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                EcReview: {
                    select: {
                        reviewerId: true,
                        approved: true,
                        comments: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
};
exports.NominationReviewService = NominationReviewService;
exports.NominationReviewService = NominationReviewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        notification_service_1.NotificationService,
        ec_consensus_service_1.EcConsensusService])
], NominationReviewService);
//# sourceMappingURL=nomination-review.service.js.map