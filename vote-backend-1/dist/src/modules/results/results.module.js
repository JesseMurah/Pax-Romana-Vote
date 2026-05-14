"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsModule = void 0;
const common_1 = require("@nestjs/common");
const results_service_1 = require("./services/results.service");
const results_controller_1 = require("./results.controller");
const vote_counting_service_1 = require("./services/vote-counting.service");
const certification_service_1 = require("./services/certification.service");
const vote_encryption_service_1 = require("./services/vote-encryption.service");
const export_service_1 = require("./services/export.service");
const db_1 = require("../../../db");
const cache_module_1 = require("../caches/cache.module");
const real_time_module_1 = require("../real-time/real-time.module");
let ResultsModule = class ResultsModule {
};
exports.ResultsModule = ResultsModule;
exports.ResultsModule = ResultsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_1.DbModule,
            cache_module_1.CacheModule,
            real_time_module_1.RealTimeModule,
        ],
        controllers: [results_controller_1.ResultsController],
        providers: [
            results_service_1.ResultsService,
            vote_counting_service_1.VoteCountingService,
            certification_service_1.CertificationService,
            vote_encryption_service_1.VoteEncryptionService,
            export_service_1.ExportService,
        ],
        exports: [
            results_service_1.ResultsService,
            vote_counting_service_1.VoteCountingService,
            certification_service_1.CertificationService,
        ],
    })
], ResultsModule);
//# sourceMappingURL=results.module.js.map