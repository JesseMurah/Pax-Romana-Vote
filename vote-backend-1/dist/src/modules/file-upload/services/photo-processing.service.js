"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoProcessingService = void 0;
const common_1 = require("@nestjs/common");
let PhotoProcessingService = class PhotoProcessingService {
    generateThumbnail(originalUrl, width = 150, height = 150) {
        const publicId = this.extractPublicId(originalUrl);
        return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,g_face,q_auto:good/${publicId}.jpg`;
    }
    generateResponsiveUrls(originalUrl) {
        const publicId = this.extractPublicId(originalUrl);
        const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
        return {
            small: `${baseUrl}/w_200,h_200,c_fill,g_face,q_auto:good/${publicId}.jpg`,
            medium: `${baseUrl}/w_400,h_400,c_fill,g_face,q_auto:good/${publicId}.jpg`,
            large: `${baseUrl}/w_800,h_800,c_fill,g_face,q_auto:good/${publicId}.jpg`,
        };
    }
    extractPublicId(url) {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        const publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
        return publicIdWithExtension.replace(/\.[^/.]+$/, '');
    }
    processUploadResponse(response) {
        return {
            fileId: response.public_id,
            url: response.url,
            secureUrl: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            width: response.width,
            height: response.height,
            bytes: response.bytes,
            folder: response.folder,
            uploadedAt: response.created_at,
        };
    }
};
exports.PhotoProcessingService = PhotoProcessingService;
exports.PhotoProcessingService = PhotoProcessingService = __decorate([
    (0, common_1.Injectable)()
], PhotoProcessingService);
//# sourceMappingURL=photo-processing.service.js.map