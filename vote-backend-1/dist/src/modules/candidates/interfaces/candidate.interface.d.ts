import { Candidate_Position } from "@prisma/client/index";
export interface ICandidateCreate {
    name: string;
    position: Candidate_Position;
    biography?: string;
    candidateNumber: number;
    displayOrder?: number;
    photoUrl?: string;
    photoPublicId?: string;
    nominationId?: string;
}
export interface ICandidateUpdate {
    name?: string;
    biography?: string;
    displayOrder?: number;
    photoUrl?: string;
    photoPublicId?: string;
    isActive?: boolean;
}
export interface IPhotoUpload {
    file: Express.Multer.File;
    candidateId: string;
}
