"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminOnlyGuard = void 0;
const common_1 = require("@nestjs/common");
const user_roles_enum_1 = require("../../users/enums/user-roles.enum");
let SuperAdminOnlyGuard = class SuperAdminOnlyGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || user.role !== user_roles_enum_1.UserRoles.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Super Admin access required');
        }
        return true;
    }
};
exports.SuperAdminOnlyGuard = SuperAdminOnlyGuard;
exports.SuperAdminOnlyGuard = SuperAdminOnlyGuard = __decorate([
    (0, common_1.Injectable)()
], SuperAdminOnlyGuard);
//# sourceMappingURL=super-admin-only.guard.js.map