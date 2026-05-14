export declare enum UploadFolders {
    CANDIDATES = "candidates",
    PROFILES = "profiles",
    DOCUMENTS = "documents",
    UPLOADS = "uploads"
}
export declare class FileUploadDto {
    folder?: string;
    filename?: string;
}
export declare class CandidatePhotoUploadDto {
    candidateId?: string;
}
