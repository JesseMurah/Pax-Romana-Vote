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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NominationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominationController = void 0;
const common_1 = require("@nestjs/common");
const nomination_service_1 = require("./services/nomination.service");
const create_nomination_dto_1 = require("./dto/create-nomination.dto");
const nominator_verification_service_1 = require("./services/nominator-verification.service");
const guarantor_verification_service_1 = require("./services/guarantor-verification.service");
const auth_response_dto_1 = require("../auth/dto/auth-response.dto");
let NominationController = NominationController_1 = class NominationController {
    nominationService;
    nominatorVerificationService;
    guarantorVerificationService;
    logger = new common_1.Logger(NominationController_1.name);
    constructor(nominationService, nominatorVerificationService, guarantorVerificationService) {
        this.nominationService = nominationService;
        this.nominatorVerificationService = nominatorVerificationService;
        this.guarantorVerificationService = guarantorVerificationService;
    }
    async create(createNominationDto) {
        this.logger.log('Received nomination request');
        try {
            return await this.nominationService.createNomination(createNominationDto);
        }
        catch (error) {
            this.logger.error(`Failed to create nomination: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getVerificationData(token) {
        const verificationToken = await this.nominationService.prisma.verificationToken.findUnique({
            where: { token },
            include: {
                nominatorVerification: { include: { nomination: true } },
                guarantorVerification: { include: { nomination: true } },
            },
        });
        if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
        const nomination = verificationToken.nominatorVerification?.nomination || verificationToken.guarantorVerification?.nomination;
        if (!nomination) {
            throw new common_1.BadRequestException('No associated nomination found');
        }
        return {
            nomineeName: nomination.nomineeName,
            position: nomination.nomineePosition,
            expiresAt: verificationToken.expiresAt,
        };
    }
    async confirmVerification(token, comments) {
        const verificationToken = await this.nominationService.prisma.verificationToken.findUnique({
            where: { token },
            include: {
                nominatorVerification: true,
                guarantorVerification: true,
            },
        });
        if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
        const updateData = { status: 'APPROVED', comments, verifiedAt: new Date() };
        if (verificationToken.nominatorVerification) {
            await this.nominationService.prisma.nominatorVerification.update({
                where: { id: verificationToken.nominatorVerification.id },
                data: updateData,
            });
        }
        else if (verificationToken.guarantorVerification) {
            await this.nominationService.prisma.guarantorVerification.update({
                where: { id: verificationToken.guarantorVerification.id },
                data: updateData,
            });
        }
        await this.nominationService.prisma.verificationToken.update({
            where: { token },
            data: { used: true },
        });
        const nomination = await this.nominationService.prisma.nomination.findUnique({
            where: { id: verificationToken.nominatorVerification?.nominationId || verificationToken.guarantorVerification?.nominationId },
            include: { nominatorVerification: true, guarantorVerifications: true },
        });
        if (nomination?.nominatorVerification?.status === 'APPROVED' &&
            nomination?.guarantorVerifications.every((g) => g.status === 'APPROVED')) {
            console.log('=== NOMINATION VERIFICATION COMPLETE - MANUAL NOTIFICATION NEEDED ===');
            console.log('Nominee Name:', nomination.nomineeName);
            console.log('Nominee Email:', nomination.nomineeEmail);
            console.log('Nominee Phone:', nomination.nomineeContact);
            console.log('Position:', nomination.nomineePosition);
            console.log('Created At:', nomination.createdAt);
            console.log('================================================================');
            await this.nominationService.prisma.nomination.update({
                where: { id: nomination.id },
                data: {},
            });
        }
        return { message: 'Verification successful' };
    }
    async declineVerification(token, comments) {
        const verificationToken = await this.nominationService.prisma.verificationToken.findUnique({
            where: { token },
            include: {
                nominatorVerification: true,
                guarantorVerification: true,
            },
        });
        if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
        const updateData = { status: 'REJECTED', comments, declinedAt: new Date() };
        let nominationId;
        if (verificationToken.nominatorVerification) {
            await this.nominationService.prisma.nominatorVerification.update({
                where: { id: verificationToken.nominatorVerification.id },
                data: updateData,
            });
            nominationId = verificationToken.nominatorVerification.nominationId;
        }
        else if (verificationToken.guarantorVerification) {
            await this.nominationService.prisma.guarantorVerification.update({
                where: { id: verificationToken.guarantorVerification.id },
                data: updateData,
            });
            nominationId = verificationToken.guarantorVerification.nominationId;
        }
        await this.nominationService.prisma.verificationToken.update({
            where: { token },
            data: { used: true },
        });
        if (nominationId) {
            const nomination = await this.nominationService.prisma.nomination.findUnique({
                where: { id: nominationId },
                select: {
                    nomineeName: true,
                    nomineeEmail: true,
                    nomineeContact: true,
                    nomineePosition: true,
                },
            });
            console.log('=== VERIFICATION DECLINED - MANUAL NOTIFICATION NEEDED ===');
            console.log('Nominee Name:', nomination?.nomineeName);
            console.log('Nominee Email:', nomination?.nomineeEmail);
            console.log('Position:', nomination?.nomineePosition);
            console.log('Declined Comments:', comments);
            console.log('========================================================');
        }
        return { message: 'Verification declined' };
    }
    async getNominatorVerificationDetails(token) {
        return this.nominatorVerificationService.getVerificationDetails(token);
    }
    async verifyNominator(verificationDto) {
        return this.nominatorVerificationService.verifyNominator(verificationDto);
    }
    async getGuarantorVerificationDetails(token) {
        return this.guarantorVerificationService.getVerificationDetails(token);
    }
    async verifyGuarantor(verificationDto) {
        return this.guarantorVerificationService.verifyGuarantor(verificationDto);
    }
    async getCompletedVerifications() {
        const completedNominations = await this.nominationService.prisma.nomination.findMany({
            where: {
                nominatorVerification: {
                    status: 'APPROVED',
                },
                guarantorVerifications: {
                    every: {
                        status: 'APPROVED',
                    },
                },
            },
            include: {
                nominatorVerification: true,
                guarantorVerifications: true,
            },
        });
        return completedNominations.map(nomination => ({
            id: nomination.id,
            nomineeName: nomination.nomineeName,
            nomineeEmail: nomination.nomineeEmail,
            nomineeContact: nomination.nomineeContact,
            position: nomination.nomineePosition,
            createdAt: nomination.createdAt,
            verificationStatus: 'COMPLETED',
        }));
    }
    async getPendingVerifications() {
        return await this.nominationService.getPendingVerifications();
    }
};
exports.NominationController = NominationController;
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_nomination_dto_1.CreateNominationDto]),
    __metadata("design:returntype", Promise)
], NominationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('verify/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NominationController.prototype, "getVerificationData", null);
__decorate([
    (0, common_1.Post)('verify/:token/confirm'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)('comments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NominationController.prototype, "confirmVerification", null);
__decorate([
    (0, common_1.Post)('verify/:token/decline'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)('comments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NominationController.prototype, "declineVerification", null);
__decorate([
    (0, common_1.Get)('verify/nominator/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NominationController.prototype, "getNominatorVerificationDetails", null);
__decorate([
    (0, common_1.Post)('verify/nominator'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_response_dto_1.VerificationResponseDto]),
    __metadata("design:returntype", Promise)
], NominationController.prototype, "verifyNominator", null);
__decorate([
    (0, common_1.Get)('verify/guarantor/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NominationController.prototype, "getGuarantorVerificationDetails", null);
__decorate([
    (0, common_1.Post)('verify/guarantor'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_response_dto_1.VerificationResponseDto]),
    __metadata("design:returntype", Promise)
], NominationController.prototype, "verifyGuarantor", null);
__decorate([
    (0, common_1.Get)('completed-verifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NominationController.prototype, "getCompletedVerifications", null);
__decorate([
    (0, common_1.Get)('pending-verifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NominationController.prototype, "getPendingVerifications", null);
exports.NominationController = NominationController = NominationController_1 = __decorate([
    (0, common_1.Controller)('nominations'),
    __metadata("design:paramtypes", [nomination_service_1.NominationService,
        nominator_verification_service_1.NominatorVerificationService,
        guarantor_verification_service_1.GuarantorVerificationService])
], NominationController);
//# sourceMappingURL=nominations.controller.js.map