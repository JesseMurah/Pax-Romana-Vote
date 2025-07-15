import { UploadApiResponse } from "cloudinary";
export declare class PhotoProcessingService {
    generateThumbnail(originalUrl: string, width?: number, height?: number): string;
    generateResponsiveUrls(originalUrl: string): {
        small: string;
        medium: string;
        large: string;
    };
    private extractPublicId;
    processUploadResponse(response: UploadApiResponse): {
        fileId: string;
        url: string;
        secureUrl: string;
        publicId: string;
        format: string;
        width: number;
        height: number;
        bytes: number;
        folder: any;
        uploadedAt: string;
    };
}
