import { IsOptional, IsString } from "class-validator";

export enum UploadFolders {
    CANDIDATES = 'candidates',
    PROFILES = 'profiles',
    DOCUMENTS = 'documents',
    UPLOADS = 'uploads'
}

export class FileUploadDto {
    @IsOptional()
    @IsString()
    folder?: string;

    @IsOptional()
    @IsString()
    filename?: string;
}

export class CandidatePhotoUploadDto {
    @IsOptional()
    @IsString()
    candidateId?: string;
}