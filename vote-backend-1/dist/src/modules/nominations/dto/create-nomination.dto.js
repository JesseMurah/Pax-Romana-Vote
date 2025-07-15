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
exports.CreateNominationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class NominatorVerificationDto {
    name;
    email;
    contact;
    level;
    subgroup;
    programme;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NominatorVerificationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], NominatorVerificationDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NominatorVerificationDto.prototype, "contact", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NominatorVerificationDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NominatorVerificationDto.prototype, "subgroup", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NominatorVerificationDto.prototype, "programme", void 0);
class GuarantorVerificationDto {
    name;
    email;
    contact;
    programme;
    subgroup;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuarantorVerificationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], GuarantorVerificationDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuarantorVerificationDto.prototype, "contact", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuarantorVerificationDto.prototype, "programme", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuarantorVerificationDto.prototype, "subgroup", void 0);
class CreateNominationDto {
    aspirantName;
    aspirantPhoneNumber;
    aspirantEmail;
    position;
    photoUrl;
    nomineeCollege;
    nomineeDepartment;
    nomineeDateOfBirth;
    nomineeHostel;
    nomineeRoom;
    nomineeSex;
    nomineeCwa;
    nomineeProgramme;
    nomineeLevel;
    nomineeParish;
    nomineeNationality;
    nomineeRegion;
    nomineeSubgroups;
    nomineeEducation;
    hasLeadershipPosition;
    leadershipPositions;
    hasServedCommittee;
    committees;
    skills;
    visionForOffice;
    knowledgeAboutOffice;
    nominatorVerification;
    guarantorVerifications;
}
exports.CreateNominationDto = CreateNominationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "aspirantName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "aspirantPhoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "aspirantEmail", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Candidate_Position),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "photoUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeCollege", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeDepartment", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeDateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeHostel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeRoom", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeSex", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeCwa", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeProgramme", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeLevel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeParish", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeNationality", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "nomineeRegion", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateNominationDto.prototype, "nomineeSubgroups", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateNominationDto.prototype, "nomineeEducation", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNominationDto.prototype, "hasLeadershipPosition", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateNominationDto.prototype, "leadershipPositions", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNominationDto.prototype, "hasServedCommittee", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateNominationDto.prototype, "committees", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateNominationDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateNominationDto.prototype, "visionForOffice", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateNominationDto.prototype, "knowledgeAboutOffice", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NominatorVerificationDto),
    __metadata("design:type", NominatorVerificationDto)
], CreateNominationDto.prototype, "nominatorVerification", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GuarantorVerificationDto),
    __metadata("design:type", Array)
], CreateNominationDto.prototype, "guarantorVerifications", void 0);
//# sourceMappingURL=create-nomination.dto.js.map