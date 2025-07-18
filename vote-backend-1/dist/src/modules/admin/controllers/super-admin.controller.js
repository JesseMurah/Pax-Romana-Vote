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
exports.SuperAdminController = void 0;
const admin_service_1 = require("../services/admin.service");
const users_service_1 = require("../../users/users.service");
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_roles_enum_1 = require("../../users/enums/user-roles.enum");
const create_admin_dto_1 = require("../../users/dto/create-admin.dto");
let SuperAdminController = class SuperAdminController {
    adminService;
    userService;
    constructor(adminService, userService) {
        this.adminService = adminService;
        this.userService = userService;
    }
    async getAdminUsers() {
        return this.adminService.getAdminUsers();
    }
    async createAdmin(createAdminDto, req) {
        const result = await this.userService.createAdmin(createAdminDto);
        await this.adminService.logAdminAction(req.user.id, 'CREATE_ADMIN', { newAdminId: result.id, role: createAdminDto.role });
        return result;
    }
    async updateUserStatus(userId, { isActive }, req) {
        const result = await this.userService.updateUserStatus(userId, isActive);
        await this.adminService.logAdminAction(req.user.id, 'UPDATE_USER_STATUS', { targetUserId: userId, isActive });
        return result;
    }
    async getSystemHealth() {
        return this.adminService.getSystemHealth();
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getAdminUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDTO, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Get)('system/health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getSystemHealth", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)('admin/super-admin'),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRoles.SUPER_ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        users_service_1.UsersService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map