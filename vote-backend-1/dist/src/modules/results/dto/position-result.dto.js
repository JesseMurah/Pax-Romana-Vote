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
exports.PositionResultDto = exports.VoteCountDto = void 0;
const class_validator_1 = require("class-validator");
const index_1 = require("@prisma/client/index");
const class_transformer_1 = require("class-transformer");
const result_status_enum_1 = require("../enums/result-status.enum");
class VoteCountDto {
    candidateId;
    candidateName;
    candidateNumber;
    position;
    voteCount;
    percentage;
    isWinner;
    isRunnerUp;
    isUnopposed;
}
exports.VoteCountDto = VoteCountDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VoteCountDto.prototype, "candidateId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VoteCountDto.prototype, "candidateName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VoteCountDto.prototype, "candidateNumber", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(index_1.Candidate_Position),
    __metadata("design:type", String)
], VoteCountDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VoteCountDto.prototype, "voteCount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VoteCountDto.prototype, "percentage", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VoteCountDto.prototype, "isWinner", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VoteCountDto.prototype, "isRunnerUp", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VoteCountDto.prototype, "isUnopposed", void 0);
class PositionResultDto {
    position;
    totalVotes;
    totalEligibleVoters;
    turnoutPercentage;
    candidates;
    status;
    certificationStatus;
    winner;
    requiresRunoff;
    unopposedThresholdMet;
    certifiedAt;
    certifiedBy;
    certificationComments;
}
exports.PositionResultDto = PositionResultDto;
__decorate([
    (0, class_validator_1.IsEnum)(index_1.Candidate_Position),
    __metadata("design:type", String)
], PositionResultDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PositionResultDto.prototype, "totalVotes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PositionResultDto.prototype, "totalEligibleVoters", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PositionResultDto.prototype, "turnoutPercentage", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => VoteCountDto),
    __metadata("design:type", Array)
], PositionResultDto.prototype, "candidates", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(result_status_enum_1.ResultStatus),
    __metadata("design:type", String)
], PositionResultDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(result_status_enum_1.CertificationStatus),
    __metadata("design:type", String)
], PositionResultDto.prototype, "certificationStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VoteCountDto),
    __metadata("design:type", VoteCountDto)
], PositionResultDto.prototype, "winner", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PositionResultDto.prototype, "requiresRunoff", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PositionResultDto.prototype, "unopposedThresholdMet", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PositionResultDto.prototype, "certifiedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PositionResultDto.prototype, "certifiedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PositionResultDto.prototype, "certificationComments", void 0);
//# sourceMappingURL=position-result.dto.js.map