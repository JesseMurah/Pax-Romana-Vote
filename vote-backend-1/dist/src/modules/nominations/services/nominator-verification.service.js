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
exports.NominatorVerificationService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
const nomination_workflow_service_1 = require("./nomination-workflow.service");
const index_1 = require("@prisma/client/index");
let NominatorVerificationService = class NominatorVerificationService {
    prisma;
    workflowService;
    constructor(prisma, workflowService) {
        this.prisma = prisma;
        this.workflowService = workflowService;
    }
    async verifyNominator(verificationDto) {
        const { verificationToken, action, reason } = verificationDto;
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
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (verificationRecord.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Verification token has expired');
        }
        const nominatorVerification = verificationRecord.nominatorVerification;
        if (nominatorVerification.status !== index_1.VerificationStatus.PENDING) {
            throw new common_1.BadRequestException('This verification has already been processed');
        }
        const updateData = {
            status: action === 'approve' ? index_1.VerificationStatus.VERIFIED : index_1.VerificationStatus.DECLINED,
            verifiedAt: action === 'approve' ? new Date() : null,
            declinedAt: action === 'decline' ? new Date() : null,
        };
        await this.prisma.nominatorVerification.update({
            where: { id: nominatorVerification.id },
            data: updateData,
        });
        await this.workflowService.processVerification(verificationToken, action === 'approve' ? 'CONFIRM' : 'DECLINE', reason);
        return {
            message: `Verification ${action.toLowerCase()}ed successfully`,
            nominationId: nominatorVerification.nominationId,
        };
    }
    async getVerificationDetails(token) {
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
            throw new common_1.BadRequestException('Invalid verification token');
        }
        const isExpired = verificationRecord.expiresAt < new Date();
        if (isExpired) {
            throw new common_1.BadRequestException('Verification token has expired');
        }
        return {
            nomination: verificationRecord.nominatorVerification.nomination,
            nominatorName: verificationRecord.nominatorVerification.name,
            nominatorEmail: verificationRecord.nominatorVerification.email,
            tokenType: index_1.TokenType.NOMINATOR_VERIFICATION,
            isExpired,
            isAlreadyVerified: verificationRecord.nominatorVerification.status !== index_1.VerificationStatus.PENDING,
            verificationStatus: verificationRecord.nominatorVerification.status,
        };
    }
};
exports.NominatorVerificationService = NominatorVerificationService;
exports.NominatorVerificationService = NominatorVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        nomination_workflow_service_1.NominationWorkflowService])
], NominatorVerificationService);
//# sourceMappingURL=nominator-verification.service.js.map