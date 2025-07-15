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
exports.CreateAdminDTO = void 0;
const class_validator_1 = require("class-validator");
const user_roles_enum_1 = require("../enums/user-roles.enum");
class CreateAdminDTO {
    name;
    phone;
    email;
    password;
    role;
    programme;
    level;
    subgroup;
    college;
}
exports.CreateAdminDTO = CreateAdminDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name cannot exceed 100 characters' }),
    __metadata("design:type", String)
], CreateAdminDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'Phone number must be at least 10 characters long' }),
    (0, class_validator_1.MaxLength)(15, { message: 'Phone number cannot exceed 15 characters' }),
    (0, class_validator_1.Matches)(/^[+]?[0-9\s\-()]+$/, { message: 'Phone number must be valid' }),
    __metadata("design:type", String)
], CreateAdminDTO.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email must be a valid email address' }),
    __metadata("design:type", String)
], CreateAdminDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
    __metadata("design:type", String)
], CreateAdminDTO.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsEnum)([user_roles_enum_1.UserRoles.SUPER_ADMIN, user_roles_enum_1.UserRoles.EC_MEMBER, user_roles_enum_1.UserRoles.ADMIN], {
        message: 'Admin role must be either SUPER_ADMIN, EC_MEMBER, or ADMIN',
    }),
    __metadata("design:type", String)
], CreateAdminDTO.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdminDTO.prototype, "programme", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdminDTO.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdminDTO.prototype, "subgroup", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdminDTO.prototype, "college", void 0);
//# sourceMappingURL=create-admin.dto.js.map