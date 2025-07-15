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
exports.UserStatsDto = exports.UserProfileDto = void 0;
const class_validator_1 = require("class-validator");
const user_roles_enum_1 = require("../enums/user-roles.enum");
class UserProfileDto {
    id;
    name;
    phoneNumber;
    role;
    isActive;
    phoneVerified;
    emailVerified;
    hasVoted;
    inkVerified;
}
exports.UserProfileDto = UserProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(user_roles_enum_1.UserRoles),
    __metadata("design:type", String)
], UserProfileDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserProfileDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserProfileDto.prototype, "phoneVerified", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserProfileDto.prototype, "emailVerified", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserProfileDto.prototype, "hasVoted", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserProfileDto.prototype, "inkVerified", void 0);
class UserStatsDto {
    totalUsers;
    totalAdmins;
    totalAspirants;
    totalVoters;
    verifiedUsers;
    activeUsers;
}
exports.UserStatsDto = UserStatsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "totalUsers", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "totalAdmins", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "totalAspirants", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "totalVoters", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "verifiedUsers", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "activeUsers", void 0);
//# sourceMappingURL=user-profile.dto.js.map