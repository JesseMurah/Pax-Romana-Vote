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
exports.GuarantorVerificationService = void 0;
const db_1 = require("../../../../db");
const nomination_workflow_service_1 = require("./nomination-workflow.service");
const common_1 = require("@nestjs/common");
const index_1 = require("@prisma/client/index");
let GuarantorVerificationService = class GuarantorVerificationService {
    prisma;
    workflowService;
    notificationService;
    constructor(prisma, workflowService) {
        this.prisma = prisma;
        this.workflowService = workflowService;
    }
    async verifyGuarantor(verificationDto) {
        const { verificationToken, action, reason } = verificationDto;
        const guarantorVerification = await this.prisma.guarantorVerification.findUnique({
            where: { verificationToken },
            include: {
                nomination: {
                    include: {
                        aspirant: true,
                        nominatorVerification: true,
                        guarantorVerifications: true,
                    },
                },
            },
        });
        if (!guarantorVerification) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (guarantorVerification.tokenExpiresAt && guarantorVerification.tokenExpiresAt < new Date()) {
            throw new common_1.BadRequestException('Verification token has expired');
        }
        if (guarantorVerification.status !== index_1.VerificationStatus.PENDING) {
            throw new common_1.BadRequestException('This verification has already been processed');
        }
        const updateData = {
            status: action === 'approve' ? index_1.VerificationStatus.VERIFIED : index_1.VerificationStatus.DECLINED,
            verifiedAt: action === 'approve' ? new Date() : null,
            declinedAt: action === 'decline' ? new Date() : null,
        };
        await this.prisma.guarantorVerification.update({
            where: { id: guarantorVerification.id },
            data: updateData,
        });
        await this.workflowService.processVerification(guarantorVerification.verificationToken, action === 'approve' ? 'CONFIRM' : 'DECLINE', reason);
        return {
            message: `Verification ${action.toLowerCase()}ed successfully`,
            nominationId: guarantorVerification.nominationId,
        };
    }
    async getVerificationDetails(token) {
        const guarantorVerification = await this.prisma.guarantorVerification.findUnique({
            where: { verificationToken: token },
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
        });
        if (!guarantorVerification) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        const isExpired = guarantorVerification.tokenExpiresAt
            ? guarantorVerification.tokenExpiresAt < new Date()
            : false;
        if (isExpired) {
            throw new common_1.BadRequestException('Verification token has expired');
        }
        return {
            nomination: guarantorVerification.nomination,
            guarantorName: guarantorVerification.name,
            guarantorEmail: guarantorVerification.email,
            tokenType: index_1.TokenType.GUARANTOR_VERIFICATION,
            isExpired,
            isAlreadyVerified: guarantorVerification.status !== index_1.VerificationStatus.PENDING,
            verificationStatus: guarantorVerification.status,
        };
    }
    async resendVerificationEmail(nominationId, guarantorEmail) {
        const guarantorVerification = await this.prisma.guarantorVerification.findFirst({
            where: {
                nominationId,
                email: guarantorEmail,
                status: index_1.VerificationStatus.PENDING,
            },
            include: {
                nomination: {
                    include: {
                        aspirant: true,
                    },
                },
            },
        });
        if (!guarantorVerification) {
            throw new common_1.BadRequestException('No pending verification found for this guarantor');
        }
        const newToken = this.generateVerificationToken();
        const newExpiration = new Date(Date.now() + 48 * 60 * 60 * 1000);
        await this.prisma.guarantorVerification.update({
            where: { id: guarantorVerification.id },
            data: {
                verificationToken: newToken,
                tokenExpiresAt: newExpiration,
            },
        });
        await this.notificationService.sendGuarantorVerificationEmail(guarantorVerification);
        return {
            message: 'Verification email resent successfully',
            expiresAt: newExpiration,
        };
    }
    generateVerificationToken() {
        return require('crypto').randomBytes(32).toString('hex');
    }
};
exports.GuarantorVerificationService = GuarantorVerificationService;
exports.GuarantorVerificationService = GuarantorVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        nomination_workflow_service_1.NominationWorkflowService])
], GuarantorVerificationService);
//# sourceMappingURL=guarantor-verification.service.js.map