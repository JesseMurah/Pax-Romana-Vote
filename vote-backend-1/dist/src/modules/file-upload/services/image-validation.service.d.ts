import { FileValidationDto } from "../dto/upload-response.dto";
export declare class ImageValidationService {
    private readonly ALLOWED_MIME_TYPES;
    private readonly MAX_FILE_SIZE;
    private readonly MIN_DIMENSIONS;
    private readonly MAX_DIMENSIONS;
    validateFile(file: Express.Multer.File): FileValidationDto;
    private validateMimeType;
    private validateFileSize;
    private validateFileName;
    validateImageDimensions(file: Express.Multer.File): Promise<void>;
}
