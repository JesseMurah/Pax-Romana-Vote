import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../db';
import { NominationWorkflowService } from './nomination-workflow.service';
import { VerificationResponseDto } from '../dto/verification-response.dto';
import { VerificationStatus, TokenType } from '@prisma/client/index';

@Injectable()
export class NominatorVerificationService {
    constructor(
        private prisma: PrismaService,
        private workflowService: NominationWorkflowService,
    ) {}

    async verifyNominator(verificationDto: VerificationResponseDto) {
        const { verificationToken, action, reason } = verificationDto;

        // Find the verification token
        const verificationRecord = await this.prisma.verificationToken.findUnique({
            where: { token: verificationToken },
            include: {
                nominatorVerification: {
                    include: {
                        nomination: {
                            include: {
                                aspirant: true,
                                nominatorVerification: true,
                                guarantorVerifications: true,
                            },
                        },
                    },
                },
            },
        });

        if (!verificationRecord || !verificationRecord.nominatorVerification) {
            throw new BadRequestException('Invalid verification token');
        }

        if (verificationRecord.expiresAt < new Date()) {
            throw new BadRequestException('Verification token has expired');
        }

        const nominatorVerification = verificationRecord.nominatorVerification;

        if (nominatorVerification.status !== VerificationStatus.PENDING) {
            throw new BadRequestException('This verification has already been processed');
        }

        // Update nominator verification status
        const updateData = {
            //@ts-ignore
            status: action === 'approve' ? VerificationStatus.VERIFIED : VerificationStatus.DECLINED,
            //@ts-ignore
            verifiedAt: action === 'approve' ? new Date() : null,
            //@ts-ignore
            declinedAt: action === 'decline' ? new Date() : null,
        };

        await this.prisma.nominatorVerification.update({
            where: { id: nominatorVerification.id },
            data: updateData,
        });

        // Process through workflow
        await this.workflowService.processVerification(
            verificationToken,
            //@ts-ignore
            action === 'approve' ? 'CONFIRM' : 'DECLINE',
            reason
        );

        return {
            message: `Verification ${action.toLowerCase()}ed successfully`,
            nominationId: nominatorVerification.nominationId,
        };
    }

    async getVerificationDetails(token: string) {
        const verificationRecord = await this.prisma.verificationToken.findUnique({
            where: { token },
            include: {
                nominatorVerification: {
                    include: {
                        nomination: {
                            include: {
                                aspirant: {
                                    select: {
                                        id: true,
                                        name: true,
                                        phone: true,
                                        email: true,
                                    },
                                },
                                nominatorVerification: {
                                    select: {
                                        name: true,
                                        status: true,
                                        verifiedAt: true,
                                    },
                                },
                                guarantorVerifications: {
                                    select: {
                                        name: true,
                                        status: true,
                                        verifiedAt: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!verificationRecord || !verificationRecord.nominatorVerification) {
            throw new BadRequestException('Invalid verification token');
        }

        const isExpired = verificationRecord.expiresAt < new Date();

        if (isExpired) {
            throw new BadRequestException('Verification token has expired');
        }

        return {
            nomination: verificationRecord.nominatorVerification.nomination,
            nominatorName: verificationRecord.nominatorVerification.name,
            nominatorEmail: verificationRecord.nominatorVerification.email,
            tokenType: TokenType.NOMINATOR_VERIFICATION,
            isExpired,
            isAlreadyVerified: verificationRecord.nominatorVerification.status !== VerificationStatus.PENDING,
            verificationStatus: verificationRecord.nominatorVerification.status,
        };
    }
}