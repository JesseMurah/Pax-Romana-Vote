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
exports.NomineeVerificationDto = exports.VerificationResponseDto = exports.VerificationAction = void 0;
const class_validator_1 = require("class-validator");
var VerificationAction;
(function (VerificationAction) {
    VerificationAction["CONFIRM"] = "CONFIRM";
    VerificationAction["DECLINE"] = "DECLINE";
})(VerificationAction || (exports.VerificationAction = VerificationAction = {}));
class VerificationResponseDto {
    verificationToken;
    action;
    reason;
}
exports.VerificationResponseDto = VerificationResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerificationResponseDto.prototype, "verificationToken", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(VerificationAction),
    __metadata("design:type", String)
], VerificationResponseDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VerificationResponseDto.prototype, "reason", void 0);
class NomineeVerificationDto {
    verificationToken;
    action;
    reason;
}
exports.NomineeVerificationDto = NomineeVerificationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NomineeVerificationDto.prototype, "verificationToken", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(VerificationAction),
    __metadata("design:type", String)
], NomineeVerificationDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], NomineeVerificationDto.prototype, "reason", void 0);
//# sourceMappingURL=verification-response.dto.js.map