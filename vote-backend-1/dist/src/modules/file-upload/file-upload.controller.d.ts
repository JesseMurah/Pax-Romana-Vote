import { FileUploadService } from "./services/file-upload.service";
import { CandidatePhotoDto, UploadResponseDto } from "./dto/upload-response.dto";
export declare class FileUploadController {
    private fileUploadService;
    constructor(fileUploadService: FileUploadService);
    uploadCandidatePhoto(file: Express.Multer.File, candidatePhotoDto: CandidatePhotoDto): Promise<UploadResponseDto>;
    uploadNominationDocument(file: Express.Multer.File, nominationId: string): Promise<UploadResponseDto>;
    deleteFile(publicId: string): Promise<{
        message: string;
    }>;
    getFileInfo(publicId: string): Promise<any>;
    getPhotoUrls(publicId: string): Promise<{
        small: string;
        medium: string;
        large: string;
    }>;
}
