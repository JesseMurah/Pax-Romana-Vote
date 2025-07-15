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
exports.AdminDashboardController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_roles_enum_1 = require("../../users/enums/user-roles.enum");
const admin_dashboard_service_1 = require("../services/admin-dashboard.service");
const admin_dashboard_dto_1 = require("../dto/admin-dashboard.dto");
const nomination_statistics_service_1 = require("../services/nomination-statistics.service");
let AdminDashboardController = class AdminDashboardController {
    adminDashboardService;
    nominationStatisticsService;
    constructor(adminDashboardService, nominationStatisticsService) {
        this.adminDashboardService = adminDashboardService;
        this.nominationStatisticsService = nominationStatisticsService;
    }
    async getDashboardData() {
        return this.adminDashboardService.getDashboardData();
    }
    async getStatistics(filterDto) {
        return this.nominationStatisticsService.getStatistics(filterDto);
    }
    async getSystemHealth() {
        return this.adminDashboardService.getSystemHealth();
    }
};
exports.AdminDashboardController = AdminDashboardController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dashboard_dto_1.NominationStatsFilterDto]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getSystemHealth", null);
exports.AdminDashboardController = AdminDashboardController = __decorate([
    (0, common_1.Controller)('admin/dashboard'),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRoles.EC_MEMBER, user_roles_enum_1.UserRoles.SUPER_ADMIN),
    __metadata("design:paramtypes", [admin_dashboard_service_1.AdminDashboardService,
        nomination_statistics_service_1.NominationStatisticsService])
], AdminDashboardController);
//# sourceMappingURL=admin-dashboard.controller.js.map