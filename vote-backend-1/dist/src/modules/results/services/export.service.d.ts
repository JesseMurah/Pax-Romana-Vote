import { VoteCountingService } from "./vote-counting.service";
import { CertificationService } from "./certification.service";
import { ExportOptionsDto } from "../dto/export-options.dto";
export declare class ExportService {
    private voteCountingService;
    private certificationService;
    private readonly logger;
    constructor(voteCountingService: VoteCountingService, certificationService: CertificationService);
    exportResults(options: ExportOptionsDto): Promise<Buffer>;
    private exportToPDF;
    private exportToJSON;
    private exportToCSV;
    generateOfficialCertificate(): Promise<Buffer>;
}
