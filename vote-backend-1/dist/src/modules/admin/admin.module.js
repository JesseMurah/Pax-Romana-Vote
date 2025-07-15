"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./services/admin.service");
const nomination_module_1 = require("../nominations/nomination.module");
const users_module_1 = require("../users/users.module");
const notifications_module_1 = require("../notifications/notifications.module");
const super_admin_controller_1 = require("./controllers/super-admin.controller");
const ec_nominations_controller_1 = require("./controllers/ec-nominations.controller");
const admin_dashboard_controller_1 = require("./controllers/admin-dashboard.controller");
const nomination_review_service_1 = require("./services/nomination-review.service");
const ec_consensus_service_1 = require("./services/ec-consensus.service");
const admin_dashboard_service_1 = require("./services/admin-dashboard.service");
const nomination_statistics_service_1 = require("./services/nomination-statistics.service");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            nomination_module_1.NominationModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [
            super_admin_controller_1.SuperAdminController,
            ec_nominations_controller_1.EcNominationsController,
            admin_dashboard_controller_1.AdminDashboardController,
        ],
        providers: [
            admin_service_1.AdminService,
            nomination_review_service_1.NominationReviewService,
            ec_consensus_service_1.EcConsensusService,
            admin_dashboard_service_1.AdminDashboardService,
            nomination_statistics_service_1.NominationStatisticsService,
        ],
        exports: [
            admin_service_1.AdminService,
            nomination_review_service_1.NominationReviewService,
            ec_consensus_service_1.EcConsensusService,
            admin_dashboard_service_1.AdminDashboardService,
        ]
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map