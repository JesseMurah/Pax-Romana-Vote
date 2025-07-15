import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import { PrismaService } from '../../../../db';
import { NotificationService } from '../../notifications/notification.service';
import { NominationStatus, VerificationStatus } from '@prisma/client';

@Injectable()
export class NominationWorkflowService {
    private readonly logger = new Logger(NominationWorkflowService.name);

    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService,
    ) {}

    async processVerification(token: string, action: 'CONFIRM' | 'DECLINE', reason?: string) {
        const verificationToken = await this.prisma.verificationToken.findUnique({
            where: { token },
            include: {
                guarantorVerification: true,
                nominatorVerification: true,
            },
        });

        if (!verificationToken) {
            throw new BadRequestException('Invalid verification token');
        }

        if (verificationToken.used || verificationToken.expiresAt < new Date()) {
            throw new BadRequestException('Verification token is invalid or expired');
        }

        const guarantorVerificationId = verificationToken.guarantorVerification?.id;
        const nominatorVerificationId = verificationToken.nominatorVerification?.id;

        if (!guarantorVerificationId && !nominatorVerificationId) {
            throw new BadRequestException('No associated verification found');
        }

        const verificationId = guarantorVerificationId || nominatorVerificationId;
        const isGuarantor = !!guarantorVerificationId;

        // Update verification status
        const updateData = {
            status: action === 'CONFIRM' ? VerificationStatus.VERIFIED : VerificationStatus.DECLINED,
            comments: reason,
            verifiedAt: action === 'CONFIRM' ? new Date() : null,
            declinedAt: action === 'DECLINE' ? new Date() : null,
        };

        if (isGuarantor) {
            await this.prisma.guarantorVerification.update({
                where: { id: verificationId },
                data: updateData,
            });
        } else {
            await this.prisma.nominatorVerification.update({
                where: { id: verificationId },
                data: updateData,
            });
        }

        // Mark token as used
        await this.prisma.verificationToken.update({
            where: { token },
            data: { used: true },
        });

        // Check if nomination is fully verified
        const nomination = await this.prisma.nomination.findUnique({
            where: { id: verificationToken.guarantorVerification?.nominationId || verificationToken.nominatorVerification?.nominationId },
            include: {
                nominatorVerification: true,
                guarantorVerifications: true,
            },
        });

        if (!nomination) {
            throw new BadRequestException('Associated nomination not found');
        }

        const allVerified =
            nomination.nominatorVerification?.status === VerificationStatus.VERIFIED &&
            nomination.guarantorVerifications.every((g) => g.status === VerificationStatus.VERIFIED);

        if (allVerified) {
            await this.prisma.nomination.update({
                where: { id: nomination.id },
                data: { status: NominationStatus.VERIFIED },
            });

            await this.notificationService.notifyNominationVerificationComplete({
                nominee: {
                    name: nomination.nomineeName,
                    email: nomination.nomineeEmail,
                    phoneNumber: nomination.nomineeContact,
                },
                position: nomination.nomineePosition,
                createdAt: nomination.createdAt,
            });

            await this.notificationService.notifyAdminsOfNewNomination({
                nominationId: nomination.id,
                nomineeName: nomination.nomineeName,
                position: nomination.nomineePosition,
                createdAt: nomination.createdAt,
            });
        }
    }
}