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
exports.BulkAdminActionDto = exports.AdminActionDto = void 0;
const class_validator_1 = require("class-validator");
const nomination_status_enum_1 = require("../enums/nomination-status.enum");
class AdminActionDto {
    nominationId;
    action;
    reason;
    comment;
}
exports.AdminActionDto = AdminActionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdminActionDto.prototype, "nominationId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(nomination_status_enum_1.AdminActions),
    __metadata("design:type", String)
], AdminActionDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminActionDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminActionDto.prototype, "comment", void 0);
class BulkAdminActionDto {
    nominationIds;
    action;
    reason;
}
exports.BulkAdminActionDto = BulkAdminActionDto;
__decorate([
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], BulkAdminActionDto.prototype, "nominationIds", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(nomination_status_enum_1.AdminActions),
    __metadata("design:type", String)
], BulkAdminActionDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkAdminActionDto.prototype, "reason", void 0);
//# sourceMappingURL=admin-action.dto.js.map