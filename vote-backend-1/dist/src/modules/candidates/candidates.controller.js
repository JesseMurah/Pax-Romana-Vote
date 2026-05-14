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
exports.CandidatesController = void 0;
const common_1 = require("@nestjs/common");
const candidates_service_1 = require("./candidates.service");
const create_candidate_dto_1 = require("./dto/create-candidate.dto");
const update_candidate_dto_1 = require("./dto/update-candidate.dto");
const platform_express_1 = require("@nestjs/platform-express");
const index_1 = require("@prisma/client/index");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let CandidatesController = class CandidatesController {
    candidatesService;
    constructor(candidatesService) {
        this.candidatesService = candidatesService;
    }
    async create(createCandidateDto, nominationId) {
        return {
            statusCode: common_1.HttpStatus.CREATED,
            message: 'Candidate created successfully',
            data: await this.candidatesService.createCandidate(createCandidateDto, nominationId),
        };
    }
    async findAllForAdmin() {
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Candidates retrieved successfully',
            data: await this.candidatesService.getAllCandidates(),
        };
    }
    async findOneForAdmin(id) {
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Candidate retrieved successfully',
            data: await this.candidatesService.getCandidateById(id),
        };
    }
    async update(id, updateCandidateDto) {
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Candidate updated successfully',
            data: await this.candidatesService.updateCandidate(id, updateCandidateDto),
        };
    }
    async remove(id) {
        await this.candidatesService.deleteCandidate(id);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Candidate deleted successfully',
        };
    }
    async uploadPhoto(id, file) {
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Photo uploaded successfully',
            data: {
                photoUrl: await this.candidatesService.uploadCandidatePhoto(id, file)
            },
        };
    }
    async getBallot() {
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Ballot retrieved successfully',
            data: await this.candidatesService.getCandidatesForBallot(),
        };
    }
    async getCandidatesByPosition(position) {
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Candidates retrieved successfully',
            data: await this.candidatesService.getCandidatesByPosition(position),
        };
    }
    async getUnapposedPositions() {
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Unopposed positions retrieved successfully',
            data: await this.candidatesService.getUnapposedPositions(),
        };
    }
};
exports.CandidatesController = CandidatesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('nominationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_candidate_dto_1.CreateCandidateDto, String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "findAllForAdmin", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "findOneForAdmin", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_candidate_dto_1.UpdateCandidateDto]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/photo'),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Get)('ballot'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "getBallot", null);
__decorate([
    (0, common_1.Get)('position/:position'),
    __param(0, (0, common_1.Param)('position')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "getCandidatesByPosition", null);
__decorate([
    (0, common_1.Get)('unopposed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "getUnapposedPositions", null);
exports.CandidatesController = CandidatesController = __decorate([
    (0, common_1.Controller)('candidates'),
    __metadata("design:paramtypes", [candidates_service_1.CandidatesService])
], CandidatesController);
//# sourceMappingURL=candidates.controller.js.map