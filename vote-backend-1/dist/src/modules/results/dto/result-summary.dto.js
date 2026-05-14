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
exports.ResultSummaryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const position_result_dto_1 = require("./position-result.dto");
class ResultSummaryDto {
    totalPositions;
    certifiedPositions;
    pendingPositions;
    totalVotesCast;
    totalEligibleVoters;
    overallTurnout;
    positionResults;
    lastUpdated;
    electionComplete;
}
exports.ResultSummaryDto = ResultSummaryDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ResultSummaryDto.prototype, "totalPositions", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ResultSummaryDto.prototype, "certifiedPositions", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ResultSummaryDto.prototype, "pendingPositions", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ResultSummaryDto.prototype, "totalVotesCast", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ResultSummaryDto.prototype, "totalEligibleVoters", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ResultSummaryDto.prototype, "overallTurnout", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => position_result_dto_1.PositionResultDto),
    __metadata("design:type", Array)
], ResultSummaryDto.prototype, "positionResults", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ResultSummaryDto.prototype, "lastUpdated", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ResultSummaryDto.prototype, "electionComplete", void 0);
//# sourceMappingURL=result-summary.dto.js.map