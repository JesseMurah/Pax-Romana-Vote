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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsController = void 0;
const common_1 = require("@nestjs/common");
const results_service_1 = require("./services/results.service");
const certification_service_1 = require("./services/certification.service");
const vote_counting_service_1 = require("./services/vote-counting.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const index_1 = require("@prisma/client/index");
const certification_dto_1 = require("./dto/certification.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const export_options_dto_1 = require("./dto/export-options.dto");
const result_status_enum_1 = require("./enums/result-status.enum");
let ResultsController = class ResultsController {
    resultsService;
    certificationService;
    voteCountingService;
    constructor(resultsService, certificationService, voteCountingService) {
        this.resultsService = resultsService;
        this.certificationService = certificationService;
        this.voteCountingService = voteCountingService;
    }
    async getPublicResults() {
        return this.resultsService.getPublicResults();
    }
    async getResultsSummary() {
        return this.resultsService.getAdminResults();
    }
    async getPositionResults(position) {
        return this.resultsService.getPositionResults(position);
    }
    async getWinnerAnnouncements() {
        return this.resultsService.getWinnerAnnouncements();
    }
    async getDisputedResults() {
        return this.resultsService.getDisputedResults();
    }
    async getElectionStatistics() {
        return this.resultsService.generateElectionStatistics();
    }
    async certifyResults(certifyDto, user) {
        return this.certificationService.certifyResults(certifyDto, user.id);
    }
    async getCertificationHistory() {
        return this.certificationService.getCertificationHistory();
    }
    async recountPosition(position, user) {
        return this.resultsService.recountPosition(position, user.id);
    }
    async refreshResults(user) {
        await this.resultsService.updateAndBroadcastResults();
        return { message: 'Results refreshed and broadcasted successfully' };
    }
    async exportResults(exportOptions, res) {
        const buffer = await this.resultsService.exportResults(exportOptions);
        const filename = `election_results_${new Date().toISOString().split('T')[0]}`;
        const contentType = this.getContentType(exportOptions.format);
        const extension = this.getFileExtension(exportOptions.format);
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async exportResultsAsPDF(res) {
        const buffer = await this.resultsService.exportResultsAsPDF();
        const filename = `election_results_${new Date().toISOString().split('T')[0]}`;
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}.pdf"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async exportResultsAsCSV(res) {
        const buffer = await this.resultsService.exportResultsAsCSV();
        const filename = `election_results_${new Date().toISOString().split('T')[0]}`;
        res.set({
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async exportResultsAsJSON(res) {
        const buffer = await this.resultsService.exportResultsAsJSON();
        const filename = `election_results_${new Date().toISOString().split('T')[0]}`;
        res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${filename}.json"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async exportCertifiedResults(format, res) {
        const buffer = await this.resultsService.exportCertifiedResults(format);
        const filename = `certified_results_${new Date().toISOString().split('T')[0]}`;
        const contentType = this.getContentType(format);
        const extension = this.getFileExtension(format);
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async exportPositionResults(body, res) {
        const format = body.format || result_status_enum_1.ExportFormat.PDF;
        const buffer = await this.resultsService.exportPositionResults(body.positions, format);
        const positionsStr = body.positions.join('_').toLowerCase();
        const filename = `${positionsStr}_results_${new Date().toISOString().split('T')[0]}`;
        const contentType = this.getContentType(format);
        const extension = this.getFileExtension(format);
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async generateOfficialCertificate(res) {
        const buffer = await this.resultsService.generateOfficialCertificate();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="official_election_certificate.pdf"',
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async generateResultsSnapshot(body, res) {
        const format = body.format || result_status_enum_1.ExportFormat.JSON;
        const buffer = await this.resultsService.generateResultsSnapshot(format);
        const filename = `election_snapshot_${new Date().toISOString().split('T')[0]}`;
        const contentType = this.getContentType(format);
        const extension = this.getFileExtension(format);
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
            'Content-Length': buffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(buffer);
    }
    async updateCandidateVoteCounts() {
        await this.voteCountingService.updateCandidateVoteCounts();
        return { message: 'Candidate vote counts updated successfully' };
    }
    async revokeCertification(position, reason, user) {
        await this.certificationService.revokeCertification(position, user.id, reason);
        return { message: `Certification revoked for ${position}` };
    }
    getContentType(format) {
        const formatStr = typeof format === 'string' ? format : String(format);
        switch (formatStr) {
            case result_status_enum_1.ExportFormat.PDF:
            case 'PDF':
                return 'application/pdf';
            case result_status_enum_1.ExportFormat.JSON:
            case 'JSON':
                return 'application/json';
            case result_status_enum_1.ExportFormat.CSV:
            case 'CSV':
                return 'text/csv';
            default:
                return 'application/octet-stream';
        }
    }
    getFileExtension(format) {
        const formatStr = typeof format === 'string' ? format : String(format);
        switch (formatStr) {
            case result_status_enum_1.ExportFormat.PDF:
            case 'PDF':
                return 'pdf';
            case result_status_enum_1.ExportFormat.JSON:
            case 'JSON':
                return 'json';
            case result_status_enum_1.ExportFormat.CSV:
            case 'CSV':
                return 'csv';
            default:
                return 'bin';
        }
    }
};
exports.ResultsController = ResultsController;
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "getPublicResults", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "getResultsSummary", null);
__decorate([
    (0, common_1.Get)('position/:position'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, common_1.Param)('position', new common_1.ParseEnumPipe(index_1.Candidate_Position))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "getPositionResults", null);
__decorate([
    (0, common_1.Get)('winners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "getWinnerAnnouncements", null);
__decorate([
    (0, common_1.Get)('disputed'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "getDisputedResults", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "getElectionStatistics", null);
__decorate([
    (0, common_1.Post)('certify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [certification_dto_1.CertifyResultsDto, Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "certifyResults", null);
__decorate([
    (0, common_1.Get)('certifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "getCertificationHistory", null);
__decorate([
    (0, common_1.Post)('recount/:position'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('position', new common_1.ParseEnumPipe(index_1.Candidate_Position))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "recountPosition", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "refreshResults", null);
__decorate([
    (0, common_1.Post)('export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_options_dto_1.ExportOptionsDto, Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "exportResults", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "exportResultsAsPDF", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "exportResultsAsCSV", null);
__decorate([
    (0, common_1.Get)('export/json'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "exportResultsAsJSON", null);
__decorate([
    (0, common_1.Get)('export/certified/:format'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, common_1.Param)('format', new common_1.ParseEnumPipe(result_status_enum_1.ExportFormat))),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "exportCertifiedResults", null);
__decorate([
    (0, common_1.Post)('export/positions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "exportPositionResults", null);
__decorate([
    (0, common_1.Get)('certificate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "generateOfficialCertificate", null);
__decorate([
    (0, common_1.Post)('snapshot'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "generateResultsSnapshot", null);
__decorate([
    (0, common_1.Post)('update-counts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "updateCandidateVoteCounts", null);
__decorate([
    (0, common_1.Post)('revoke-certification/:position'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('position', new common_1.ParseEnumPipe(index_1.Candidate_Position))),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ResultsController.prototype, "revokeCertification", null);
exports.ResultsController = ResultsController = __decorate([
    (0, common_1.Controller)('results'),
    __metadata("design:paramtypes", [results_service_1.ResultsService,
        certification_service_1.CertificationService,
        vote_counting_service_1.VoteCountingService])
], ResultsController);
//# sourceMappingURL=results.controller.js.map