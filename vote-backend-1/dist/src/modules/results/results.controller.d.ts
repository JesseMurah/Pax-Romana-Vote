import { ResultsService } from "./services/results.service";
import { CertificationService } from "./services/certification.service";
import { VoteCountingService } from "./services/vote-counting.service";
import { Candidate_Position } from "@prisma/client/index";
import { CertifyResultsDto } from "./dto/certification.dto";
import { ExportOptionsDto } from "./dto/export-options.dto";
import { ExportFormat } from "./enums/result-status.enum";
import { Response } from 'express';
export declare class ResultsController {
    private resultsService;
    private certificationService;
    private voteCountingService;
    constructor(resultsService: ResultsService, certificationService: CertificationService, voteCountingService: VoteCountingService);
    getPublicResults(): Promise<any>;
    getResultsSummary(): Promise<import("./types/results.types").ResultSummary>;
    getPositionResults(position: Candidate_Position): Promise<import("./types/results.types").PositionResult>;
    getWinnerAnnouncements(): Promise<any[]>;
    getDisputedResults(): Promise<import("./types/results.types").PositionResult[]>;
    getElectionStatistics(): Promise<any>;
    certifyResults(certifyDto: CertifyResultsDto, user: any): Promise<{
        success: boolean;
        certifiedPositions: string[];
        errors: string[];
    }>;
    getCertificationHistory(): Promise<any[]>;
    recountPosition(position: Candidate_Position, user: any): Promise<import("./types/results.types").PositionResult>;
    refreshResults(user: any): Promise<{
        message: string;
    }>;
    exportResults(exportOptions: ExportOptionsDto, res: Response): Promise<void>;
    exportResultsAsPDF(res: Response): Promise<void>;
    exportResultsAsCSV(res: Response): Promise<void>;
    exportResultsAsJSON(res: Response): Promise<void>;
    exportCertifiedResults(format: ExportFormat, res: Response): Promise<void>;
    exportPositionResults(body: {
        positions: Candidate_Position[];
        format?: ExportFormat;
    }, res: Response): Promise<void>;
    generateOfficialCertificate(res: Response): Promise<void>;
    generateResultsSnapshot(body: {
        format?: ExportFormat;
    }, res: Response): Promise<void>;
    updateCandidateVoteCounts(): Promise<{
        message: string;
    }>;
    revokeCertification(position: Candidate_Position, reason: string, user: any): Promise<{
        message: string;
    }>;
    private getContentType;
    private getFileExtension;
}
