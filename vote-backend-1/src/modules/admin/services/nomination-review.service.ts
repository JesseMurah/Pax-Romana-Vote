import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../db';
import { NotificationService } from '../../notifications/notification.service';
import { EcConsensusService } from './ec-consensus.service';
import { BulkNominationReviewDto, NominationReviewDto } from '../dto/nomination-review.dto';
import { NominationStatus, UserRole } from '@prisma/client';
import { AdminActions } from '../../common/enums/nomination-status.enum';

@Injectable()
export class NominationReviewService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationService,
        private ecConsensusService: EcConsensusService,
    ) {}

    async reviewNomination(reviewDto: NominationReviewDto, reviewerId: string) {
        const nomination = await this.prisma.nomination.findUnique({
            where: { id: reviewDto.nominationId },
            include: {
                aspirant: true,
            },
        });

        if (!nomination) {
            throw new BadRequestException('Nomination not found');
        }

        if (nomination.status !== NominationStatus.VERIFIED) {
            throw new BadRequestException('Nomination not ready for review');
        }

        // Check if this EC member has already reviewed this nomination
        const existingReview = await this.prisma.ecReview.findUnique({
            where: {
                nominationId_reviewerId: {
                    nominationId: reviewDto.nominationId,
                    reviewerId: reviewerId,
                },
            },
        });

        if (existingReview) {
            throw new BadRequestException('You have already reviewed this nomination');
        }

        // Record EC member decision
        await this.prisma.ecReview.create({
            data: {
                nominationId: reviewDto.nominationId,
                reviewerId: reviewerId,
                approved: reviewDto.action === AdminActions.APPROVE,
                comments: reviewDto.comments,
            },
        });

        // Update nomination approval/rejection counts
        const updateData = reviewDto.action === AdminActions.APPROVE
            ? { approvalCount: { increment: 1 } }
            : { rejectionCount: { increment: 1 } };

        await this.prisma.nomination.update({
            where: { id: reviewDto.nominationId },
            //@ts-ignore
            data: updateData,
        });

        // Check if consensus is reached (2/3 majority)
        const consensusResult = await this.ecConsensusService.checkConsensus(reviewDto.nominationId);

        if (consensusResult.isConsensusReached) {
            await this.finalizeNomination(reviewDto.nominationId, consensusResult.finalDecision);
        }

        // Send notification to other EC members
        await this.notificationsService.notifyEcMembersOfDecision(
            reviewDto.nominationId,
            reviewerId,
            reviewDto.action,
        );

        return {
            message: 'Review submitted successfully',
            consensusStatus: consensusResult,
        };
    }

    async bulkReviewNominations(bulkReviewDto: BulkNominationReviewDto, reviewerId: string) {
        const results = {
            totalProcessed: bulkReviewDto.nominationIds.length,
            successful: 0,
            failed: 0,
            errors: [] as string[],
        };

        for (const nominationId of bulkReviewDto.nominationIds) {
            try {
                await this.reviewNomination(
                    {
                        nominationId,
                        action: bulkReviewDto.action,
                        reason: bulkReviewDto.reason,
                        comments: bulkReviewDto.comments,
                    },
                    reviewerId,
                );
                results.successful++;
            } catch (error) {
                results.failed++;
                results.errors.push(
                    `${nominationId}: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }

        return results;
    }

    private async finalizeNomination(nominationId: string, decision: 'APPROVE' | 'REJECT' | null) {
        if (!decision) return;

        const status = decision === AdminActions.APPROVE ? NominationStatus.APPROVED : NominationStatus.REJECTED;

        await this.prisma.nomination.update({
            where: { id: nominationId },
            data: {
                status,
                //@ts-ignore
                reviewedAt: new Date(),
                rejectionReason: decision === AdminActions.REJECT ? 'Rejected by EC consensus' : null,
            },
        });

        // Send notification to aspirant
        await this.notificationsService.notifyAspirantOfDecision(nominationId, decision);

        // If approved, create a candidate record
        if (decision === AdminActions.APPROVE) {
            await this.createCandidateFromNomination(nominationId);
        }
    }

    private async createCandidateFromNomination(nominationId: string) {
        const nomination = await this.prisma.nomination.findUnique({
            where: { id: nominationId },
            include: {
                aspirant: true,
            },
        });

        if (!nomination) return;

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
                //@ts-ignore
                photoPublicId: nomination.photoPublicId,
                candidateNumber: nextCandidateNumber,
                isActive: true,
            },
        });
    }

    async checkConsensus(nominationId: string) {
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
                role: { in: [UserRole.ADMIN, UserRole.EC_MEMBER] },
                isActive: true,
            },
        });

        const approvals = decisions.filter((d) => d.approved).length;
        const rejections = decisions.filter((d) => !d.approved).length;
        const pending = totalEcMembers - decisions.length;

        const requiredForConsensus = Math.ceil((totalEcMembers * 2) / 3);
        const isConsensusReached = approvals >= requiredForConsensus || rejections >= requiredForConsensus;

        let finalDecision: 'APPROVE' | 'REJECT' | null = null;
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

    async getNominationsForReview(ecMemberId?: string) {
        const where = {
            status: NominationStatus.VERIFIED,
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
}