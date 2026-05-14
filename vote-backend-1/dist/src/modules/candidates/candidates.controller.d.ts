import { HttpStatus } from "@nestjs/common";
import { CandidatesService } from "./candidates.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { Candidate_Position } from "@prisma/client/index";
export declare class CandidatesController {
    private readonly candidatesService;
    constructor(candidatesService: CandidatesService);
    create(createCandidateDto: CreateCandidateDto, nominationId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            id: string;
            name: string;
            position: string;
            photoUrl: any;
            biography: any;
            candidateNumber: number;
            displayOrder: number;
            isActive: boolean;
            voteCount: number;
            createdAt: undefined;
            updatedAt: undefined;
            photoPublicId: number;
        };
    }>;
    findAllForAdmin(): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("../caches/types/cache.types").CandidateCache[];
    }>;
    findOneForAdmin(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            id: string;
            name: string;
            position: string;
            photoUrl: any;
            biography: any;
            candidateNumber: number;
            displayOrder: number;
            isActive: boolean;
            voteCount: number;
            createdAt: undefined;
            updatedAt: undefined;
            photoPublicId: number;
        };
    }>;
    update(id: string, updateCandidateDto: UpdateCandidateDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            id: string;
            name: string;
            position: string;
            photoUrl: any;
            biography: any;
            candidateNumber: number;
            displayOrder: number;
            isActive: boolean;
            voteCount: number;
            createdAt: undefined;
            updatedAt: undefined;
            photoPublicId: number;
        };
    }>;
    remove(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
    uploadPhoto(id: string, file: Express.Multer.File): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            photoUrl: string;
        };
    }>;
    getBallot(): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            [position: string]: import("./dto/ballot-candidate.dto").BallotCandidateDto[];
        };
    }>;
    getCandidatesByPosition(position: Candidate_Position): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            id: string;
            name: string;
            position: string;
            photoUrl: any;
            biography: any;
            candidateNumber: number;
            displayOrder: number;
            isActive: boolean;
            voteCount: number;
            createdAt: undefined;
            updatedAt: undefined;
            photoPublicId: number;
        }[];
    }>;
    getUnapposedPositions(): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import(".prisma/client").$Enums.Candidate_Position[];
    }>;
}
