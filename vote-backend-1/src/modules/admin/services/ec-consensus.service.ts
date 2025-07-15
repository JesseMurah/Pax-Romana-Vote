import { PrismaService } from "../../../../db";
import { Injectable } from "@nestjs/common";
import { UserRole, NominationStatus } from "@prisma/client/index";


@Injectable()
export class EcConsensusService {
    constructor(
        private prisma: PrismaService
    ) {}

    async checkConsensus(nominationId: string) {
        //@ts-ignore
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
                //@ts-ignore
                role: UserRole.EC_MEMBER,
                isActive: true,
            },
        });

        const approvals = decisions.filter(d => d.approved === true).length;
        const rejections = decisions.filter(d => d.approved === false).length;
        const pending = totalEcMembers - decisions.length;

        // 2/3 majority rule
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

    async getAllConsensusStatuses() {
        const nominations = await this.prisma.nomination.findMany({
            where: {
                status: NominationStatus.VERIFIED, // Use enum from generated client
            },
            select: {
                id: true,
                nomineePosition: true,
                nomineeName: true,
                //@ts-ignore
                aspirant: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        const consensusStatuses = await Promise.all(
            nominations.map(async (nomination) => {
                const consensus = await this.checkConsensus(nomination.id);
                return {
                    //@ts-ignore
                    nominationId: nomination.id,
                    position: nomination.nomineePosition,
                    //@ts-ignore
                    aspirantName: nomination.aspirant.name,
                    nomineeName: nomination.nomineeName,
                    ...consensus,
                };
            }),
        );

        return consensusStatuses;
    }
}