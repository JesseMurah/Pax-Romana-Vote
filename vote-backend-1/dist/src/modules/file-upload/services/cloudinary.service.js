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
exports.CloudinaryService = void 0;
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const common_1 = require("@nestjs/common");
let CloudinaryService = class CloudinaryService {
    configService;
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    async uploadCandidatePhoto(file, candidateId) {
        try {
            const result = await cloudinary_1.v2.uploader.upload(file.buffer.toString('base64'), {
                folder: `pax-romana/candidates/${candidateId}`,
                public_id: `candidate-${candidateId}-${Date.now()}`,
                transformation: [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                    { quality: 'auto:good' },
                    { format: 'jpg' },
                ],
                resource_type: 'image',
            });
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to upload image to Cloudinary');
        }
    }
    async uploadNominationDocument(file, nominationId) {
        try {
            const result = await cloudinary_1.v2.uploader.upload(file.buffer.toString('base64'), {
                folder: `pax-romana/nominations/${nominationId}`,
                public_id: `nomination-${nominationId}-${Date.now()}`,
                resource_type: 'auto',
            });
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to upload document to Cloudinary');
        }
    }
    async deleteFile(publicId) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to delete file from Cloudinary');
        }
    }
    async getFileInfo(publicId) {
        try {
            return await cloudinary_1.v2.api.resource(publicId);
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to get file info from Cloudinary');
        }
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map