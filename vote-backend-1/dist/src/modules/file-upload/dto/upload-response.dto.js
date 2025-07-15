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
exports.FileValidationDto = exports.CandidatePhotoDto = exports.UploadResponseDto = void 0;
const class_validator_1 = require("class-validator");
class UploadResponseDto {
    fileId;
    url;
    secureUrl;
    publicId;
    format;
    width;
    height;
    bytes;
    folder;
    uploadedAt;
}
exports.UploadResponseDto = UploadResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "fileId", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "secureUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "publicId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "format", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UploadResponseDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UploadResponseDto.prototype, "height", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UploadResponseDto.prototype, "bytes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "folder", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadResponseDto.prototype, "uploadedAt", void 0);
class CandidatePhotoDto {
    candidateId;
    caption;
    altText;
}
exports.CandidatePhotoDto = CandidatePhotoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CandidatePhotoDto.prototype, "candidateId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CandidatePhotoDto.prototype, "caption", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CandidatePhotoDto.prototype, "altText", void 0);
class FileValidationDto {
    filename;
    mimetype;
    size;
}
exports.FileValidationDto = FileValidationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileValidationDto.prototype, "filename", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileValidationDto.prototype, "mimetype", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FileValidationDto.prototype, "size", void 0);
//# sourceMappingURL=upload-response.dto.js.map