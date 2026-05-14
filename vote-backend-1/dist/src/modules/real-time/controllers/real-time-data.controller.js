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
exports.RealTimeDataController = void 0;
const dashboard_data_service_1 = require("../services/dashboard-data.service");
const voting_stats_service_1 = require("../services/voting-stats.service");
const anomaly_detection_service_1 = require("../services/anomaly-detection.service");
const real_time_service_1 = require("../services/real-time.service");
const common_1 = require("@nestjs/common");
const index_1 = require("@prisma/client/index");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let RealTimeDataController = class RealTimeDataController {
    votingStatsService;
    anomalyDetectionService;
    dashboardDataService;
    realtimeService;
    constructor(votingStatsService, anomalyDetectionService, dashboardDataService, realtimeService) {
        this.votingStatsService = votingStatsService;
        this.anomalyDetectionService = anomalyDetectionService;
        this.dashboardDataService = dashboardDataService;
        this.realtimeService = realtimeService;
    }
    async getVotingProgress() {
        return this.votingStatsService.getVotingProgress();
    }
    async getPositionStats(position) {
        return this.votingStatsService.getPositionStats(position);
    }
    async getPublicDashboard() {
        return this.dashboardDataService.getPublicDashboardData();
    }
    async getAdminDashboard() {
        return this.dashboardDataService.getAdminDashboardData();
    }
    async getVotingVelocity() {
        return this.votingStatsService.getVotingVelocity();
    }
    async getAnomalies() {
        return this.anomalyDetectionService.detectAnomalies();
    }
    async getConnectionStats() {
        return this.realtimeService.getConnectionStats();
    }
    async refreshCache() {
        await this.votingStatsService.clearStatsCache();
        return { message: 'Cache refreshed successfully' };
    }
};
exports.RealTimeDataController = RealTimeDataController;
__decorate([
    (0, common_1.Get)('voting-progress'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RealTimeDataController.prototype, "getVotingProgress", null);
__decorate([
    (0, common_1.Get)('position/:position'),
    __param(0, (0, common_1.Param)('position')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RealTimeDataController.prototype, "getPositionStats", null);
__decorate([
    (0, common_1.Get)('public-dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RealTimeDataController.prototype, "getPublicDashboard", null);
__decorate([
    (0, common_1.Get)('admin-dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RealTimeDataController.prototype, "getAdminDashboard", null);
__decorate([
    (0, common_1.Get)('voting-velocity'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RealTimeDataController.prototype, "getVotingVelocity", null);
__decorate([
    (0, common_1.Get)('anomalies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RealTimeDataController.prototype, "getAnomalies", null);
__decorate([
    (0, common_1.Get)('connection-stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RealTimeDataController.prototype, "getConnectionStats", null);
__decorate([
    (0, common_1.Get)('refresh-cache'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RealTimeDataController.prototype, "refreshCache", null);
exports.RealTimeDataController = RealTimeDataController = __decorate([
    (0, common_1.Controller)('real-time-data'),
    __metadata("design:paramtypes", [voting_stats_service_1.VotingStatsService,
        anomaly_detection_service_1.AnomalyDetectionService,
        dashboard_data_service_1.DashboardDataService,
        real_time_service_1.RealTimeService])
], RealTimeDataController);
//# sourceMappingURL=real-time-data.controller.js.map