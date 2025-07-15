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
exports.RefreshTokenDto = exports.AdminLoginDto = exports.VerifySmsDto = exports.LoginDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class LoginDto {
    phone;
    name;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsPhoneNumber)('GH', { message: 'Please enter a valid Ghana phone number' }),
    (0, class_transformer_1.Transform)(({ value }) => value.replace(/\s/g, '')),
    __metadata("design:type", String)
], LoginDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name cannot exceed 100 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    __metadata("design:type", String)
], LoginDto.prototype, "name", void 0);
class VerifySmsDto {
    phone;
    verificationCode;
}
exports.VerifySmsDto = VerifySmsDto;
__decorate([
    (0, class_validator_1.IsPhoneNumber)('GH', { message: 'Please enter a valid Ghana phone number' }),
    (0, class_transformer_1.Transform)(({ value }) => value.replace(/\s/g, '')),
    __metadata("design:type", String)
], VerifySmsDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Verification code must be 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'Verification code must be 6 digits' }),
    __metadata("design:type", String)
], VerifySmsDto.prototype, "verificationCode", void 0);
class AdminLoginDto {
    email;
    password;
}
exports.AdminLoginDto = AdminLoginDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Please enter a valid email address' }),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "password", void 0);
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
//# sourceMappingURL=login.dto.js.map