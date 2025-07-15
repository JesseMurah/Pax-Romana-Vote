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
exports.EcConsensusGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const ec_consensus_service_1 = require("../utils/ec-consensus.service");
let EcConsensusGuard = class EcConsensusGuard {
    reflector;
    ecConsensusService;
    constructor(reflector, ecConsensusService) {
        this.reflector = reflector;
        this.ecConsensusService = ecConsensusService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const { user, body } = request;
        if (user.role === 'EC_MEMBER' && body.nominationId) {
            const canProceed = await this.ecConsensusService.canMemberVote(user.id, body.nominationId);
            if (!canProceed) {
                throw new common_1.ForbiddenException('You have already voted on this nomination');
            }
        }
        return true;
    }
};
exports.EcConsensusGuard = EcConsensusGuard;
exports.EcConsensusGuard = EcConsensusGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        ec_consensus_service_1.EcConsensusService])
], EcConsensusGuard);
//# sourceMappingURL=ec-consensus.guard.js.map