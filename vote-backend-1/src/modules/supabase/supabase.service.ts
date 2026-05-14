import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";
import {BadRequestException, Injectable, InternalServerErrorException} from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
        this.bucketName = this.configService.get<string>('SUPABASE_BUCKET_NAME') || 'candidate-photos';

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL and Key must be provided');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Upload a file to Supabase Storage
     * @param file - The file buffer from multer
     * @param folder - Optional folder path (e.g., 'candidates', 'profiles')
     * @param filename - Optional custom filename
     */
    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'uploads',
        filename?: string
    ): Promise<{
        publicUrl: string;
        filePath: string;
        fileName: string;
    }> {
        try {
            // Validate file
            this.validateFile(file);

            // Generate unique filename
            const fileExtension = file.originalname.split('.').pop();
            const uniqueFileName = filename || `${uuidv4()}.${fileExtension}`;
            const filePath = `${folder}/${uniqueFileName}`;

            // Upload to Supabase Storage
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (error) {
                throw new InternalServerErrorException(`Upload failed: ${error.message}`);
            }

            // Get public URL
            const { data: publicUrlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            return {
                publicUrl: publicUrlData.publicUrl,
                filePath: filePath,
                fileName: uniqueFileName,
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException(`File upload failed: ${error.message}`);
        }
    }

    /**
     * Upload candidate photo specifically
     * @param file - The photo file
     * @param candidateId - The candidate's ID for organizing files
     */
    async uploadCandidatePhoto(
        file: Express.Multer.File,
        candidateId?: string
    ): Promise<{
        publicUrl: string;
        filePath: string;
        fileName: string;
    }> {
        const folder = 'candidates';
        const customFileName = candidateId ? `candidate-${candidateId}` : undefined;

        return this.uploadFile(file, folder, customFileName);
    }

    /**
     * Delete file from Supabase Storage
     * @param filePath - The full path of the file to delete
     */
    async deleteFile(filePath: string): Promise<void> {
        try {
            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .remove([filePath]);

            if (error) {
                throw new InternalServerErrorException(`Delete failed: ${error.message}`);
            }
        } catch (error) {
            throw new InternalServerErrorException(`File deletion failed: ${error.message}`);
        }
    }

    /**
     * Delete candidate photo and update database
     * @param filePath - The file path to delete
     */
    async deleteCandidatePhoto(filePath: string): Promise<void> {
        return this.deleteFile(filePath);
    }

    /**
     * Update/Replace existing file
     * @param file - New file to upload
     * @param oldFilePath - Path of an existing file to replace
     * @param folder - Folder to upload to
     */
    async replaceFile(
        file: Express.Multer.File,
        oldFilePath: string,
        folder: string = 'uploads'
    ): Promise<{
        publicUrl: string;
        filePath: string;
        fileName: string;
    }> {
        try {
            // Delete an old file first
            await this.deleteFile(oldFilePath);

            // Upload a new file
            return this.uploadFile(file, folder);
        } catch (error) {
            throw new InternalServerErrorException(`File replacement failed: ${error.message}`);
        }
    }

    /**
     * Get public URL for existing file
     * @param filePath - The file path
     */
    getPublicUrl(filePath: string): string {
        const { data } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    /**
     * List files in a folder
     * @param folder - Folder path
     * @param limit - Maximum number of files to return
     */
    async listFiles(folder: string = '', limit: number = 100) {
        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .list(folder, {
                    limit,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) {
                throw new InternalServerErrorException(`Failed to list files: ${error.message}`);
            }

            return data;
        } catch (error) {
            throw new InternalServerErrorException(`File listing failed: ${error.message}`);
        }
    }

    /**
     * Validate uploaded file
     * @param file - File to validate
     */
    private validateFile(file: Express.Multer.File): void {
        // Check if a file exists
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Check file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            throw new BadRequestException('File size too large. Maximum size is 5MB');
        }

        // Check file type (images only for candidate photos)
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG & PNG images are allowed'
            );
        }
    }

    /**
     * Get file info/metadata
     * @param filePath - Path to the file
     */
    async getFileInfo(filePath: string) {
        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .list('', {
                    search: filePath.split('/').pop(), // Get filename from path
                });

            if (error) {
                throw new InternalServerErrorException(`Failed to get file info: ${error.message}`);
            }

            return data.find(file => filePath.includes(file.name));
        } catch (error) {
            throw new InternalServerErrorException(`File info retrieval failed: ${error.message}`);
        }
    }
}