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
exports.BulkActionResultDto = exports.NominationStatisticsDto = void 0;
const class_validator_1 = require("class-validator");
class NominationStatisticsDto {
    byStatus;
    byPosition;
    byTimeframe;
    ecMemberStats;
}
exports.NominationStatisticsDto = NominationStatisticsDto;
class BulkActionResultDto {
    totalProcessed;
    successful;
    failed;
    errors;
}
exports.BulkActionResultDto = BulkActionResultDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkActionResultDto.prototype, "totalProcessed", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkActionResultDto.prototype, "successful", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkActionResultDto.prototype, "failed", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkActionResultDto.prototype, "errors", void 0);
//# sourceMappingURL=nomination-statistics.dto.js.map