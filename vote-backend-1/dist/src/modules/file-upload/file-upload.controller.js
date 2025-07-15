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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const file_upload_service_1 = require("./services/file-upload.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_roles_enum_1 = require("../users/enums/user-roles.enum");
const platform_express_1 = require("@nestjs/platform-express");
const upload_response_dto_1 = require("./dto/upload-response.dto");
const file_validation_interceptor_1 = require("./interceptors/file-validation.interceptor");
let FileUploadController = class FileUploadController {
    fileUploadService;
    constructor(fileUploadService) {
        this.fileUploadService = fileUploadService;
    }
    async uploadCandidatePhoto(file, candidatePhotoDto) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        return await this.fileUploadService.uploadCandidatePhoto(file, candidatePhotoDto);
    }
    async uploadNominationDocument(file, nominationId) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        return await this.fileUploadService.uploadNominationDocument(file, nominationId);
    }
    async deleteFile(publicId) {
        await this.fileUploadService.deleteFile(publicId);
        return { message: 'File deleted successfully' };
    }
    async getFileInfo(publicId) {
        return await this.fileUploadService.getFileInfo(publicId);
    }
    async getPhotoUrls(publicId) {
        return this.fileUploadService.generatePhotoUrls(publicId);
    }
};
exports.FileUploadController = FileUploadController;
__decorate([
    (0, common_1.Post)('candidate-photo'),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRoles.ASPIRANT, user_roles_enum_1.UserRoles.SUPER_ADMIN, user_roles_enum_1.UserRoles.EC_MEMBER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo'), file_validation_interceptor_1.FileValidationInterceptor),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_response_dto_1.CandidatePhotoDto]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadCandidatePhoto", null);
__decorate([
    (0, common_1.Post)('nomination-document/:nominationId'),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRoles.ASPIRANT, user_roles_enum_1.UserRoles.SUPER_ADMIN, user_roles_enum_1.UserRoles.EC_MEMBER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Param)('nominationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadNominationDocument", null);
__decorate([
    (0, common_1.Delete)(':publicId'),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRoles.SUPER_ADMIN, user_roles_enum_1.UserRoles.EC_MEMBER),
    __param(0, (0, common_1.Param)('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)('info/:publicId'),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRoles.SUPER_ADMIN, user_roles_enum_1.UserRoles.EC_MEMBER),
    __param(0, (0, common_1.Param)('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFileInfo", null);
__decorate([
    (0, common_1.Get)('urls/:publicId'),
    __param(0, (0, common_1.Param)('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getPhotoUrls", null);
exports.FileUploadController = FileUploadController = __decorate([
    (0, common_1.Controller)('file-upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map