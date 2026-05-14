import { ExportFormat } from "../enums/result-status.enum";
import { Candidate_Position } from "@prisma/client/index";
export declare class ExportOptionsDto {
    format: ExportFormat;
    positions?: Candidate_Position[];
    includeAuditTrail?: boolean;
    includeCharts?: boolean;
    certifiedOnly?: boolean;
}
