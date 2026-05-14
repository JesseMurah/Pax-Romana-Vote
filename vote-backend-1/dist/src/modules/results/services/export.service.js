"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const vote_counting_service_1 = require("./vote-counting.service");
const certification_service_1 = require("./certification.service");
const index_1 = require("@prisma/client/index");
const result_status_enum_1 = require("../enums/result-status.enum");
const PDFDocument = require("pdfkit");
let ExportService = ExportService_1 = class ExportService {
    voteCountingService;
    certificationService;
    logger = new common_1.Logger(ExportService_1.name);
    constructor(voteCountingService, certificationService) {
        this.voteCountingService = voteCountingService;
        this.certificationService = certificationService;
    }
    async exportResults(options) {
        this.logger.log(`Exporting results in ${options.format} format`);
        const positions = options.positions || Object.values(index_1.Candidate_Position);
        const results = [];
        for (const position of positions) {
            const result = await this.voteCountingService.countVotesForPosition(position);
            if (options.certifiedOnly && result.certificationStatus === 'NOT_CERTIFIED') {
                continue;
            }
            results.push(result);
        }
        switch (options.format) {
            case result_status_enum_1.ExportFormat.PDF:
                return this.exportToPDF(results, options);
            case result_status_enum_1.ExportFormat.JSON:
                return this.exportToJSON(results, options);
            case result_status_enum_1.ExportFormat.CSV:
                return this.exportToCSV(results, options);
            default:
                throw new Error(`Unsupported export format: ${options.format}`);
        }
    }
    async exportToPDF(results, options) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(20).text('Pax Romana KNUST Election Results', { align: 'center' });
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);
            for (const result of results) {
                doc.fontSize(16).text(`${result.position.replace('_', ' ')}`, { underline: true });
                doc.fontSize(12);
                doc.text(`Total Votes: ${result.totalVotes}`);
                doc.text(`Turnout: ${result.turnoutPercentage}%`);
                doc.text(`Status: ${result.status}`);
                if (result.winner) {
                    doc.text(`Winner: ${result.winner.candidateName} (${result.winner.voteCount} votes, ${result.winner.percentage}%)`);
                }
                doc.moveDown();
                doc.text('Candidates:', { underline: true });
                for (const candidate of result.candidates) {
                    doc.text(`${candidate.candidateNumber}. ${candidate.candidateName}: ${candidate.voteCount} votes (${candidate.percentage}%)`);
                }
                doc.moveDown(2);
            }
            if (options.includeAuditTrail) {
                doc.addPage();
                doc.fontSize(16).text('Certification History', { underline: true });
            }
            doc.end();
        });
    }
    async exportToJSON(results, options) {
        const exportData = {
            metadata: {
                exportedAt: new Date(),
                exportedBy: 'System',
                format: 'JSON',
                options,
            },
            summary: {
                totalPositions: results.length,
                certifiedPositions: results.filter(r => r.certificationStatus === 'CERTIFIED_FINAL').length,
            },
            results,
        };
        if (options.includeAuditTrail) {
            exportData.certificationHistory = await this.certificationService.getCertificationHistory();
        }
        return Buffer.from(JSON.stringify(exportData, null, 2));
    }
    async exportToCSV(results, options) {
        const csvRows = [];
        csvRows.push([
            'Position',
            'Candidate Number',
            'Candidate Name',
            'Vote Count',
            'Percentage',
            'Is Winner',
            'Is Runner Up',
            'Total Position Votes',
            'Position Status',
            'Certification Status'
        ]);
        for (const result of results) {
            for (const candidate of result.candidates) {
                csvRows.push([
                    result.position.replace('_', ' '),
                    candidate.candidateNumber.toString(),
                    candidate.candidateName,
                    candidate.voteCount.toString(),
                    candidate.percentage.toString(),
                    candidate.isWinner ? 'Yes' : 'No',
                    candidate.isRunnerUp ? 'Yes' : 'No',
                    result.totalVotes.toString(),
                    result.status,
                    result.certificationStatus,
                ]);
            }
        }
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        return Buffer.from(csvContent);
    }
    async generateOfficialCertificate() {
        const isFullyCertified = await this.certificationService.isElectionFullyCertified();
        if (!isFullyCertified) {
            throw new Error('Cannot generate official certificate - not all positions are certified');
        }
        const allResults = await this.voteCountingService.countAllVotes();
        const certificationHistory = await this.certificationService.getCertificationHistory();
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(24).text('OFFICIAL ELECTION RESULTS CERTIFICATE', { align: 'center' });
            doc.fontSize(16).text('Pax Romana KNUST Student Elections', { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(12);
            doc.text(`Election Date: August 5 - August 10, 2025`);
            doc.text(`Results Certified: ${new Date().toLocaleDateString()}`);
            doc.text(`Total Eligible Voters: ${allResults[0]?.totalEligibleVoters || 0}`);
            doc.text(`Total Votes Cast: ${allResults.reduce((sum, r) => sum + r.totalVotes, 0)}`);
            doc.moveDown(2);
            doc.fontSize(16).text('ELECTED OFFICIALS', { underline: true });
            doc.fontSize(12);
            for (const result of allResults) {
                if (result.winner) {
                    doc.text(`${result.position.replace('_', ' ')}: ${result.winner.candidateName}`);
                    doc.text(`  Votes: ${result.winner.voteCount} (${result.winner.percentage}%)`);
                    doc.moveDown();
                }
            }
            doc.moveDown(3);
            doc.text('This certificate is issued under the authority of the Election Commission.');
            doc.moveDown(2);
            doc.text('_________________________');
            doc.text('EC Chairperson (Super Admin)');
            doc.text(`Date: ${new Date().toLocaleDateString()}`);
            doc.end();
        });
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = ExportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vote_counting_service_1.VoteCountingService,
        certification_service_1.CertificationService])
], ExportService);
//# sourceMappingURL=export.service.js.map