export declare class UploadResponseDto {
    fileId: string;
    url: string;
    secureUrl: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    folder?: string;
    uploadedAt: string;
}
export declare class CandidatePhotoDto {
    candidateId: string;
    caption?: string;
    altText?: string;
}
export declare class FileValidationDto {
    filename: string;
    mimetype: string;
    size: number;
}
