"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const deadline_service_1 = require("./utils/deadline.service");
const ec_consensus_service_1 = require("./utils/ec-consensus.service");
const phone_validation_util_1 = require("./utils/phone-validation.util");
const nomination_deadline_guard_1 = require("./guards/nomination-deadline.guard");
const ec_consensus_guard_1 = require("./guards/ec-consensus.guard");
const exactly_two_guarantors_validator_1 = require("./validators/exactly-two-guarantors.validator");
const knust_phone_validator_1 = require("./validators/knust-phone.validator");
const db_module_1 = require("../../../db/db.module");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [db_module_1.DbModule],
        providers: [
            deadline_service_1.DeadlineService,
            ec_consensus_service_1.EcConsensusService,
            phone_validation_util_1.PhoneValidationUtil,
            nomination_deadline_guard_1.NominationDeadlineGuard,
            ec_consensus_guard_1.EcConsensusGuard,
            exactly_two_guarantors_validator_1.ExactlyTwoGuarantorsConstraint,
            knust_phone_validator_1.IsKnustPhoneConstraint,
        ],
        exports: [
            deadline_service_1.DeadlineService,
            ec_consensus_service_1.EcConsensusService,
            phone_validation_util_1.PhoneValidationUtil,
            nomination_deadline_guard_1.NominationDeadlineGuard,
            ec_consensus_guard_1.EcConsensusGuard,
            exactly_two_guarantors_validator_1.ExactlyTwoGuarantorsConstraint,
            knust_phone_validator_1.IsKnustPhoneConstraint,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map