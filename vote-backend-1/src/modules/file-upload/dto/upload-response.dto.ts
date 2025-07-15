import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class UploadResponseDto {
    @IsString()
    fileId: string;

    @IsUrl()
    url: string;

    @IsUrl()
    secureUrl: string;

    @IsString()
    publicId: string;

    @IsString()
    format: string;

    @IsNumber()
    width: number;

    @IsNumber()
    height: number;

    @IsNumber()
    bytes: number;

    @IsString()
    @IsOptional()
    folder?: string;

    @IsString()
    uploadedAt: string;
}

export class CandidatePhotoDto {
    @IsString()
    candidateId: string;

    @IsString()
    @IsOptional()
    caption?: string;

    @IsString()
    @IsOptional()
    altText?: string;
}

export class FileValidationDto {
    @IsString()
    filename: string;

    @IsString()
    mimetype: string;

    @IsNumber()
    size: number;
}