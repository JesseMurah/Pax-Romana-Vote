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
exports.GenerateOtpDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
function normalizePhoneNumber(phone) {
    if (!phone)
        return phone;
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.startsWith('233')) {
        return digitsOnly;
    }
    else if (digitsOnly.startsWith('0')) {
        return '233' + digitsOnly.substring(1);
    }
    else if (digitsOnly.length === 9) {
        return '233' + digitsOnly;
    }
    return digitsOnly;
}
class GenerateOtpDto {
    name;
    email;
    phoneNumber;
}
exports.GenerateOtpDto = GenerateOtpDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Name is required' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.toString().trim()),
    __metadata("design:type", String)
], GenerateOtpDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.toString().trim().toLowerCase()),
    __metadata("design:type", String)
], GenerateOtpDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Phone number must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone number is required' }),
    (0, class_transformer_1.Transform)(({ value }) => normalizePhoneNumber(value?.toString().trim())),
    __metadata("design:type", String)
], GenerateOtpDto.prototype, "phoneNumber", void 0);
//# sourceMappingURL=generate-otp.dto.js.map