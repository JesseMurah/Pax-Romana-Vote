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
var RealTimeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeController = void 0;
const common_1 = require("@nestjs/common");
const index_1 = require("@prisma/client/index");
const real_time_service_1 = require("../services/real-time.service");
const uuid_1 = require("uuid");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
let RealTimeController = RealTimeController_1 = class RealTimeController {
    realtimeService;
    logger = new common_1.Logger(RealTimeController_1.name);
    constructor(realtimeService) {
        this.realtimeService = realtimeService;
    }
    votingProgressStream(req, res) {
        const clientId = (0, uuid_1.v4)();
        const connectionInfo = {
            clientId,
            role: index_1.UserRole.VOTER,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
        };
        this.realtimeService.addClient(connectionInfo, res);
        this.logger.log(`Public voting progress stream connected: ${clientId}`);
    }
    adminDashboardStream(req, res, user) {
        const clientId = (0, uuid_1.v4)();
        const connectionInfo = {
            clientId,
            userId: user.id,
            role: user.role,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
        };
        this.realtimeService.addClient(connectionInfo, res);
        this.logger.log(`Admin dashboard stream connected: ${clientId} (User: ${user.id})`);
    }
    resultsStream(req, res, user, position) {
        const clientId = (0, uuid_1.v4)();
        const connectionInfo = {
            clientId,
            userId: user.id,
            role: user.role,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
        };
        this.realtimeService.addClient(connectionInfo, res);
        this.logger.log(`Results stream connected: ${clientId} (Position: ${position || 'all'})`);
    }
    systemMonitorStream(req, res, user) {
        const clientId = (0, uuid_1.v4)();
        const connectionInfo = {
            clientId,
            userId: user.id,
            role: user.role,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
        };
        this.realtimeService.addClient(connectionInfo, res);
        this.logger.log(`System monitor stream connected: ${clientId}`);
    }
};
exports.RealTimeController = RealTimeController;
__decorate([
    (0, common_1.Get)('voting-progress'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RealTimeController.prototype, "votingProgressStream", null);
__decorate([
    (0, common_1.Get)('admin-dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RealTimeController.prototype, "adminDashboardStream", null);
__decorate([
    (0, common_1.Get)('results'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Query)('position')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", void 0)
], RealTimeController.prototype, "resultsStream", null);
__decorate([
    (0, common_1.Get)('system-monitor'),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RealTimeController.prototype, "systemMonitorStream", null);
exports.RealTimeController = RealTimeController = RealTimeController_1 = __decorate([
    (0, common_1.Controller)('real-time'),
    __metadata("design:paramtypes", [real_time_service_1.RealTimeService])
], RealTimeController);
//# sourceMappingURL=real-time.controller.js.map