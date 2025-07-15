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
exports.NotificationTestController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_roles_enum_1 = require("../users/enums/user-roles.enum");
let NotificationTestController = class NotificationTestController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async testSms(body) {
        return this.notificationsService.sendSms(body.phoneNumber, body.message);
    }
    async testEmail(body) {
        return this.notificationsService.sendEmail(body.email, body.subject, body.message);
    }
    async testVerificationCode(body) {
        const code = '123456';
        return this.notificationsService.sendVerificationCode(body.phoneNumber, code);
    }
};
exports.NotificationTestController = NotificationTestController;
__decorate([
    (0, common_1.Post)('sms'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "testSms", null);
__decorate([
    (0, common_1.Post)('email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "testEmail", null);
__decorate([
    (0, common_1.Post)('verification-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "testVerificationCode", null);
exports.NotificationTestController = NotificationTestController = __decorate([
    (0, common_1.Controller)('notifications/test'),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRoles.SUPER_ADMIN),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationTestController);
//# sourceMappingURL=notifications.controller.js.map