"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeModule = void 0;
const common_1 = require("@nestjs/common");
const real_time_service_1 = require("./services/real-time.service");
const db_1 = require("../../../db");
const cache_module_1 = require("../caches/cache.module");
const real_time_controller_1 = require("./controllers/real-time.controller");
const real_time_data_controller_1 = require("./controllers/real-time-data.controller");
const voting_stats_service_1 = require("./services/voting-stats.service");
const anomaly_detection_service_1 = require("./services/anomaly-detection.service");
const dashboard_data_service_1 = require("./services/dashboard-data.service");
let RealTimeModule = class RealTimeModule {
};
exports.RealTimeModule = RealTimeModule;
exports.RealTimeModule = RealTimeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_1.DbModule,
            cache_module_1.CacheModule,
        ],
        controllers: [
            real_time_controller_1.RealTimeController,
            real_time_data_controller_1.RealTimeDataController,
        ],
        providers: [
            real_time_service_1.RealTimeService,
            voting_stats_service_1.VotingStatsService,
            anomaly_detection_service_1.AnomalyDetectionService,
            dashboard_data_service_1.DashboardDataService,
        ],
        exports: [
            real_time_service_1.RealTimeService,
            voting_stats_service_1.VotingStatsService,
            anomaly_detection_service_1.AnomalyDetectionService,
            dashboard_data_service_1.DashboardDataService,
        ]
    })
], RealTimeModule);
//# sourceMappingURL=real-time.module.js.map