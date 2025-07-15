import { Injectable } from "@nestjs/common";
import { UploadApiResponse } from "cloudinary";


@Injectable()
export class PhotoProcessingService {
    generateThumbnail(originalUrl: string, width: number = 150, height: number = 150): string {
        // Extract public_id from Cloudinary URL
        const publicId = this.extractPublicId(originalUrl);

        return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,g_face,q_auto:good/${publicId}.jpg`;
    }
    
    generateResponsiveUrls(originalUrl: string): {
        small: string;
        medium: string;
        large: string;
    } {
        const publicId = this.extractPublicId(originalUrl);
        const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

        return {
            small: `${baseUrl}/w_200,h_200,c_fill,g_face,q_auto:good/${publicId}.jpg`,
            medium: `${baseUrl}/w_400,h_400,c_fill,g_face,q_auto:good/${publicId}.jpg`,
            large: `${baseUrl}/w_800,h_800,c_fill,g_face,q_auto:good/${publicId}.jpg`,
        };
    }

    private extractPublicId(url: string): string {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        const publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
        return publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove extension
    }

    processUploadResponse(response: UploadApiResponse) {
        return {
            fileId: response.public_id,
            url: response.url,
            secureUrl: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            width: response.width,
            height: response.height,
            bytes: response.bytes,
            folder: response.folder,
            uploadedAt: response.created_at,
        };
    }
}