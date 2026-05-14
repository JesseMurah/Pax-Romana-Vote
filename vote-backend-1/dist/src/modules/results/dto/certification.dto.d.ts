import { Candidate_Position } from "@prisma/client/index";
export declare class CertifyPositionDto {
    position: Candidate_Position;
    comments?: string;
}
export declare class CertifyResultsDto {
    positions: CertifyPositionDto[];
    overallComments?: string;
}
export declare class CertificationRecordDto {
    id: string;
    position: Candidate_Position;
    certifiedBy: string;
    certifiedByName: string;
    comments?: string;
    certifiedAt: string;
    finalVoteCounts: any[];
}
