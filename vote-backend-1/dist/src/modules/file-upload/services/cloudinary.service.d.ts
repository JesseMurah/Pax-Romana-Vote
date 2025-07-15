import { ConfigService } from "@nestjs/config";
import { UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadCandidatePhoto(file: Express.Multer.File, candidateId: string): Promise<UploadApiResponse>;
    uploadNominationDocument(file: Express.Multer.File, nominationId: string): Promise<UploadApiResponse>;
    deleteFile(publicId: string): Promise<void>;
    getFileInfo(publicId: string): Promise<any>;
}
