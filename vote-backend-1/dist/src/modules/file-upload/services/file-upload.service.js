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
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_service_1 = require("./cloudinary.service");
const image_validation_service_1 = require("./image-validation.service");
const photo_processing_service_1 = require("./photo-processing.service");
let FileUploadService = class FileUploadService {
    cloudinaryService;
    imageValidationService;
    photoProcessingService;
    constructor(cloudinaryService, imageValidationService, photoProcessingService) {
        this.cloudinaryService = cloudinaryService;
        this.imageValidationService = imageValidationService;
        this.photoProcessingService = photoProcessingService;
        console.log('Instantiating FileService');
    }
    async uploadCandidatePhoto(file, candidatePhotoDto) {
        this.imageValidationService.validateFile(file);
        const uploadResult = await this.cloudinaryService.uploadCandidatePhoto(file, candidatePhotoDto.candidateId);
        const processedResponse = this.photoProcessingService.processUploadResponse(uploadResult);
        return processedResponse;
    }
    async uploadNominationDocument(file, nominationId) {
        if (file.size > 10 * 1024 * 1024) {
            throw new common_1.BadRequestException('Document too large. Maximum size: 10MB');
        }
        const uploadResult = await this.cloudinaryService.uploadNominationDocument(file, nominationId);
        return this.photoProcessingService.processUploadResponse(uploadResult);
    }
    async deleteFile(publicId) {
        await this.cloudinaryService.deleteFile(publicId);
    }
    async getFileInfo(publicId) {
        return await this.cloudinaryService.getFileInfo(publicId);
    }
    generatePhotoUrls(publicId) {
        const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
        return this.photoProcessingService.generateResponsiveUrls(baseUrl);
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService,
        image_validation_service_1.ImageValidationService,
        photo_processing_service_1.PhotoProcessingService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map