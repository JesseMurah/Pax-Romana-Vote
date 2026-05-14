export interface UploadResult {
    publicUrl: string;
    filePath: string;
    fileName: string;
}
export interface FileMetadata {
    name: string;
    size: number;
    mimetype: string;
    lastModified?: Date;
    metadata?: Record<string, any>;
}
