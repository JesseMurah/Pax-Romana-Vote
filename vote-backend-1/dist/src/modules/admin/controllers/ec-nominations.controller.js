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
exports.EcNominationsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_roles_enum_1 = require("../../users/enums/user-roles.enum");
const nomination_review_service_1 = require("../services/nomination-review.service");
const ec_consensus_service_1 = require("../services/ec-consensus.service");
const nomination_review_dto_1 = require("../dto/nomination-review.dto");
let EcNominationsController = class EcNominationsController {
    nominationReviewService;
    ecConsensusService;
    constructor(nominationReviewService, ecConsensusService) {
        this.nominationReviewService = nominationReviewService;
        this.ecConsensusService = ecConsensusService;
    }
    async getNominationsForReview(req) {
        return this.nominationReviewService.getNominationsForReview(req.user.id);
    }
    async reviewNomination(reviewDto, req) {
        return this.nominationReviewService.reviewNomination(reviewDto, req.user.id);
    }
    async bulkReviewNominations(bulkReviewDto, req) {
        return this.nominationReviewService.bulkReviewNominations(bulkReviewDto, req.user.id);
    }
    async getConsensusStatus(nominationId) {
        return this.ecConsensusService.checkConsensus(nominationId);
    }
    async getAllConsensusStatuses() {
        return this.ecConsensusService.getAllConsensusStatuses();
    }
};
exports.EcNominationsController = EcNominationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EcNominationsController.prototype, "getNominationsForReview", null);
__decorate([
    (0, common_1.Post)('review'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nomination_review_dto_1.NominationReviewDto, Object]),
    __metadata("design:returntype", Promise)
], EcNominationsController.prototype, "reviewNomination", null);
__decorate([
    (0, common_1.Post)('bulk-review'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nomination_review_dto_1.BulkNominationReviewDto, Object]),
    __metadata("design:returntype", Promise)
], EcNominationsController.prototype, "bulkReviewNominations", null);
__decorate([
    (0, common_1.Get)('consensus/:nominationId'),
    __param(0, (0, common_1.Param)('nominationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EcNominationsController.prototype, "getConsensusStatus", null);
__decorate([
    (0, common_1.Get)('consensus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EcNominationsController.prototype, "getAllConsensusStatuses", null);
exports.EcNominationsController = EcNominationsController = __decorate([
    (0, common_1.Controller)('admin/ec/nominations'),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRoles.EC_MEMBER, user_roles_enum_1.UserRoles.SUPER_ADMIN),
    __metadata("design:paramtypes", [nomination_review_service_1.NominationReviewService,
        ec_consensus_service_1.EcConsensusService])
], EcNominationsController);
//# sourceMappingURL=ec-nominations.controller.js.map