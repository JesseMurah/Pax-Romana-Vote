import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../db';
import { NominationStatus, UserRole } from '@prisma/client';
import { AdminActions } from '../../common/enums/nomination-status.enum';

@Injectable()
export class EcConsensusService {
    constructor(private prisma: PrismaService) {}

    async canMemberVote(reviewerId: string, nominationId: string): Promise<boolean> {
        const existingReview = await this.prisma.ecReview.findUnique({
            where: {
                nominationId_reviewerId: {
                    nominationId,
                    reviewerId,
                },
            },
        });

        return !existingReview; // Return true if no review exists (can vote), false otherwise
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
}