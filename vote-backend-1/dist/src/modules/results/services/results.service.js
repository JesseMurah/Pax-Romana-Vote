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
var ResultsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsService = void 0;
const common_1 = require("@nestjs/common");
const vote_counting_service_1 = require("./vote-counting.service");
const certification_service_1 = require("./certification.service");
const export_service_1 = require("./export.service");
const cache_service_1 = require("../../caches/cache.service");
const real_time_service_1 = require("../../real-time/services/real-time.service");
const sse_event_types_enum_1 = require("../../real-time/enums/sse-event-types.enum");
const result_status_enum_1 = require("../enums/result-status.enum");
let ResultsService = ResultsService_1 = class ResultsService {
    voteCountingService;
    certificationService;
    exportService;
    sseService;
    cacheService;
    logger = new common_1.Logger(ResultsService_1.name);
    constructor(voteCountingService, certificationService, exportService, sseService, cacheService) {
        this.voteCountingService = voteCountingService;
        this.certificationService = certificationService;
        this.exportService = exportService;
        this.sseService = sseService;
        this.cacheService = cacheService;
    }
    async getResultsSummary(useCache = true) {
        const cacheKey = 'all_results_summary';
        if (useCache) {
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }
        }
        this.logger.log('Generating complete results summary');
        const positionResults = await this.voteCountingService.countAllVotes();
        const summary = {
            totalPositions: positionResults.length,
            certifiedPositions: positionResults.filter(r => r.certificationStatus === 'CERTIFIED_FINAL').length,
            pendingPositions: positionResults.filter(r => r.certificationStatus === 'NOT_CERTIFIED').length,
            totalVotesCast: positionResults.reduce((sum, r) => sum + r.totalVotes, 0),
            totalEligibleVoters: positionResults[0]?.totalEligibleVoters || 0,
            overallTurnout: 0,
            positionResults,
            lastUpdated: new Date(),
            electionComplete: await this.certificationService.isElectionFullyCertified(),
        };
        if (summary.totalEligibleVoters > 0) {
            summary.overallTurnout = Math.round((summary.totalVotesCast / summary.totalEligibleVoters) * 100 * 100) / 100;
        }
        await this.cacheService.set(cacheKey, summary, 120);
        return summary;
    }
    async getPositionResults(position) {
        return this.voteCountingService.countVotesForPosition(position);
    }
    async exportResults(options) {
        this.logger.log(`Exporting results in ${options.format} format via ResultsService`);
        return this.exportService.exportResults(options);
    }
    async exportResultsAsPDF(positions, certifiedOnly = false, includeAuditTrail = false) {
        const exportOptions = {
            format: result_status_enum_1.ExportFormat.PDF,
            positions,
            certifiedOnly,
            includeAuditTrail,
        };
        return this.exportService.exportResults(exportOptions);
    }
    async exportResultsAsJSON(positions, certifiedOnly = false, includeAuditTrail = false) {
        const exportOptions = {
            format: result_status_enum_1.ExportFormat.JSON,
            positions,
            certifiedOnly,
            includeAuditTrail,
        };
        return this.exportService.exportResults(exportOptions);
    }
    async exportResultsAsCSV(positions, certifiedOnly = false, includeAuditTrail = false) {
        const exportOptions = {
            format: result_status_enum_1.ExportFormat.CSV,
            positions,
            certifiedOnly,
            includeAuditTrail,
        };
        return this.exportService.exportResults(exportOptions);
    }
    async generateOfficialCertificate() {
        this.logger.log('Generating official election certificate');
        return this.exportService.generateOfficialCertificate();
    }
    async exportCertifiedResults(format) {
        const exportOptions = {
            format,
            certifiedOnly: true,
            includeAuditTrail: true,
        };
        this.logger.log(`Exporting certified results in ${format} format`);
        return this.exportService.exportResults(exportOptions);
    }
    async updateAndBroadcastResults() {
        this.logger.log('Updating and broadcasting results');
        await this.voteCountingService.clearResultsCache();
        await this.cacheService.del('all_results_summary');
        const summary = await this.getResultsSummary(false);
        this.sseService.broadcast({
            type: sse_event_types_enum_1.SseEventType.RESULT_UPDATE,
            data: {
                summary: {
                    totalVotesCast: summary.totalVotesCast,
                    overallTurnout: summary.overallTurnout,
                    certifiedPositions: summary.certifiedPositions,
                    lastUpdated: summary.lastUpdated,
                },
                positions: summary.positionResults.map(p => ({
                    position: p.position,
                    totalVotes: p.totalVotes,
                    winner: p.winner ? {
                        name: p.winner.candidateName,
                        voteCount: p.winner.voteCount,
                        percentage: p.winner.percentage,
                    } : null,
                    status: p.status,
                    certificationStatus: p.certificationStatus,
                })),
            },
            timestamp: new Date(),
        });
        this.logger.log('Results updated and broadcasted');
    }
    async getPublicResults() {
        const summary = await this.getResultsSummary();
        return {
            totalVotesCast: summary.totalVotesCast,
            overallTurnout: summary.overallTurnout,
            electionComplete: summary.electionComplete,
            positions: summary.positionResults.map(position => ({
                position: position.position,
                totalVotes: position.totalVotes,
                candidateCount: position.candidates.length,
                winner: position.winner && position.certificationStatus === 'CERTIFIED_FINAL' ? {
                    name: position.winner.candidateName,
                    voteCount: position.winner.voteCount,
                    percentage: position.winner.percentage,
                } : null,
                status: position.status,
                certified: position.certificationStatus === 'CERTIFIED_FINAL',
            })),
            lastUpdated: summary.lastUpdated,
        };
    }
    async getAdminResults() {
        return this.getResultsSummary();
    }
    async recountPosition(position, triggeredBy) {
        this.logger.log(`Recount triggered for ${position} by user ${triggeredBy}`);
        await this.cacheService.del(`position_results:${position}`);
        const result = await this.voteCountingService.countVotesForPosition(position, false);
        await this.logRecountAction(position, triggeredBy, result);
        this.sseService.broadcastToAdmins({
            type: sse_event_types_enum_1.SseEventType.RESULT_UPDATE,
            data: {
                action: 'RECOUNT_COMPLETED',
                position,
                triggeredBy,
                result: {
                    totalVotes: result.totalVotes,
                    winner: result.winner,
                    candidates: result.candidates,
                },
            },
            timestamp: new Date(),
        });
        return result;
    }
    async logRecountAction(position, triggeredBy, result) {
        this.logger.log(`Recount completed for ${position} by ${triggeredBy}. New total: ${result.totalVotes} votes`);
    }
    async getWinnerAnnouncements() {
        const summary = await this.getResultsSummary();
        const announcements = [];
        for (const position of summary.positionResults) {
            if (position.winner && position.certificationStatus === 'CERTIFIED_FINAL') {
                announcements.push({
                    position: position.position,
                    winner: {
                        name: position.winner.candidateName,
                        candidateNumber: position.winner.candidateNumber,
                        voteCount: position.winner.voteCount,
                        percentage: position.winner.percentage,
                    },
                    isUnopposed: position.winner.isUnopposed,
                    certifiedAt: position.certifiedAt,
                });
            }
        }
        return announcements;
    }
    async getDisputedResults() {
        const summary = await this.getResultsSummary();
        return summary.positionResults.filter(position => position.status === 'DISPUTED' || position.requiresRunoff);
    }
    async generateElectionStatistics() {
        const summary = await this.getResultsSummary();
        const stats = {
            participation: {
                totalEligibleVoters: summary.totalEligibleVoters,
                totalVotesCast: summary.totalVotesCast,
                overallTurnout: summary.overallTurnout,
                positionTurnouts: summary.positionResults.map(p => ({
                    position: p.position,
                    turnout: p.turnoutPercentage,
                })),
            },
            competition: {
                contestedPositions: summary.positionResults.filter(p => p.candidates.length > 1).length,
                unopposedPositions: summary.positionResults.filter(p => p.candidates.length === 1).length,
                averageCandidatesPerPosition: summary.positionResults.reduce((sum, p) => sum + p.candidates.length, 0) / summary.positionResults.length,
            },
            results: {
                certifiedPositions: summary.certifiedPositions,
                pendingPositions: summary.pendingPositions,
                disputedPositions: summary.positionResults.filter(p => p.status === 'DISPUTED').length,
            },
            margins: summary.positionResults.map(p => {
                if (p.candidates.length < 2)
                    return null;
                const margin = p.candidates[0].voteCount - p.candidates[1].voteCount;
                return {
                    position: p.position,
                    winningMargin: margin,
                    marginPercentage: p.totalVotes > 0 ? (margin / p.totalVotes) * 100 : 0,
                };
            }).filter(Boolean),
        };
        return stats;
    }
    async generateResultsSnapshot(format = result_status_enum_1.ExportFormat.JSON) {
        this.logger.log('Generating results snapshot for archival');
        const exportOptions = {
            format,
            certifiedOnly: false,
            includeAuditTrail: true,
        };
        return this.exportService.exportResults(exportOptions);
    }
    async exportPositionResults(positions, format = result_status_enum_1.ExportFormat.PDF) {
        this.logger.log(`Exporting results for positions: ${positions.join(', ')}`);
        const exportOptions = {
            format,
            positions,
            certifiedOnly: false,
            includeAuditTrail: false,
        };
        return this.exportService.exportResults(exportOptions);
    }
};
exports.ResultsService = ResultsService;
exports.ResultsService = ResultsService = ResultsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vote_counting_service_1.VoteCountingService,
        certification_service_1.CertificationService,
        export_service_1.ExportService,
        real_time_service_1.RealTimeService,
        cache_service_1.CacheService])
], ResultsService);
//# sourceMappingURL=results.service.js.map