"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const file_upload_service_1 = require("./services/file-upload.service");
const cloudinary_service_1 = require("./services/cloudinary.service");
const image_validation_service_1 = require("./services/image-validation.service");
const photo_processing_service_1 = require("./services/photo-processing.service");
const file_upload_controller_1 = require("./file-upload.controller");
let FileUploadModule = class FileUploadModule {
};
exports.FileUploadModule = FileUploadModule;
exports.FileUploadModule = FileUploadModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [file_upload_controller_1.FileUploadController],
        providers: [
            file_upload_service_1.FileUploadService,
            cloudinary_service_1.CloudinaryService,
            image_validation_service_1.ImageValidationService,
            photo_processing_service_1.PhotoProcessingService,
        ],
        exports: [
            file_upload_service_1.FileUploadService,
            cloudinary_service_1.CloudinaryService,
            image_validation_service_1.ImageValidationService,
            photo_processing_service_1.PhotoProcessingService,
        ],
    })
], FileUploadModule);
//# sourceMappingURL=file-upload.module.js.map