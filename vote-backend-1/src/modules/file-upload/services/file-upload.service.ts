import {BadRequestException, Injectable} from "@nestjs/common";
import { CloudinaryService } from "./cloudinary.service";
import { ImageValidationService } from "./image-validation.service";
import { PhotoProcessingService } from "./photo-processing.service";
import {CandidatePhotoDto, UploadResponseDto} from "../dto/upload-response.dto";


@Injectable()
export class FileUploadService {
    constructor(
        private cloudinaryService: CloudinaryService,
        private imageValidationService: ImageValidationService,
        private photoProcessingService: PhotoProcessingService,
    ) {
        console.log('Instantiating FileService');
    }

    async uploadCandidatePhoto(
        file: Express.Multer.File,
        candidatePhotoDto: CandidatePhotoDto,
    ): Promise<UploadResponseDto> {
        // Validate file
        this.imageValidationService.validateFile(file);

        // Upload to Cloudinary
        const uploadResult = await this.cloudinaryService.uploadCandidatePhoto(
            file,
            candidatePhotoDto.candidateId,
        );

        // Process response
        const processedResponse = this.photoProcessingService.processUploadResponse(uploadResult);

        // Save to database (you'll implement this based on your Prisma schema)
        // await this.saveCandidatePhoto(processedResponse, candidatePhotoDto);

        return processedResponse;
    }

    async uploadNominationDocument(
        file: Express.Multer.File,
        nominationId: string,
    ): Promise<UploadResponseDto> {
        // Basic validation for documents
        if (file.size > 10 * 1024 * 1024) { // 10MB for documents
            throw new BadRequestException('Document too large. Maximum size: 10MB');
        }

        const uploadResult = await this.cloudinaryService.uploadNominationDocument(
            file,
            nominationId,
        );

        return this.photoProcessingService.processUploadResponse(uploadResult);
    }

    async deleteFile(publicId: string): Promise<void> {
        await this.cloudinaryService.deleteFile(publicId);
        // Also delete from database
    }

    async getFileInfo(publicId: string) {
        return await this.cloudinaryService.getFileInfo(publicId);
    }

    generatePhotoUrls(publicId: string) {
        const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;

        return this.photoProcessingService.generateResponsiveUrls(baseUrl);
    }
}