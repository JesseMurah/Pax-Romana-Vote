import { CloudinaryService } from "./cloudinary.service";
import { ImageValidationService } from "./image-validation.service";
import { PhotoProcessingService } from "./photo-processing.service";
import { CandidatePhotoDto, UploadResponseDto } from "../dto/upload-response.dto";
export declare class FileUploadService {
    private cloudinaryService;
    private imageValidationService;
    private photoProcessingService;
    constructor(cloudinaryService: CloudinaryService, imageValidationService: ImageValidationService, photoProcessingService: PhotoProcessingService);
    uploadCandidatePhoto(file: Express.Multer.File, candidatePhotoDto: CandidatePhotoDto): Promise<UploadResponseDto>;
    uploadNominationDocument(file: Express.Multer.File, nominationId: string): Promise<UploadResponseDto>;
    deleteFile(publicId: string): Promise<void>;
    getFileInfo(publicId: string): Promise<any>;
    generatePhotoUrls(publicId: string): {
        small: string;
        medium: string;
        large: string;
    };
}
