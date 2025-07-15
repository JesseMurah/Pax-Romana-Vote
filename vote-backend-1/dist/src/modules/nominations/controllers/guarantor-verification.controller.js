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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuarantorVerificationController = void 0;
const common_1 = require("@nestjs/common");
const guarantor_verification_service_1 = require("../services/guarantor-verification.service");
const auth_response_dto_1 = require("../../auth/dto/auth-response.dto");
let GuarantorVerificationController = class GuarantorVerificationController {
    guarantorVerificationService;
    constructor(guarantorVerificationService) {
        this.guarantorVerificationService = guarantorVerificationService;
        console.log('Instantiating Nominations Controller');
    }
    async getVerificationDetails(token) {
        return this.guarantorVerificationService.getVerificationDetails(token);
    }
    async verifyGuarantor(verificationDto) {
        return this.guarantorVerificationService.verifyGuarantor(verificationDto);
    }
};
exports.GuarantorVerificationController = GuarantorVerificationController;
__decorate([
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuarantorVerificationController.prototype, "getVerificationDetails", null);
__decorate([
    (0, common_1.Post)('guarantor'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_response_dto_1.VerificationResponseDto]),
    __metadata("design:returntype", Promise)
], GuarantorVerificationController.prototype, "verifyGuarantor", null);
exports.GuarantorVerificationController = GuarantorVerificationController = __decorate([
    (0, common_1.Controller)('nominations/verify'),
    __metadata("design:paramtypes", [guarantor_verification_service_1.GuarantorVerificationService])
], GuarantorVerificationController);
//# sourceMappingURL=guarantor-verification.controller.js.map