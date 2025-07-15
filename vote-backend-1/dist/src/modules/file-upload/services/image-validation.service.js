"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageValidationService = void 0;
const common_1 = require("@nestjs/common");
let ImageValidationService = class ImageValidationService {
    ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
    ];
    MAX_FILE_SIZE = 5 * 1024 * 1024;
    MIN_DIMENSIONS = { width: 200, height: 200 };
    MAX_DIMENSIONS = { width: 2000, height: 2000 };
    validateFile(file) {
        this.validateMimeType(file.mimetype);
        this.validateFileSize(file.size);
        this.validateFileName(file.originalname);
        return {
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        };
    }
    validateMimeType(mimetype) {
        if (!this.ALLOWED_MIME_TYPES.includes(mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`);
        }
    }
    validateFileSize(size) {
        if (size > this.MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }
    }
    validateFileName(filename) {
        const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '');
        if (sanitizedName !== filename) {
            throw new common_1.BadRequestException('Invalid characters in filename');
        }
    }
    async validateImageDimensions(file) {
        return Promise.resolve();
    }
};
exports.ImageValidationService = ImageValidationService;
exports.ImageValidationService = ImageValidationService = __decorate([
    (0, common_1.Injectable)()
], ImageValidationService);
//# sourceMappingURL=image-validation.service.js.map