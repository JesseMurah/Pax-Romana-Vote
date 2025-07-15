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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominationModule = void 0;
const common_1 = require("@nestjs/common");
const nomination_service_1 = require("./services/nomination.service");
const nomination_submission_controller_1 = require("./controllers/nomination-submission.controller");
const db_1 = require("../../../db");
const deadline_service_1 = require("../common/utils/deadline.service");
const notifications_module_1 = require("../notifications/notifications.module");
const users_service_1 = require("../users/users.service");
const file_upload_module_1 = require("../file-upload/file-upload.module");
let NominationModule = class NominationModule {
    constructor() {
        console.log('NominationsModule dependencies:', { DbModule: !!db_1.DbModule });
    }
};
exports.NominationModule = NominationModule;
exports.NominationModule = NominationModule = __decorate([
    (0, common_1.Module)({
        imports: [db_1.DbModule, notifications_module_1.NotificationsModule, file_upload_module_1.FileUploadModule],
        controllers: [nomination_submission_controller_1.NominationsController],
        providers: [nomination_service_1.NominationService, deadline_service_1.DeadlineService, db_1.PrismaService, users_service_1.UsersService],
        exports: [nomination_service_1.NominationService],
    }),
    __metadata("design:paramtypes", [])
], NominationModule);
//# sourceMappingURL=nomination.module.js.map