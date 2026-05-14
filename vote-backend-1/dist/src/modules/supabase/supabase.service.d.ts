import { ConfigService } from "@nestjs/config";
export declare class SupabaseService {
    private configService;
    private supabase;
    private bucketName;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder?: string, filename?: string): Promise<{
        publicUrl: string;
        filePath: string;
        fileName: string;
    }>;
    uploadCandidatePhoto(file: Express.Multer.File, candidateId?: string): Promise<{
        publicUrl: string;
        filePath: string;
        fileName: string;
    }>;
    deleteFile(filePath: string): Promise<void>;
    deleteCandidatePhoto(filePath: string): Promise<void>;
    replaceFile(file: Express.Multer.File, oldFilePath: string, folder?: string): Promise<{
        publicUrl: string;
        filePath: string;
        fileName: string;
    }>;
    getPublicUrl(filePath: string): string;
    listFiles(folder?: string, limit?: number): Promise<import("@supabase/storage-js").FileObject[]>;
    private validateFile;
    getFileInfo(filePath: string): Promise<import("@supabase/storage-js").FileObject | undefined>;
}
