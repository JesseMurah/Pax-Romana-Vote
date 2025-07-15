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
var NominationWorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominationWorkflowService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
const notification_service_1 = require("../../notifications/notification.service");
const client_1 = require("@prisma/client");
let NominationWorkflowService = NominationWorkflowService_1 = class NominationWorkflowService {
    prisma;
    notificationService;
    logger = new common_1.Logger(NominationWorkflowService_1.name);
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async processVerification(token, action, reason) {
        const verificationToken = await this.prisma.verificationToken.findUnique({
            where: { token },
            include: {
                guarantorVerification: true,
                nominatorVerification: true,
            },
        });
        if (!verificationToken) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (verificationToken.used || verificationToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Verification token is invalid or expired');
        }
        const guarantorVerificationId = verificationToken.guarantorVerification?.id;
        const nominatorVerificationId = verificationToken.nominatorVerification?.id;
        if (!guarantorVerificationId && !nominatorVerificationId) {
            throw new common_1.BadRequestException('No associated verification found');
        }
        const verificationId = guarantorVerificationId || nominatorVerificationId;
        const isGuarantor = !!guarantorVerificationId;
        const updateData = {
            status: action === 'CONFIRM' ? client_1.VerificationStatus.VERIFIED : client_1.VerificationStatus.DECLINED,
            comments: reason,
            verifiedAt: action === 'CONFIRM' ? new Date() : null,
            declinedAt: action === 'DECLINE' ? new Date() : null,
        };
        if (isGuarantor) {
            await this.prisma.guarantorVerification.update({
                where: { id: verificationId },
                data: updateData,
            });
        }
        else {
            await this.prisma.nominatorVerification.update({
                where: { id: verificationId },
                data: updateData,
            });
        }
        await this.prisma.verificationToken.update({
            where: { token },
            data: { used: true },
        });
        const nomination = await this.prisma.nomination.findUnique({
            where: { id: verificationToken.guarantorVerification?.nominationId || verificationToken.nominatorVerification?.nominationId },
            include: {
                nominatorVerification: true,
                guarantorVerifications: true,
            },
        });
        if (!nomination) {
            throw new common_1.BadRequestException('Associated nomination not found');
        }
        const allVerified = nomination.nominatorVerification?.status === client_1.VerificationStatus.VERIFIED &&
            nomination.guarantorVerifications.every((g) => g.status === client_1.VerificationStatus.VERIFIED);
        if (allVerified) {
            await this.prisma.nomination.update({
                where: { id: nomination.id },
                data: { status: client_1.NominationStatus.VERIFIED },
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
};
exports.NominationWorkflowService = NominationWorkflowService;
exports.NominationWorkflowService = NominationWorkflowService = NominationWorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        notification_service_1.NotificationService])
], NominationWorkflowService);
//# sourceMappingURL=nomination-workflow.service.js.map