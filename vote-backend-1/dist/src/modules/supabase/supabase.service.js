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
exports.SupabaseService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let SupabaseService = class SupabaseService {
    configService;
    supabase;
    bucketName;
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_ANON_KEY');
        this.bucketName = this.configService.get('SUPABASE_BUCKET_NAME') || 'candidate-photos';
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL and Key must be provided');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async uploadFile(file, folder = 'uploads', filename) {
        try {
            this.validateFile(file);
            const fileExtension = file.originalname.split('.').pop();
            const uniqueFileName = filename || `${(0, uuid_1.v4)()}.${fileExtension}`;
            const filePath = `${folder}/${uniqueFileName}`;
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });
            if (error) {
                throw new common_1.InternalServerErrorException(`Upload failed: ${error.message}`);
            }
            const { data: publicUrlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);
            return {
                publicUrl: publicUrlData.publicUrl,
                filePath: filePath,
                fileName: uniqueFileName,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`File upload failed: ${error.message}`);
        }
    }
    async uploadCandidatePhoto(file, candidateId) {
        const folder = 'candidates';
        const customFileName = candidateId ? `candidate-${candidateId}` : undefined;
        return this.uploadFile(file, folder, customFileName);
    }
    async deleteFile(filePath) {
        try {
            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .remove([filePath]);
            if (error) {
                throw new common_1.InternalServerErrorException(`Delete failed: ${error.message}`);
            }
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`File deletion failed: ${error.message}`);
        }
    }
    async deleteCandidatePhoto(filePath) {
        return this.deleteFile(filePath);
    }
    async replaceFile(file, oldFilePath, folder = 'uploads') {
        try {
            await this.deleteFile(oldFilePath);
            return this.uploadFile(file, folder);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`File replacement failed: ${error.message}`);
        }
    }
    getPublicUrl(filePath) {
        const { data } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);
        return data.publicUrl;
    }
    async listFiles(folder = '', limit = 100) {
        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .list(folder, {
                limit,
                sortBy: { column: 'created_at', order: 'desc' },
            });
            if (error) {
                throw new common_1.InternalServerErrorException(`Failed to list files: ${error.message}`);
            }
            return data;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`File listing failed: ${error.message}`);
        }
    }
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size too large. Maximum size is 5MB');
        }
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only JPEG & PNG images are allowed');
        }
    }
    async getFileInfo(filePath) {
        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .list('', {
                search: filePath.split('/').pop(),
            });
            if (error) {
                throw new common_1.InternalServerErrorException(`Failed to get file info: ${error.message}`);
            }
            return data.find(file => filePath.includes(file.name));
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`File info retrieval failed: ${error.message}`);
        }
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map